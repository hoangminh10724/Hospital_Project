const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Vui lòng chọn bệnh nhân']
    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Vui lòng chọn bác sĩ']
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Vui lòng chọn khoa']
    },
    appointment_date: {
        type: Date,
        required: [true, 'Vui lòng chọn ngày hẹn']
    },
    start_time: {
        type: String,
        required: [true, 'Vui lòng chọn giờ bắt đầu']
    },
    end_time: {
        type: String,
        required: [true, 'Vui lòng chọn giờ kết thúc']
    },
    reason: {
        type: String,
        required: [true, 'Vui lòng nhập lý do khám']
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    // SỬA LỖI: Thêm submission_token để ngăn duplicate
    submission_token: {
        type: String,
        unique: true, // Giữ lại định nghĩa unique/index tại đây
        sparse: true // Cho phép null values nhưng unique khi có giá trị
    },
    // Thông tin patient cho guest users
    patient_info: {
        first_name: String,
        last_name: String,
        phone: String,
        email: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// SỬA LỖI: Thêm compound index để ngăn duplicate appointments
AppointmentSchema.index({
    doctor_id: 1,
    appointment_date: 1,
    start_time: 1,
    patient_id: 1
}, {
    unique: true,
    name: 'unique_appointment_slot',
    partialFilterExpression: {
        status: { $ne: 'cancelled' } // Chỉ áp dụng cho appointments chưa hủy
    }
});

// Index cho performance
AppointmentSchema.index({ patient_id: 1, appointment_date: -1 });
AppointmentSchema.index({ doctor_id: 1, appointment_date: 1, start_time: 1 });
AppointmentSchema.index({ status: 1, appointment_date: 1 });

// Virtual field for full appointment time (combine date and start_time)
AppointmentSchema.virtual('appointment_time').get(function () {
    if (this.appointment_date && this.start_time) {
        const [hours, minutes] = this.start_time.split(':');
        const date = new Date(this.appointment_date);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date;
    }
    return this.appointment_date;
});

// Make sure virtuals are included when document is converted to JSON
AppointmentSchema.set('toJSON', { virtuals: true });
AppointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
