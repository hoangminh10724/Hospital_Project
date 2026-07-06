const express = require('express');

const {
    getMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    getMedicalRecordsByPatient
} = require('../controllers/medicalRecordController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Admin only routes
router.get('/', protect, authorize('admin'), getMedicalRecords);

// Doctor/Admin routes
router.post('/', protect, authorize('doctor', 'admin'), createMedicalRecord);
router.put('/:id', protect, authorize('doctor', 'admin'), updateMedicalRecord);

// Protected routes - CHO PHÉP PATIENT TRUY CẬP
router.get('/:id', protect, authorize('admin', 'doctor', 'patient'), getMedicalRecord);

// SỬA LỖI: Cho phép patient truy cập hồ sơ của chính họ
router.get('/patient/:patientId', protect, authorize('admin', 'patient'), getMedicalRecordsByPatient);

module.exports = router;
