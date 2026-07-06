const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Vui lòng nhập tên đăng nhập'],
        unique: true
    },
    password_hash: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'patient'],
        default: 'patient'
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role_model'
    },
    role_model: {
        type: String,
        enum: ['Doctor', 'Patient'],
        required: function () {
            return this.role !== 'admin';
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password if it's changed and not already hashed
UserSchema.pre('save', async function (next) {
    try {
        // Skip hashing if password_hash hasn't changed
        if (!this.isModified('password_hash')) {
            return next();
        }

        // Check if password_hash is already hashed (length >= 60 for bcrypt hash)
        if (this.password_hash.length >= 60) {
            return next();
        }

        // Log for debugging
        console.log('Hashing password for user:', this.username);

        // Hash password with new salt
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);

        console.log('Password hashed successfully');
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error);
    }
});

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('User', UserSchema);
