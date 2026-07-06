// src/pages/patient/PatientPayments.jsx
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Home, CreditCard, FileText, CheckCircle,
    Clock, AlertCircle, DollarSign, Calendar, Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import './PatientPayments.css';

const PatientPayments = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        totalAmount: 0
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('=== DEBUG PAYMENTS ===');
        console.log('Token exists:', !!token);
        console.log('User data:', userData);

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user:', parsedUser);
            console.log('User role:', parsedUser.role);
            console.log('Reference ID:', parsedUser.reference_id);

            if (parsedUser.role !== 'patient') {
                navigate('/');
                return;
            }
            setUser(parsedUser);

            const patientId = parsedUser.reference_id || parsedUser.patient_id;
            console.log('Using patient ID:', patientId);

            if (patientId) {
                loadPayments(patientId);
            } else {
                console.error('No patient ID found!');
                setError('Không tìm thấy thông tin bệnh nhân');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const loadPayments = async (patientId, page = 1) => {
        try {
            setLoading(true);
            setError('');

            console.log('Loading payments for patient:', patientId);

            const response = await paymentAPI.getByPatient(patientId, {
                page,
                limit: 10
            });

            console.log('Payments API response:', response);
            console.log('Response data:', response.data);

            // SỬA LỖI: Xử lý response từ backend đã map
            let paymentsData = [];
            let paginationData = {};

            if (response.data && response.data.success) {
                paymentsData = response.data.data || [];
                paginationData = response.data.pagination || {};

                console.log('Processed payments data:', paymentsData);
                console.log('Pagination data:', paginationData);

                setPayments(paymentsData);
                setPagination(paginationData);
                calculateStats(paymentsData);

                if (paymentsData.length === 0) {
                    console.log('No payments found for patient');
                }
            } else {
                console.log('Invalid response format');
                setPayments([]);
                setStats({ total: 0, pending: 0, completed: 0, overdue: 0, totalAmount: 0 });
            }

        } catch (error) {
            console.error('Error loading payments:', error);
            console.error('Error response:', error.response);

            if (error.response?.status === 403) {
                setError('Bạn không có quyền truy cập thông tin thanh toán này');
            } else if (error.response?.status === 404) {
                setError('Không tìm thấy thông tin thanh toán');
                setPayments([]);
                setStats({ total: 0, pending: 0, completed: 0, overdue: 0, totalAmount: 0 });
            } else if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            } else {
                setError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại.');
                setPayments([]);
                setStats({ total: 0, pending: 0, completed: 0, overdue: 0, totalAmount: 0 });
            }
        } finally {
            setLoading(false);
        }
    };

    // SỬA LỖI: Cập nhật calculateStats để sử dụng đúng fields đã map
    const calculateStats = (paymentsData) => {
        const now = new Date();

        const stats = {
            total: paymentsData.length,
            pending: 0,
            completed: 0,
            overdue: 0,
            totalAmount: 0
        };

        paymentsData.forEach(payment => {
            stats.totalAmount += payment.amount || 0;

            // SỬA LỖI: Sử dụng status đã được map từ backend
            if (payment.status === 'completed') {
                stats.completed++;
            } else if (payment.status === 'pending') {
                // Kiểm tra quá hạn dựa trên due_date đã được tạo
                if (payment.due_date) {
                    const dueDate = new Date(payment.due_date);
                    if (dueDate < now) {
                        stats.overdue++;
                    } else {
                        stats.pending++;
                    }
                } else {
                    stats.pending++;
                }
            }
        });

        setStats(stats);
        console.log('Calculated stats:', stats);
    };

    const handlePayNow = async (payment) => {
        try {
            const confirmed = window.confirm(
                `Xác nhận thanh toán hóa đơn ${payment.invoice_number}?\n` +
                `Số tiền: ${formatCurrency(payment.amount)}`
            );

            if (confirmed) {
                console.log('Processing payment for:', payment._id);

                // SỬA LỖI: Gửi đúng field name mà backend expect
                const response = await paymentAPI.update(payment._id, {
                    payment_status: 'completed', // Backend expect payment_status
                    payment_date: new Date().toISOString(),
                    payment_method: 'online'
                });

                console.log('Payment update response:', response.data);

                if (response.data && response.data.success) {
                    alert('Thanh toán thành công!');
                    const patientId = user.reference_id || user.patient_id;
                    loadPayments(patientId);
                } else {
                    alert('Thanh toán thất bại. Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
        }
    };

    const handleDownloadInvoice = (payment) => {
        alert(`Tải xuống hóa đơn ${payment.invoice_number}`);
    };

    const handlePageChange = (newPage) => {
        const patientId = user.reference_id || user.patient_id;
        loadPayments(patientId, newPage);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
    };

    const getStatusIcon = (status, dueDate) => {
        // SỬA LỖI: Kiểm tra quá hạn dựa trên due_date
        if (status === 'pending' && dueDate) {
            const now = new Date();
            const due = new Date(dueDate);
            if (due < now) {
                return <AlertCircle size={16} className="status-icon overdue" />;
            }
        }

        switch (status) {
            case 'completed':
                return <CheckCircle size={16} className="status-icon completed" />;
            case 'pending':
                return <Clock size={16} className="status-icon pending" />;
            default:
                return <Clock size={16} className="status-icon pending" />;
        }
    };

    const getStatusText = (status, dueDate) => {
        // SỬA LỖI: Kiểm tra quá hạn dựa trên due_date
        if (status === 'pending' && dueDate) {
            const now = new Date();
            const due = new Date(dueDate);
            if (due < now) {
                return 'Quá hạn';
            }
        }

        switch (status) {
            case 'completed':
                return 'Đã thanh toán';
            case 'pending':
                return 'Chờ thanh toán';
            default:
                return 'Chờ thanh toán';
        }
    };

    const getPaymentStatus = (payment) => {
        if (payment.status === 'pending' && payment.due_date) {
            const now = new Date();
            const due = new Date(payment.due_date);
            return due < now ? 'overdue' : 'pending';
        }
        return payment.status;
    };

    const filteredPayments = payments.filter(payment => {
        if (filter === 'all') return true;
        const actualStatus = getPaymentStatus(payment);
        return actualStatus === filter;
    });

    if (loading) {
        return (
            <div className="patient-payments">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-payments">
            <div className="dashboard-header-bar">
                <div className="container">
                    <button onClick={() => navigate('/patient-dashboard')} className="back-btn">
                        <ArrowLeft size={20} />
                        Quay lại Dashboard
                    </button>
                    <Link to="/" className="home-btn">
                        <Home size={20} />
                        MediCare+
                    </Link>
                </div>
            </div>

            <div className="container">
                <div className="page-header">
                    <h1>
                        <CreditCard size={32} />
                        Thanh toán
                    </h1>
                    <p>Quản lý các hóa đơn và thanh toán của bạn</p>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Payment Statistics */}
                <div className="payment-stats">
                    <div className="stat-card total">
                        <div className="stat-icon">
                            <FileText size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Tổng hóa đơn</p>
                        </div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.pending}</h3>
                            <p>Chờ thanh toán</p>
                        </div>
                    </div>

                    <div className="stat-card completed">
                        <div className="stat-icon">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.completed}</h3>
                            <p>Đã thanh toán</p>
                        </div>
                    </div>

                    <div className="stat-card overdue">
                        <div className="stat-icon">
                            <AlertCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.overdue}</h3>
                            <p>Quá hạn</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({stats.total})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Chờ thanh toán ({stats.pending})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Đã thanh toán ({stats.completed})
                    </button>
                    <button
                        className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setFilter('overdue')}
                    >
                        Quá hạn ({stats.overdue})
                    </button>
                </div>

                {/* Payments List */}
                {filteredPayments.length > 0 ? (
                    <>
                        <div className="payments-list">
                            {filteredPayments.map(payment => {
                                const actualStatus = getPaymentStatus(payment);
                                return (
                                    <div key={payment._id} className={`payment-card ${actualStatus}`}>
                                        <div className="payment-header">
                                            <div className="invoice-info">
                                                <h3>{payment.description}</h3>
                                                <span className="invoice-number">
                                                    #{payment.invoice_number}
                                                </span>
                                            </div>
                                            <div className="payment-amount">
                                                <DollarSign size={20} />
                                                {formatCurrency(payment.amount)}
                                            </div>
                                        </div>

                                        <div className="payment-details">
                                            {payment.appointment_id?.appointment_date && (
                                                <div className="detail-item">
                                                    <Calendar size={16} />
                                                    <span>Ngày khám: {formatDate(payment.appointment_id.appointment_date)}</span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>Hạn thanh toán: {formatDate(payment.due_date)}</span>
                                            </div>
                                            {payment.payment_date && (
                                                <div className="detail-item">
                                                    <CheckCircle size={16} />
                                                    <span>Đã thanh toán: {formatDate(payment.payment_date)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="payment-footer">
                                            <div className="payment-status">
                                                {getStatusIcon(payment.status, payment.due_date)}
                                                <span>{getStatusText(payment.status, payment.due_date)}</span>
                                            </div>

                                            <div className="payment-actions">
                                                <button
                                                    onClick={() => handleDownloadInvoice(payment)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    <Download size={16} />
                                                    Tải hóa đơn
                                                </button>

                                                {actualStatus !== 'completed' && (
                                                    <button
                                                        onClick={() => handlePayNow(payment)}
                                                        className={`btn btn-sm ${actualStatus === 'overdue' ? 'btn-danger' : 'btn-primary'}`}
                                                    >
                                                        <CreditCard size={16} />
                                                        {actualStatus === 'overdue' ? 'Thanh toán ngay' : 'Thanh toán'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage <= 1}
                                    className="btn btn-outline"
                                >
                                    Trước
                                </button>

                                <span className="pagination-info">
                                    Trang {pagination.currentPage} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    className="btn btn-outline"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : !loading && (
                    <div className="no-payments">
                        <CreditCard size={64} />
                        <h3>Không có hóa đơn nào</h3>
                        <p>
                            {filter === 'all'
                                ? 'Bạn chưa có hóa đơn thanh toán nào'
                                : `Không có hóa đơn ${getStatusText(filter)?.toLowerCase()}`
                            }
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => navigate('/appointment')}
                                className="btn btn-primary"
                            >
                                Đặt lịch khám ngay
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientPayments;
