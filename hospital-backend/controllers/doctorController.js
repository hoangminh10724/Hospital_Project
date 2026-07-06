const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

// Custom async handler
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// @desc Get all doctors
// @route GET /api/doctors
// @access Public
exports.getDoctors = asyncHandler(async (req, res, next) => {
    console.log('=== GET ALL DOCTORS API CALLED ===');

    // Validate and sanitize query parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const startIndex = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.specialization) {
        filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }
    if (req.query.department_id && mongoose.Types.ObjectId.isValid(req.query.department_id)) {
        filter.department_id = req.query.department_id;
    }

    // Execute queries in parallel
    const [total, doctors] = await Promise.all([
        Doctor.countDocuments(filter),
        Doctor.find(filter)
            .populate({
                path: 'department_id',
                select: 'name description location phone',
                options: { lean: true }
            })
            .select('-__v')
            .skip(startIndex)
            .limit(limit)
            .sort({ last_name: 1, first_name: 1 })
            .lean()
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${doctors.length} doctors out of ${total} total`);

    const pagination = {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    res.status(200).json({
        success: true,
        pagination,
        data: doctors
    });
});

// @desc Get single doctor with related data
// @route GET /api/doctors/:id
// @access Public
exports.getDoctor = asyncHandler(async (req, res, next) => {
    console.log('=== GET DOCTOR WITH RELATED DATA ===');
    console.log('Doctor ID:', req.params.id);

    const doctorId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new AppError('ID bác sĩ không hợp lệ', 400);
    }

    // Get doctor with department info
    const doctor = await Doctor.findById(doctorId)
        .populate({
            path: 'department_id',
            select: 'name description location phone'
        })
        .lean();

    if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404);
    }

    console.log('Found doctor:', doctor.first_name, doctor.last_name);

    // Execute related data queries in parallel
    const [userData, appointmentStats, recentAppointments, totalPatients] = await Promise.all([
        // Get user data
        User.findOne({
            reference_id: doctor._id,
            role: 'doctor'
        }).select('-password_hash').lean(),

        // Get appointment statistics
        Appointment.aggregate([
            {
                $match: {
                    doctor_id: new mongoose.Types.ObjectId(doctor._id)
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]),

        // Get recent appointments
        Appointment.find({
            doctor_id: doctor._id
        })
            .populate('patient_id', 'first_name last_name phone email')
            .select('appointment_date start_time reason status patient_id')
            .sort({ appointment_date: -1, createdAt: -1 })
            .limit(10)
            .lean(),

        // Get unique patients count
        Appointment.distinct('patient_id', {
            doctor_id: doctor._id,
            status: 'completed'
        })
    ]);

    console.log('Appointment stats:', appointmentStats);
    console.log('Recent appointments:', recentAppointments.length);
    console.log('Total unique patients:', totalPatients.length);

    // Calculate statistics
    const statistics = {
        totalAppointments: appointmentStats.reduce((sum, stat) => sum + stat.count, 0),
        pendingAppointments: appointmentStats.find(s => s._id === 'pending')?.count || 0,
        confirmedAppointments: appointmentStats.find(s => s._id === 'confirmed')?.count || 0,
        completedAppointments: appointmentStats.find(s => s._id === 'completed')?.count || 0,
        cancelledAppointments: appointmentStats.find(s => s._id === 'cancelled')?.count || 0,
        totalPatients: totalPatients.length
    };

    // Compile response data
    const doctorData = {
        ...doctor,
        user: userData,
        statistics,
        recentAppointments
    };

    console.log('Doctor data compiled successfully');

    res.status(200).json({
        success: true,
        data: doctorData
    });
});

// @desc Create new doctor (Admin only)
// @route POST /api/doctors
// @access Private/Admin
exports.createDoctor = asyncHandler(async (req, res, next) => {
    console.log('=== CREATE DOCTOR API CALLED ===');

    const {
        username, password, email, first_name, last_name,
        phone, specialization, department_id, license_number, experience_years
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !first_name || !last_name || !specialization) {
        throw new AppError('Vui lòng điền đầy đủ thông tin bắt buộc', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError('Email không hợp lệ', 400);
    }

    // Check for existing username and email in parallel
    const [existingUser, existingUserEmail] = await Promise.all([
        User.findOne({ username }).lean(),
        User.findOne({ email }).lean()
    ]);

    if (existingUser) {
        throw new AppError('Tên đăng nhập đã tồn tại', 409);
    }

    if (existingUserEmail) {
        throw new AppError('Email đã tồn tại trong hệ thống', 409);
    }

    try {
        // Create doctor first
        const doctor = await Doctor.create({
            first_name,
            last_name,
            email,
            phone,
            specialization,
            department_id: department_id || null,
            license_number,
            experience_years: experience_years || 0
        });

        console.log('Doctor created:', doctor._id);

        try {
            // Create user with reference to doctor
            const user = await User.create({
                username,
                password_hash: password, // Will be hashed by the User model middleware
                role: 'doctor',
                email,
                first_name,
                last_name,
                reference_id: doctor._id,
                role_model: 'Doctor'
            });

            console.log('User created:', user._id);

            // Return created data without sensitive info
            const responseData = {
                doctor: {
                    _id: doctor._id,
                    first_name: doctor.first_name,
                    last_name: doctor.last_name,
                    email: doctor.email,
                    specialization: doctor.specialization
                },
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                }
            };

            res.status(201).json({
                success: true,
                message: 'Tạo bác sĩ thành công',
                data: responseData
            });

        } catch (userError) {
            // If user creation fails, delete the doctor and rethrow
            await Doctor.findByIdAndDelete(doctor._id);
            throw userError;
        }
    } catch (error) {
        throw new AppError(
            error.message || 'Không thể tạo tài khoản bác sĩ',
            error.statusCode || 500
        );
    }
});

// @desc Update doctor
// @route PUT /api/doctors/:id
// @access Private/Admin&Doctor
exports.updateDoctor = asyncHandler(async (req, res, next) => {
    console.log('=== UPDATE DOCTOR API CALLED ===');
    console.log('Doctor ID:', req.params.id);

    const doctorId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new AppError('ID bác sĩ không hợp lệ', 400);
    }

    // Define updatable fields
    const updateFields = [
        'first_name', 'last_name', 'phone', 'email',
        'specialization', 'department_id', 'license_number', 'experience_years'
    ];

    // Filter and validate update data
    const updateData = {};
    updateFields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
            if (field === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(req.body[field])) {
                    throw new AppError('Email không hợp lệ', 400);
                }
            }
            updateData[field] = req.body[field];
        }
    });

    if (Object.keys(updateData).length === 0) {
        throw new AppError('Không có dữ liệu để cập nhật', 400);
    }

    console.log('Filtered update data:', updateData);

    // Check if email is being changed and already exists
    if (updateData.email) {
        const existingEmail = await User.findOne({
            email: updateData.email,
            reference_id: { $ne: doctorId }
        }).lean();

        if (existingEmail) {
            throw new AppError('Email đã tồn tại trong hệ thống', 409);
        }
    }

    // Update doctor
    const doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        updateData,
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    ).populate('department_id', 'name description location phone');

    if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ để cập nhật', 404);
    }

    console.log('Doctor updated successfully');

    // Sync data with User model if necessary
    if (updateData.first_name || updateData.last_name || updateData.email) {
        const userUpdateData = {};
        if (updateData.first_name) userUpdateData.first_name = updateData.first_name;
        if (updateData.last_name) userUpdateData.last_name = updateData.last_name;
        if (updateData.email) userUpdateData.email = updateData.email;

        console.log('Updating user data:', userUpdateData);

        const updatedUser = await User.findOneAndUpdate(
            { reference_id: doctor._id, role: 'doctor' },
            userUpdateData,
            { new: true }
        );

        console.log('User updated:', !!updatedUser);
    }

    res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: doctor
    });
});

// @desc Delete doctor
// @route DELETE /api/doctors/:id
// @access Private/Admin
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
    console.log('=== DELETE DOCTOR API CALLED ===');
    console.log('Doctor ID:', req.params.id);

    const doctorId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        throw new AppError('ID bác sĩ không hợp lệ', 400);
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ để xóa', 404);
    }

    // Check if doctor has appointments
    const appointmentCount = await Appointment.countDocuments({
        doctor_id: doctorId,
        status: { $in: ['pending', 'confirmed'] }
    });

    if (appointmentCount > 0) {
        throw new AppError('Không thể xóa bác sĩ có lịch hẹn đang hoạt động', 400);
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Delete related user first
        await User.findOneAndDelete({
            reference_id: doctorId,
            role: 'doctor'
        }).session(session);

        console.log('Related user deleted');

        // Delete doctor
        await Doctor.findByIdAndDelete(doctorId).session(session);

        console.log('Doctor deleted successfully');

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Xóa bác sĩ thành công',
            data: {}
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc Get doctors by department
// @route GET /api/doctors/department/:departmentId
// @access Public
exports.getDoctorsByDepartment = asyncHandler(async (req, res, next) => {
    console.log('=== GET DOCTORS BY DEPARTMENT API CALLED ===');
    console.log('Department ID:', req.params.departmentId);

    const departmentId = req.params.departmentId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        throw new AppError('ID phòng ban không hợp lệ', 400);
    }

    // Validate and sanitize query parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const startIndex = (page - 1) * limit;

    // Execute queries in parallel
    const [total, doctors] = await Promise.all([
        Doctor.countDocuments({ department_id: departmentId }),
        Doctor.find({ department_id: departmentId })
            .populate('department_id', 'name description location phone')
            .select('-__v')
            .skip(startIndex)
            .limit(limit)
            .sort({ last_name: 1, first_name: 1 })
            .lean()
    ]);

    const totalPages = Math.ceil(total / limit);

    console.log(`Found ${doctors.length} doctors in department`);

    const pagination = {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };

    res.status(200).json({
        success: true,
        pagination,
        data: doctors
    });
});

// @desc Search doctors
// @route GET /api/doctors/search
// @access Public
exports.searchDoctors = asyncHandler(async (req, res, next) => {
    console.log('=== SEARCH DOCTORS API CALLED ===');

    const { q, specialization, department } = req.query;

    if (!q || q.trim().length < 2) {
        throw new AppError('Từ khóa tìm kiếm phải có ít nhất 2 ký tự', 400);
    }

    // Build search query
    const searchQuery = {
        $or: [
            { first_name: { $regex: q.trim(), $options: 'i' } },
            { last_name: { $regex: q.trim(), $options: 'i' } },
            { specialization: { $regex: q.trim(), $options: 'i' } }
        ]
    };

    // Add filters
    if (specialization) {
        searchQuery.specialization = { $regex: specialization, $options: 'i' };
    }

    if (department && mongoose.Types.ObjectId.isValid(department)) {
        searchQuery.department_id = department;
    }

    const doctors = await Doctor.find(searchQuery)
        .populate('department_id', 'name')
        .select('first_name last_name specialization email phone department_id')
        .limit(20)
        .lean();

    console.log(`Found ${doctors.length} doctors matching search criteria`);

    res.status(200).json({
        success: true,
        data: doctors
    });
});

// Global error handler
exports.errorHandler = (error, req, res, next) => {
    console.error(`Controller Error: ${error.message}`);
    console.error(error.stack);

    // Default error
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Lỗi server';

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(error.errors).map(val => val.message).join(', ');
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        statusCode = 409;
        const field = Object.keys(error.keyValue)[0];
        message = `${field} đã tồn tại trong hệ thống`;
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'ID không hợp lệ';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
