const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

// Hàm khởi tạo tài khoản admin mặc định
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            await User.create({
                username: 'admin',
                password_hash: hashedPassword,
                role: 'admin',
                email: 'admin@hospital.com',
                first_name: 'Admin',
                last_name: 'System'
            });
            console.log('Tài khoản admin mặc định đã được tạo');
        }
    } catch (error) {
        console.error('Lỗi khi tạo tài khoản admin:', error);
    }
};

setTimeout(createDefaultAdmin, 1000);

// @desc Register user
// @route POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
    try {
        const { username, password, role, email, first_name, last_name } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }

        if (role === 'patient') {
            const patient = await Patient.create({
                first_name, last_name, email,
                dob: req.body.dob, gender: req.body.gender,
                phone: req.body.phone, address: req.body.address,
                emergency_contact: req.body.emergency_contact
            });

            const user = await User.create({
                username, password_hash: password, role, email,
                first_name, last_name, reference_id: patient._id, role_model: 'Patient'
            });

            sendTokenResponse(user, 201, res);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Đăng ký chỉ dành cho bệnh nhân'
            });
        }
    } catch (err) {
        console.error('Register error:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Get user
        const user = await User.findOne({ username }).select('+password_hash');
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản hoặc mật khẩu không chính xác'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản hoặc mật khẩu không chính xác'
            });
        }

        // Create token
        const token = user.getSignedJwtToken();

        console.log('Login successful for user:', {
            id: user._id,
            username: user.username,
            role: user.role
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                reference_id: user.reference_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// @desc Get current logged in user
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        let profile = null;
        if (user.role === 'doctor' && user.reference_id) {
            profile = await Doctor.findById(user.reference_id).populate('department_id');
        } else if (user.role === 'patient' && user.reference_id) {
            profile = await Patient.findById(user.reference_id);
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    reference_id: user.reference_id
                },
                profile
            }
        });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Change password
// @route PUT /api/auth/change-password
// @access Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới'
            });
        }

        const user = await User.findById(req.user.id).select('+password_hash');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        user.password_hash = newPassword;
        await user.save();
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Change password error:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc Logout user
// @route POST /api/auth/logout
// @access Private
exports.logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Helper function: Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    try {
        const token = user.getSignedJwtToken();

        const options = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        if (process.env.NODE_ENV === 'production') {
            options.secure = true;
        }

        console.log(`Token generated for user: ${user.username}, role: ${user.role}, reference_id: ${user.reference_id}`);

        res.status(statusCode)
            .cookie('token', token, options)
            .json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    reference_id: user.reference_id
                }
            });
    } catch (error) {
        console.error('Error in sendTokenResponse:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo token'
        });
    }
};

// @desc Get user by reference ID
// @route GET /api/auth/user-by-reference/:referenceId
// @access Private/Admin
exports.getUserByReference = async (req, res, next) => {
    try {
        const user = await User.findOne({
            reference_id: req.params.referenceId,
            role: 'doctor'
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user by reference error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
