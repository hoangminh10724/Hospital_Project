const express = require('express');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    getReviewsByDoctor
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);
router.get('/doctor/:doctorId', getReviewsByDoctor);

// Protected routes
router.post('/', protect, authorize('patient'), createReview);
router.put('/:id', protect, authorize('patient') , updateReview);
router.delete('/:id', protect, authorize('patient'), deleteReview);

module.exports = router;
