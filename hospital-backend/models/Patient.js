const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'Vui lòng nhập tên']
    },
    last_name: {
        type: String,
        required: [true, 'Vui lòng nhập họ']
    },
    dob: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày sinh']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Vui lòng chọn giới tính']
    },
    address: {
        type: String
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Số điện thoại không hợp lệ']
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    emergency_contact: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Patient', PatientSchema);
