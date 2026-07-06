const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin
exports.getPatients = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Patient.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        // Query with pagination
        const patients = await Patient.find()
            .skip(startIndex)
            .limit(limit)
            .sort('last_name');

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
            data: patients
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bệnh nhân'
            });
        }

        // Check if user is admin or the patient themselves
        if (req.user.role !== 'admin' &&
            (req.user.role !== 'patient' || req.user.reference_id.toString() !== patient._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private/Admin
exports.createPatient = async (req, res, next) => {
    try {
        const patient = await Patient.create(req.body);

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Admin or Patient
exports.updatePatient = async (req, res, next) => {
    try {
        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bệnh nhân'
            });
        }

        // Check if user is admin or the patient themselves
        if (req.user.role !== 'admin' &&
            (req.user.role !== 'patient' || req.user.reference_id.toString() !== patient._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật'
            });
        }

        patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
exports.deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bệnh nhân'
            });
        }

        await patient.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
