const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc Get all appointments
// @route GET /api/appointments
// @access Private (Admin/Doctor/Patient)
exports.getAppointments = async (req, res, next) => {
    try {
        console.log('=== GET APPOINTMENTS API CALLED ===');
        console.log('Query params:', req.query);
        console.log('User:', req.user ? `${req.user.username} (${req.user.role})` : 'null');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User không được xác thực'
            });
        }

        let query = {};

        // ✅ SỬA LỖI: Phân quyền theo role - chỉ sửa lỗi logic nhỏ
        if (req.user.role === 'patient') {
            query.patient_id = req.user.reference_id;
        } else if (req.user.role === 'doctor') {
            // ✅ SỬA LỖI: Kiểm tra req.query.doctor_id tồn tại trước khi so sánh
            if (req.query.doctor_id && req.query.doctor_id !== req.user.reference_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bác sĩ chỉ có thể xem lịch hẹn của chính mình'
                });
            }
            // ✅ SỬA LỖI: Luôn set doctor_id = reference_id của user
            query.doctor_id = req.user.reference_id;
        } else if (req.user.role === 'admin') {
            // Admin có thể xem tất cả, áp dụng filter từ query params
            if (req.query.doctor_id) {
                query.doctor_id = req.query.doctor_id;
            }
            if (req.query.patient_id) {
                query.patient_id = req.query.patient_id;
            }
        }

        // Filter by status if provided
        if (req.query.status) {
            query.status = req.query.status;
        }

        console.log('Final query filter:', query);

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Appointment.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // ✅ SỬA LỖI: Đảm bảo populate không gây lỗi
        const appointments = await Appointment.find(query)
            .populate('patient_id', 'first_name last_name phone email')
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('department_id', 'name')
            .skip(startIndex)
            .limit(limit)
            .sort({ appointment_date: -1, createdAt: -1 });

        console.log(`Found ${appointments.length} appointments for user ${req.user.username}`);

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
            data: appointments
        });
    } catch (err) {
        // ✅ SỬA LỖI: Đảm bảo error handling đầy đủ
        console.error('Error in getAppointments:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Get single appointment
// @route GET /api/appointments/:id
// @access Private
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient_id', 'first_name last_name email phone')
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('department_id', 'name');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch hẹn'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== appointment.patient_id._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }
        } else if (req.user.role === 'doctor') {
            if (req.user.reference_id.toString() !== appointment.doctor_id._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }
        }
        // Admin có thể xem tất cả

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        console.error('Error in getAppointment:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Create new appointment
// @route POST /api/appointments
// @access Private
exports.createAppointment = async (req, res, next) => {
    try {
        const { submission_token, ...appointmentData } = req.body;

        console.log('=== CREATE APPOINTMENT ===');
        console.log('Submission token:', submission_token);
        console.log('User role:', req.user.role);
        console.log('Appointment data:', appointmentData);

        // Check duplicate submission token trước
        if (submission_token) {
            const existingByToken = await Appointment.findOne({
                submission_token: submission_token
            });

            if (existingByToken) {
                console.log('Duplicate submission token detected, returning existing appointment');
                return res.status(200).json({
                    success: true,
                    message: 'Lịch hẹn đã được tạo trước đó',
                    data: existingByToken
                });
            }
        }

        // Set patient_id if user is patient
        if (req.user.role === 'patient') {
            appointmentData.patient_id = req.user.reference_id;
        }

        // Check duplicate appointment trong cùng thời gian
        const duplicateCheck = await Appointment.findOne({
            doctor_id: appointmentData.doctor_id,
            appointment_date: appointmentData.appointment_date,
            start_time: appointmentData.start_time,
            patient_id: appointmentData.patient_id,
            status: { $ne: 'cancelled' }
        });

        if (duplicateCheck) {
            console.log('Duplicate appointment found:', duplicateCheck._id);
            return res.status(200).json({
                success: true,
                message: 'Lịch hẹn trong thời gian này đã tồn tại',
                data: duplicateCheck
            });
        }

        // Thêm submission_token vào data
        if (submission_token) {
            appointmentData.submission_token = submission_token;
        }

        console.log('Creating new appointment...');
        const appointment = await Appointment.create(appointmentData);
        console.log('Appointment created successfully:', appointment._id);

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        console.error('Error in createAppointment:', err);

        // ✅ SỬA LỖI: Handle duplicate key error từ MongoDB
        if (err.code === 11000) {
            console.log('MongoDB duplicate key error:', err.keyPattern);
            if (err.keyPattern && err.keyPattern.submission_token) {
                return res.status(200).json({
                    success: true,
                    message: 'Lịch hẹn đã được tạo trước đó',
                    data: null
                });
            } else if (err.keyPattern && err.keyPattern.doctor_id) {
                return res.status(409).json({
                    success: false,
                    message: 'Thời gian này đã có lịch hẹn khác với bác sĩ này'
                });
            }
        }

        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Update appointment
// @route PUT /api/appointments/:id
// @access Private
exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch hẹn'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== appointment.patient_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền cập nhật'
                });
            }
        } else if (req.user.role === 'doctor') {
            if (req.user.reference_id.toString() !== appointment.doctor_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền cập nhật'
                });
            }
        }
        // Admin có thể cập nhật tất cả

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (err) {
        console.error('Error in updateAppointment:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Delete appointment
// @route DELETE /api/appointments/:id
// @access Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        console.log('=== DELETE APPOINTMENT ===');
        console.log('Appointment ID:', appointmentId);
        console.log('User:', req.user.username, req.user.role);

        // Tìm appointment trước khi xóa
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            console.log('Appointment not found:', appointmentId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lịch hẹn'
            });
        }

        // Kiểm tra quyền xóa
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== appointment.patient_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa lịch hẹn này'
                });
            }
        } else if (req.user.role === 'doctor') {
            if (req.user.reference_id.toString() !== appointment.doctor_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền xóa lịch hẹn này'
                });
            }
        }
        // Admin có thể xóa tất cả

        // ✅ SỬA LỖI: Sử dụng deleteOne() thay vì remove()
        const deleteResult = await Appointment.deleteOne({ _id: appointmentId });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không thể xóa lịch hẹn'
            });
        }

        console.log('Appointment deleted successfully:', appointmentId);
        res.status(200).json({
            success: true,
            message: 'Xóa lịch hẹn thành công',
            data: { deletedId: appointmentId }
        });
    } catch (err) {
        console.error('Error deleting appointment:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa lịch hẹn: ' + err.message
        });
    }
};

// ✅ GIỮ NGUYÊN CÁC HÀM CŨ - Không thay đổi logic
exports.getAppointmentsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        console.log('=== GET APPOINTMENTS BY PATIENT ===');
        console.log('Patient ID:', patientId);

        // Check authorization
        if (req.user.role === 'patient' && req.user.reference_id.toString() !== patientId) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Appointment.countDocuments({ patient_id: patientId });
        const totalPages = Math.ceil(total / limit);

        const appointments = await Appointment.find({ patient_id: patientId })
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('department_id', 'name')
            .skip(startIndex)
            .limit(limit)
            .sort('-appointment_date');

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: appointments
        });
    } catch (err) {
        console.error('Error in getAppointmentsByPatient:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getAppointmentsByDoctor = async (req, res, next) => {
    try {
        // Check authorization
        if (req.user.role === 'doctor' && req.user.reference_id.toString() !== req.params.doctorId) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập'
            });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Appointment.countDocuments({ doctor_id: req.params.doctorId });
        const totalPages = Math.ceil(total / limit);

        const appointments = await Appointment.find({ doctor_id: req.params.doctorId })
            .populate('patient_id', 'first_name last_name')
            .populate('department_id', 'name')
            .skip(startIndex)
            .limit(limit)
            .sort('-appointment_date');

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: appointments
        });
    } catch (err) {
        console.error('Error in getAppointmentsByDoctor:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getAppointmentsByDate = async (req, res, next) => {
    try {
        const date = new Date(req.params.date);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Appointment.countDocuments({
            appointment_date: {
                $gte: date,
                $lt: nextDay
            }
        });

        const totalPages = Math.ceil(total / limit);

        const appointments = await Appointment.find({
            appointment_date: {
                $gte: date,
                $lt: nextDay
            }
        })
            .populate('patient_id', 'first_name last_name')
            .populate('doctor_id', 'first_name last_name')
            .populate('department_id', 'name')
            .skip(startIndex)
            .limit(limit)
            .sort('start_time');

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: appointments
        });
    } catch (err) {
        console.error('Error in getAppointmentsByDate:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
