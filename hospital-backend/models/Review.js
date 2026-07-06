const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Vui lòng chọn bác sĩ']
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Vui lòng chọn bệnh nhân']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Vui lòng đánh giá từ 1-5 sao']
    },
    comment: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá'],
        maxlength: 500
    },
    review_date: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting more than one review per doctor
ReviewSchema.index({ doctor_id: 1, patient_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
