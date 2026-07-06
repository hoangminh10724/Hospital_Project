const express = require('express');
const {
    register,
    login,
    getMe,
    changePassword,
    getUserByReference
} = require('../controllers/authController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth'); // ← THÊM authorize

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/user-by-reference/:referenceId', protect, authorize('admin'), getUserByReference);

module.exports = router;
