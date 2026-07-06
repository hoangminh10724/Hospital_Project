const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        trim: true,
        maxLength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    last_name: {
        type: String,
        required: [true, 'Vui lòng nhập họ'],
        trim: true,
        maxLength: [50, 'Họ không được vượt quá 50 ký tự']
    },
    specialization: {
        type: String,
        required: [true, 'Vui lòng nhập chuyên môn'],
        trim: true
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Số điện thoại không hợp lệ (phải có 10 chữ số)']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    license_number: {
        type: String,
        trim: true
    },
    experience_years: {
        type: Number,
        min: [0, 'Số năm kinh nghiệm không được âm']
    },
    profile_image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    bio: {
        type: String,
        maxLength: [500, 'Tiểu sử không được vượt quá 500 ký tự']
    },
    profile_image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update the updated_at field before saving
DoctorSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

// Update the updated_at field before update
DoctorSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: new Date() });
    next();
});

module.exports = mongoose.model('Doctor', DoctorSchema);
