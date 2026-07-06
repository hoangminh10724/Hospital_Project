const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc Get all medical records
// @route GET /api/medical-records
// @access Private/Admin
exports.getMedicalRecords = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await MedicalRecord.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const medicalRecords = await MedicalRecord.find()
            .populate('patient_id', 'first_name last_name')
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('appointment_id')
            .skip(startIndex)
            .limit(limit)
            .sort('-record_date');

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: medicalRecords
        });
    } catch (err) {
        console.error('Error in getMedicalRecords:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Get single medical record
// @route GET /api/medical-records/:id
// @access Private
exports.getMedicalRecord = async (req, res, next) => {
    try {
        const medicalRecord = await MedicalRecord.findById(req.params.id)
            .populate('patient_id', 'first_name last_name email phone')
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('appointment_id');

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ bệnh án'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            // SỬA LỖI: So sánh đúng kiểu dữ liệu
            if (req.user.reference_id.toString() !== medicalRecord.patient_id._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }
        } else if (req.user.role === 'doctor') {
            if (req.user.reference_id.toString() !== medicalRecord.doctor_id._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }
        }

        res.status(200).json({
            success: true,
            data: medicalRecord
        });
    } catch (err) {
        console.error('Error in getMedicalRecord:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Create new medical record
// @route POST /api/medical-records
// @access Private/Doctor
exports.createMedicalRecord = async (req, res, next) => {
    try {
        // Set doctor_id if user is doctor
        if (req.user.role === 'doctor') {
            req.body.doctor_id = req.user.reference_id;
        }

        const medicalRecord = await MedicalRecord.create(req.body);

        res.status(201).json({
            success: true,
            data: medicalRecord
        });
    } catch (err) {
        console.error('Error in createMedicalRecord:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Update medical record
// @route PUT /api/medical-records/:id
// @access Private/Doctor
exports.updateMedicalRecord = async (req, res, next) => {
    try {
        let medicalRecord = await MedicalRecord.findById(req.params.id);

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hồ sơ bệnh án'
            });
        }

        // Check authorization
        if (req.user.role === 'doctor') {
            if (req.user.reference_id.toString() !== medicalRecord.doctor_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền cập nhật'
                });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật'
            });
        }

        medicalRecord = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: medicalRecord
        });
    } catch (err) {
        console.error('Error in updateMedicalRecord:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Get medical records by patient
// @route GET /api/medical-records/patient/:patientId
// @access Private
exports.getMedicalRecordsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        console.log('=== DEBUG MEDICAL RECORDS BY PATIENT ===');
        console.log('Requested patient ID:', patientId);
        console.log('User role:', req.user.role);
        console.log('User reference_id:', req.user.reference_id);

        // SỬA LỖI: Kiểm tra quyền truy cập đúng cách
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== patientId.toString()) {
                console.log('Access denied: reference_id mismatch');
                console.log('User reference_id:', req.user.reference_id.toString());
                console.log('Requested patient ID:', patientId.toString());
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể xem hồ sơ bệnh án của chính mình'
                });
            }
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await MedicalRecord.countDocuments({ patient_id: patientId });
        console.log('Total medical records found:', total);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const medicalRecords = await MedicalRecord.find({ patient_id: patientId })
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('patient_id', 'first_name last_name')
            .populate('appointment_id')
            .skip(startIndex)
            .limit(limit)
            .sort('-record_date');

        console.log('Medical records retrieved:', medicalRecords.length);
        if (medicalRecords.length > 0) {
            console.log('Sample record:', {
                id: medicalRecords[0]._id,
                patient_id: medicalRecords[0].patient_id,
                doctor_id: medicalRecords[0].doctor_id,
                record_date: medicalRecords[0].record_date
            });
        }

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            count: medicalRecords.length,
            pagination,
            data: medicalRecords
        });
    } catch (err) {
        console.error('Error in getMedicalRecordsByPatient:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
