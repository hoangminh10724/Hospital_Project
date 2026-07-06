// src/pages/patient/PatientAppointments.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, Calendar, Clock, User, Edit, Trash2, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import './PatientAppointments.css';

const PatientAppointments = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role !== 'patient') {
                navigate('/');
                return;
            }
            setUser(parsedUser);

            const patientId = parsedUser.reference_id;
            if (patientId) {
                loadAppointments(patientId);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const loadAppointments = async (patientId) => {
        try {
            setLoading(true);
            setError('');

            const response = await appointmentAPI.getByPatient(patientId);

            if (response.data) {
                let appointmentsData = [];
                if (response.data.success) {
                    appointmentsData = response.data.data || [];
                } else if (Array.isArray(response.data)) {
                    appointmentsData = response.data;
                }

                // Loại bỏ duplicate
                const uniqueAppointments = appointmentsData.filter((appointment, index, self) =>
                    index === self.findIndex(a => a._id === appointment._id)
                );

                setAppointments(uniqueAppointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            setError('Không thể tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    // SỬA LỖI: Cập nhật API call để xóa thực sự trong database
    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
            try {
                console.log('Cancelling appointment:', appointmentId);

                // SỬA LỖI: Sử dụng delete thay vì update status
                const response = await appointmentAPI.delete(appointmentId);

                console.log('Delete response:', response);

                if (response.status === 200 || response.data?.success) {
                    alert('Hủy lịch hẹn thành công!');

                    // SỬA LỖI: Cập nhật state ngay lập tức thay vì reload
                    setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
                } else {
                    throw new Error('Delete failed');
                }
            } catch (error) {
                console.error('Error cancelling appointment:', error);
                alert('Không thể hủy lịch hẹn. Vui lòng thử lại.');
            }
        }
    };

    // THÊM: Chức năng chỉnh sửa inline
    const handleEditStart = (appointment) => {
        setEditingId(appointment._id);
        setEditForm({
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time,
            reason: appointment.reason,
            notes: appointment.notes || ''
        });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleEditSave = async (appointmentId) => {
        try {
            console.log('Saving appointment:', appointmentId, editForm);

            const response = await appointmentAPI.update(appointmentId, editForm);

            if (response.data?.success || response.status === 200) {
                alert('Cập nhật lịch hẹn thành công!');

                // Cập nhật state
                setAppointments(prev => prev.map(apt =>
                    apt._id === appointmentId
                        ? { ...apt, ...editForm }
                        : apt
                ));

                setEditingId(null);
                setEditForm({});
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Không thể cập nhật lịch hẹn. Vui lòng thử lại.');
        }
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'confirmed': return 'Đã xác nhận';
            case 'completed': return 'Đã hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'confirmed': return 'confirmed';
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            default: return 'pending';
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        if (filter === 'all') return true;
        return appointment.status === filter;
    });

    if (loading) {
        return (
            <div className="patient-appointments">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách lịch hẹn...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-appointments">
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
                        <Calendar size={32} />
                        Lịch hẹn của tôi
                    </h1>
                    <button
                        onClick={() => navigate('/appointment')}
                        className="btn btn-primary"
                    >
                        Đặt lịch mới
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Chờ xác nhận
                    </button>
                    <button
                        className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
                        onClick={() => setFilter('confirmed')}
                    >
                        Đã xác nhận
                    </button>
                    <button
                        className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Đã hoàn thành
                    </button>
                </div>

                {/* Appointments List */}
                {filteredAppointments.length > 0 ? (
                    <div className="appointments-list">
                        {filteredAppointments.map(appointment => (
                            <div key={appointment._id} className="appointment-card expanded">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <h3>
                                            {appointment.doctor_id?.first_name} {appointment.doctor_id?.last_name}
                                        </h3>
                                        <p>{appointment.doctor_id?.specialization}</p>
                                    </div>
                                    <div className={`appointment-status ${getStatusClass(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                    </div>
                                </div>

                                {/* THÊM: Hiển thị đầy đủ thông tin */}
                                <div className="appointment-details-full">
                                    <div className="detail-row">
                                        <div className="detail-group">
                                            <label>Ngày khám:</label>
                                            {editingId === appointment._id ? (
                                                <input
                                                    type="date"
                                                    value={editForm.appointment_date}
                                                    onChange={(e) => handleEditChange('appointment_date', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            ) : (
                                                <span>{formatDate(appointment.appointment_date)}</span>
                                            )}
                                        </div>
                                        <div className="detail-group">
                                            <label>Giờ khám:</label>
                                            {editingId === appointment._id ? (
                                                <input
                                                    type="time"
                                                    value={editForm.start_time}
                                                    onChange={(e) => handleEditChange('start_time', e.target.value)}
                                                />
                                            ) : (
                                                <span>{formatTime(appointment.start_time)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        <div className="detail-group full-width">
                                            <label>Lý do khám:</label>
                                            {editingId === appointment._id ? (
                                                <textarea
                                                    value={editForm.reason}
                                                    onChange={(e) => handleEditChange('reason', e.target.value)}
                                                    rows="3"
                                                />
                                            ) : (
                                                <span>{appointment.reason || 'Chưa có'}</span>
                                            )}
                                        </div>
                                    </div>

                                    {(appointment.notes || editingId === appointment._id) && (
                                        <div className="detail-row">
                                            <div className="detail-group full-width">
                                                <label>Ghi chú:</label>
                                                {editingId === appointment._id ? (
                                                    <textarea
                                                        value={editForm.notes}
                                                        onChange={(e) => handleEditChange('notes', e.target.value)}
                                                        rows="2"
                                                        placeholder="Ghi chú thêm..."
                                                    />
                                                ) : (
                                                    <span>{appointment.notes || 'Không có ghi chú'}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="detail-row">
                                        <div className="detail-group">
                                            <label>Ngày tạo:</label>
                                            <span>{formatDate(appointment.created_at)}</span>
                                        </div>
                                        <div className="detail-group">
                                            <label>Trạng thái:</label>
                                            <span className={`status-text ${getStatusClass(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="appointment-actions">
                                    {editingId === appointment._id ? (
                                        // Editing mode
                                        <>
                                            <button
                                                onClick={() => handleEditSave(appointment._id)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <Save size={16} />
                                                Lưu
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                className="btn btn-outline btn-sm"
                                            >
                                                <X size={16} />
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        // View mode
                                        <>
                                            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditStart(appointment)}
                                                        className="btn btn-outline btn-sm"
                                                    >
                                                        <Edit size={16} />
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment._id)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        <Trash2 size={16} />
                                                        Hủy
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-appointments">
                        <Calendar size={64} />
                        <h3>Không có lịch hẹn nào</h3>
                        <p>Bạn chưa có lịch hẹn nào được ghi nhận</p>
                        <button
                            onClick={() => navigate('/appointment')}
                            className="btn btn-primary"
                        >
                            Đặt lịch khám ngay
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAppointments;
