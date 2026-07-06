const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getAppointmentsByDate,
    updateAppointmentStatus
} = require('../controllers/appointmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Specific filters - must come before generic routes
router.get('/date/:date', protect, asyncHandler(getAppointmentsByDate));
router.get('/patient/:patientId', protect, authorize('admin', 'patient'), asyncHandler(getAppointmentsByPatient));
router.get('/doctor/:doctorId', protect, authorize('admin', 'doctor'), asyncHandler(getAppointmentsByDoctor));

// Generic routes
router.get('/', protect, asyncHandler(getAppointments));
router.post('/', protect, asyncHandler(createAppointment));
router.get('/:id', protect, asyncHandler(getAppointment));
router.put('/:id', protect, asyncHandler(updateAppointment));
router.delete('/:id', protect, asyncHandler(deleteAppointment));

// Status update route
router.put('/:id/status', protect, authorize('doctor', 'admin'), asyncHandler(updateAppointmentStatus));

module.exports = router;
