const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Review.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const reviews = await Review.find()
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('patient_id', 'first_name last_name')
            .skip(startIndex)
            .limit(limit)
            .sort('-review_date');

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('doctor_id', 'first_name last_name specialization')
            .populate('patient_id', 'first_name last_name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private/Patient
exports.createReview = async (req, res, next) => {
    try {
        // Set patient_id if user is patient
        if (req.user.role === 'patient') {
            req.body.patient_id = req.user.reference_id;
        }

        // Check if patient has already reviewed this doctor
        const existingReview = await Review.findOne({
            doctor_id: req.body.doctor_id,
            patient_id: req.body.patient_id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá bác sĩ này rồi'
            });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Patient
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ _id: review.patient_id });
            if (!patient || req.user.reference_id.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền cập nhật'
                });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật'
            });
        }

        review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Patient or Admin
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            const patient = await Patient.findOne({ _id: review.patient_id });
            if (!patient || req.user.reference_id.toString() !== patient._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền xóa'
                });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa'
            });
        }

        await review.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get reviews by doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getReviewsByDoctor = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Review.countDocuments({ doctor_id: req.params.doctorId });

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const reviews = await Review.find({ doctor_id: req.params.doctorId })
            .populate('patient_id', 'first_name last_name')
            .skip(startIndex)
            .limit(limit)
            .sort('-review_date');

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            pagination,
            data: reviews
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
