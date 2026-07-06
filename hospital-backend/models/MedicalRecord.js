const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
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
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Vui lòng chọn lịch hẹn']
    },
    record_date: {
        type: Date,
        default: Date.now
    },
    diagnosis: {
        type: String,
        required: [true, 'Vui lòng nhập chẩn đoán']
    },
    prescription: {
        type: String
    },
    notes: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
