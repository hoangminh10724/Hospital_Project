const express = require('express');

const {
    getPayments,
    getPayment,
    createPayment,
    updatePayment,
    getPaymentsByPatient
} = require('../controllers/paymentController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Admin only routes
router.get('/', protect, authorize('admin'), getPayments);
router.put('/:id', protect, authorize('admin'), updatePayment);

// Protected routes
router.post('/', protect, createPayment);

// SỬA LỖI: Cho phép patient truy cập thông tin thanh toán
router.get('/:id', protect, authorize('admin', 'patient'), getPayment);

// SỬA LỖI: Cho phép patient truy cập thanh toán của chính họ
router.get('/patient/:patientId', protect, authorize('admin', 'patient'), getPaymentsByPatient);

module.exports = router;
