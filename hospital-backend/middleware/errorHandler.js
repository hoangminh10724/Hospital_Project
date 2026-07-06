// @desc   Error Handler
// @usage  Use as middleware in server.js
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err, err.stack);

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            message: 'ID không hợp lệ'
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: message.join(', ')
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} đã tồn tại trong hệ thống`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn'
        });
    }    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi server'
    });
};

module.exports = errorHandler;
