const express = require('express');
const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Admin only routes
router.get('/', protect, authorize('admin'), getPatients);
router.post('/', protect, authorize('admin'), createPatient);
router.delete('/:id', protect, authorize('admin'), deletePatient);

// Protected routes (Admin or Patient)
router.get('/:id', protect, getPatient);
router.put('/:id', protect, updatePatient);

module.exports = router;
