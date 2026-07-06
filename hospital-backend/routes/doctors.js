const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorsByDepartment,
    getDoctorStats,
    updateDoctorProfile
} = require('../controllers/doctorController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Specific routes - must come before generic /:id route
router.get('/department/:departmentId', protect, asyncHandler(getDoctorsByDepartment));
router.get('/:id/stats', protect, authorize('doctor', 'admin'), asyncHandler(getDoctorStats));
router.put('/profile/:id', protect, authorize('doctor'), asyncHandler(updateDoctorProfile));

// Public routes
router.get('/', asyncHandler(getDoctors));

// Generic routes
router.get('/:id', protect, asyncHandler(getDoctor));
router.post('/', protect, authorize('admin'), asyncHandler(createDoctor));
router.put('/:id', protect, authorize('admin', 'doctor'), asyncHandler(updateDoctor));
router.delete('/:id', protect, authorize('admin'), asyncHandler(deleteDoctor));

module.exports = router;
