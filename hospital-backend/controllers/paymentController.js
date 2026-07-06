const Payment = require('../models/Payment');
const Patient = require('../models/Patient');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Payment.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const paymentsRaw = await Payment.find()
            .populate('patient_id', 'first_name last_name')
            .populate('appointment_id')
            .skip(startIndex)
            .limit(limit)
            .sort('-payment_date');

        // SỬA LỖI: Map fields để frontend hiểu được
        const payments = paymentsRaw.map(payment => {
            const paymentObj = payment.toObject();
            return {
                ...paymentObj,
                // Map payment_status -> status
                status: paymentObj.payment_status || 'pending',
                // Tạo invoice_number nếu chưa có
                invoice_number: paymentObj.invoice_number || `INV-${paymentObj._id.toString().slice(-8)}`,
                // Tạo due_date nếu chưa có
                due_date: paymentObj.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                // Thêm description nếu chưa có
                description: paymentObj.description || 'Thanh toán dịch vụ y tế'
            };
        });

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
            data: payments
        });
    } catch (err) {
        console.error('Error in getPayments:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
    try {
        const paymentRaw = await Payment.findById(req.params.id)
            .populate('patient_id', 'first_name last_name email phone')
            .populate('appointment_id');

        if (!paymentRaw) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thanh toán'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== paymentRaw.patient_id._id.toString()) {
                console.log('Access denied: reference_id mismatch');
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }
        }

        // SỬA LỖI: Map fields cho single payment
        const paymentObj = paymentRaw.toObject();
        const payment = {
            ...paymentObj,
            status: paymentObj.payment_status || 'pending',
            invoice_number: paymentObj.invoice_number || `INV-${paymentObj._id.toString().slice(-8)}`,
            due_date: paymentObj.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: paymentObj.description || 'Thanh toán dịch vụ y tế'
        };

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (err) {
        console.error('Error in getPayment:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
    try {
        // Set patient_id if user is patient
        if (req.user.role === 'patient') {
            req.body.patient_id = req.user.reference_id;
        }

        // SỬA LỖI: Map frontend fields về database fields
        const paymentData = { ...req.body };

        // Map status -> payment_status
        if (paymentData.status) {
            paymentData.payment_status = paymentData.status;
            delete paymentData.status;
        }

        const payment = await Payment.create(paymentData);

        // Map lại để trả về frontend
        const mappedPayment = {
            ...payment.toObject(),
            status: payment.payment_status || 'pending',
            invoice_number: payment.invoice_number || `INV-${payment._id.toString().slice(-8)}`,
            due_date: payment.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: payment.description || 'Thanh toán dịch vụ y tế'
        };

        res.status(201).json({
            success: true,
            data: mappedPayment
        });
    } catch (err) {
        console.error('Error in createPayment:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
exports.updatePayment = async (req, res, next) => {
    try {
        console.log('=== DEBUG UPDATE PAYMENT ===');
        console.log('Payment ID:', req.params.id);
        console.log('Update data:', req.body);
        console.log('User role:', req.user.role);

        // SỬA LỖI: Map frontend fields về database fields
        const updateData = { ...req.body };

        // Map status -> payment_status nếu có
        if (updateData.status) {
            updateData.payment_status = updateData.status;
            delete updateData.status;
        }

        const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thanh toán'
            });
        }

        console.log('Payment updated successfully:', payment._id);

        // SỬA LỖI: Map lại để trả về frontend
        const mappedPayment = {
            ...payment.toObject(),
            status: payment.payment_status || 'pending',
            invoice_number: payment.invoice_number || `INV-${payment._id.toString().slice(-8)}`,
            due_date: payment.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: payment.description || 'Thanh toán dịch vụ y tế'
        };

        res.status(200).json({
            success: true,
            data: mappedPayment
        });
    } catch (err) {
        console.error('Error in updatePayment:', err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get payments by patient
// @route   GET /api/payments/patient/:patientId
// @access  Private
exports.getPaymentsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        console.log('=== DEBUG PAYMENTS BY PATIENT ===');
        console.log('Requested patient ID:', patientId);
        console.log('User role:', req.user.role);
        console.log('User reference_id:', req.user.reference_id);

        // Check authorization
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== patientId.toString()) {
                console.log('Access denied: reference_id mismatch');
                return res.status(403).json({
                    success: false,
                    message: 'Bạn chỉ có thể xem thông tin thanh toán của chính mình'
                });
            }
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Get total count
        const total = await Payment.countDocuments({ patient_id: patientId });
        console.log('Total payments found:', total);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        const paymentsRaw = await Payment.find({ patient_id: patientId })
            .populate('appointment_id', 'appointment_date start_time')
            .populate('patient_id', 'first_name last_name')
            .skip(startIndex)
            .limit(limit)
            .sort('-created_at');

        console.log('Raw payments retrieved:', paymentsRaw.length);

        // SỬA LỖI: Map fields để frontend hiểu được
        const payments = paymentsRaw.map(payment => {
            const paymentObj = payment.toObject();

            return {
                _id: paymentObj._id,
                patient_id: paymentObj.patient_id,
                appointment_id: paymentObj.appointment_id,
                amount: paymentObj.amount,
                payment_method: paymentObj.payment_method,

                // Map payment_status -> status
                status: paymentObj.payment_status || 'pending',

                // Map payment_date
                payment_date: paymentObj.payment_date,

                // Tạo due_date nếu chưa có (7 ngày từ created_at)
                due_date: paymentObj.due_date ||
                    new Date(new Date(paymentObj.created_at).getTime() + 7 * 24 * 60 * 60 * 1000),

                // Tạo invoice_number từ ID
                invoice_number: paymentObj.invoice_number ||
                    `INV-${paymentObj._id.toString().slice(-8).toUpperCase()}`,

                // Thêm description
                description: paymentObj.description || 'Thanh toán dịch vụ y tế',

                created_at: paymentObj.created_at
            };
        });

        console.log('Mapped payments:', payments.length);
        if (payments.length > 0) {
            console.log('Sample mapped payment:', {
                id: payments[0]._id,
                status: payments[0].status,
                amount: payments[0].amount,
                due_date: payments[0].due_date,
                invoice_number: payments[0].invoice_number
            });
        }

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit
        };

        res.status(200).json({
            success: true,
            count: payments.length,
            pagination,
            data: payments
        });
    } catch (err) {
        console.error('Error in getPaymentsByPatient:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private/Admin
exports.deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thanh toán'
            });
        }

        await payment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Đã xóa thanh toán thành công'
        });
    } catch (err) {
        console.error('Error in deletePayment:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Process payment
// @route   POST /api/payments/:id/process
// @access  Private
exports.processPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_method } = req.body;

        console.log('=== DEBUG PROCESS PAYMENT ===');
        console.log('Payment ID:', id);
        console.log('Payment method:', payment_method);

        const payment = await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thanh toán'
            });
        }

        // Check authorization
        if (req.user.role === 'patient') {
            if (req.user.reference_id.toString() !== payment.patient_id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền thực hiện thanh toán này'
                });
            }
        }

        // SỬA LỖI: Update đúng field name trong database
        payment.payment_status = 'completed';
        payment.payment_date = new Date();
        payment.payment_method = payment_method || 'online';

        await payment.save();

        console.log('Payment processed successfully:', payment._id);

        // Map lại để trả về frontend
        const mappedPayment = {
            ...payment.toObject(),
            status: payment.payment_status,
            invoice_number: payment.invoice_number || `INV-${payment._id.toString().slice(-8)}`,
            due_date: payment.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: payment.description || 'Thanh toán dịch vụ y tế'
        };

        res.status(200).json({
            success: true,
            message: 'Thanh toán thành công',
            data: mappedPayment
        });
    } catch (err) {
        console.error('Error in processPayment:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
