const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Vui lòng chọn bệnh nhân']
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Vui lòng chọn lịch hẹn']
    },
    amount: {
        type: Number,
        required: [true, 'Vui lòng nhập số tiền']
    },
    payment_date: {
        type: Date,
        default: Date.now
    },
    payment_method: {
        type: String,
        enum: ['cash', 'credit_card', 'bank_transfer', 'insurance'],
        required: [true, 'Vui lòng chọn phương thức thanh toán']
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
