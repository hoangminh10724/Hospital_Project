// src/pages/doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, FileText, LogOut, Home, CheckCircle, XCircle, Eye, Save, Edit, X, User, Clock, BarChart3
} from 'lucide-react';
import axios from 'axios';
import './DoctorDashboard.css';

const API_BASE = 'http://localhost:5000/api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Doctor profile states
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [editProfile, setEditProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [profileErrors, setProfileErrors] = useState({});

    // Appointments states
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');

    // Statistics states
    const [doctorStats, setDoctorStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        completedAppointments: 0,
        totalPatients: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);

    // Medical record states
    const [medicalRecord, setMedicalRecord] = useState({
        diagnosis: '',
        prescription: '',
        notes: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        console.log('=== DOCTOR DASHBOARD INIT ===');
        console.log('Token exists:', !!token);
        console.log('User data:', userData);

        if (!token || !userData) {
            console.log('Missing credentials, redirecting to login');
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user:', parsedUser);

            if (parsedUser.role !== 'doctor') {
                console.log('Not a doctor role, redirecting');
                navigate('/');
                return;
            }

            setUser(parsedUser);
            loadDoctorData(parsedUser.reference_id);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const loadDoctorData = async (doctorId) => {
        console.log('Loading doctor data for ID:', doctorId);
        setLoading(true);
        try {
            await Promise.all([
                fetchDoctorProfile(doctorId),
                fetchAppointments(doctorId)
            ]);
        } catch (error) {
            console.error('Error loading doctor data:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };
    const fetchDoctorProfile = async (doctorId) => {
        try {
            console.log('Fetching doctor profile with related data for ID:', doctorId);

            if (!doctorId) {
                console.error('Doctor ID is null or undefined');
                setDoctorProfile(null);
                return;
            }

            const res = await axios.get(`${API_BASE}/doctors/${doctorId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            console.log('Doctor profile API response:', res.data);

            if (res.data && res.data.success === true && res.data.data) {
                const profileData = res.data.data;
                console.log('Setting doctor profile:', profileData);

                // Set profile data
                setDoctorProfile(profileData);
                setProfileForm(profileData);

                // Set statistics
                if (profileData.statistics) {
                    setDoctorStats(profileData.statistics);
                }

                // Set recent appointments
                if (profileData.recentAppointments) {
                    setRecentAppointments(profileData.recentAppointments);
                }
            } else {
                console.error('Invalid response structure:', res.data);
                setDoctorProfile(null);
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            console.error('Error response:', error.response);
            setDoctorProfile(null);
        }
    };

    const fetchAppointments = async (doctorId) => {
        try {
            console.log('Fetching appointments for doctor:', doctorId);

            const [allRes, pendingRes] = await Promise.all([
                axios.get(`${API_BASE}/appointments`, {
                    params: { doctor_id: doctorId },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get(`${API_BASE}/appointments`, {
                    params: { doctor_id: doctorId, status: 'pending' },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            console.log('All appointments loaded:', allRes.data.data?.length || 0);
            console.log('Pending appointments:', pendingRes.data.data?.length || 0);

            setAllAppointments(allRes.data.data || []); // ✅ SỬA: setAllAppointments
            setPendingAppointments(pendingRes.data.data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            if (error.response?.status === 401) handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    // Profile editing functions
    const handleEditProfile = () => {
        setEditProfile(true);
        setProfileForm(doctorProfile || {});
        setProfileErrors({});
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (profileErrors[name]) {
            setProfileErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateProfileForm = (data) => {
        const errors = {};
        if (!data.first_name?.trim()) errors.first_name = 'Họ không được để trống';
        if (!data.last_name?.trim()) errors.last_name = 'Tên không được để trống';
        if (!data.email?.trim()) errors.email = 'Email không được để trống';
        if (!data.specialization?.trim()) errors.specialization = 'Chuyên khoa không được để trống';

        if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (data.phone && !/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        return errors;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        const errors = validateProfileForm(profileForm);
        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setLoading(true);
        try {
            console.log('Updating doctor profile:', profileForm);

            const response = await axios.put(`${API_BASE}/doctors/${doctorProfile._id}`, profileForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            console.log('Profile update response:', response.data);

            if (response.data.success) {
                const updatedDoctor = response.data.data;
                setDoctorProfile(updatedDoctor);
                setProfileForm(updatedDoctor);

                // Cập nhật localStorage để đồng bộ với header
                const userData = JSON.parse(localStorage.getItem('user'));
                const updatedUserData = {
                    ...userData,
                    first_name: updatedDoctor.first_name,
                    last_name: updatedDoctor.last_name,
                    email: updatedDoctor.email
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                setUser(updatedUserData);

                alert('Cập nhật hồ sơ cá nhân thành công!'); // ✅ SỬA: Dùng alert thay vì toast
                setEditProfile(false);

                // Refresh data để đảm bảo đồng bộ
                await fetchDoctorProfile(user.reference_id);
            } else {
                throw new Error(response.data.message || 'Cập nhật thất bại');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            const message = error.response?.data?.message || error.message || 'Lỗi khi cập nhật hồ sơ cá nhân';
            alert(message); // ✅ SỬA: Dùng alert thay vì toast
        } finally {
            setLoading(false);
        }
    };

    // Appointment functions
    const handleConfirmAppointment = async (appointmentId, status) => {
        setLoading(true);
        try {
            await axios.put(`${API_BASE}/appointments/${appointmentId}`,
                { status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            await fetchAppointments(user.reference_id);
            await fetchDoctorProfile(user.reference_id); // Refresh stats
            alert(`${status === 'confirmed' ? 'Xác nhận' : 'Từ chối'} lịch hẹn thành công!`);
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Lỗi khi cập nhật trạng thái lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAppointment = async (appointment) => {
        setSelectedAppointment(appointment);
        setModalType('medical-record');
        setShowModal(true);

        try {
            const res = await axios.get(`${API_BASE}/medical-records`, {
                params: { appointment_id: appointment._id },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.data.data && res.data.data.length > 0) {
                setMedicalRecord(res.data.data[0]);
            } else {
                setMedicalRecord({ diagnosis: '', prescription: '', notes: '' });
            }
        } catch (error) {
            console.error('Error fetching medical record:', error);
            setMedicalRecord({ diagnosis: '', prescription: '', notes: '' });
        }
    };

    const handleUpdateMedicalRecord = async (e) => {
        e.preventDefault();
        if (!medicalRecord.diagnosis || !medicalRecord.prescription) {
            toast.error('Vui lòng nhập đầy đủ thông tin chẩn đoán và đơn thuốc');
            return;
        }

        try {
            setLoading(true);
            const recordData = {
                ...medicalRecord,
                appointment_id: selectedAppointment._id,
                patient_id: selectedAppointment.patient_id,
                doctor_id: user.reference_id
            };

            let res;
            if (medicalRecord._id) {
                res = await doctorAPI.updateMedicalRecord(medicalRecord._id, recordData);
            } else {
                res = await doctorAPI.createMedicalRecord(recordData);
            }

            if (res.data.success) {
                // Cập nhật trạng thái lịch hẹn thành completed
                await doctorAPI.confirmAppointment(selectedAppointment._id, 'completed');
                await fetchAppointments(user.reference_id);
                setShowModal(false);
                toast.success('Đã cập nhật hồ sơ bệnh án');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ bệnh án:', error);
            toast.error('Không thể cập nhật hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    };

    // Render functions
    const renderDashboard = () => (
        <div className="dashboard-overview">
            <h2>Tổng quan</h2>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <Calendar size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>{doctorStats.totalAppointments}</h3>
                        <p>Tổng lịch hẹn</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">
                        <Clock size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>{doctorStats.pendingAppointments}</h3>
                        <p>Chờ xác nhận</p>
                    </div>
                </div>

                <div className="stat-card completed">
                    <div className="stat-icon">
                        <CheckCircle size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>{doctorStats.completedAppointments}</h3>
                        <p>Đã hoàn thành</p>
                    </div>
                </div>

                <div className="stat-card patients">
                    <div className="stat-icon">
                        <Users size={32} />
                    </div>
                    <div className="stat-content">
                        <h3>{doctorStats.totalPatients}</h3>
                        <p>Bệnh nhân đã khám</p>
                    </div>
                </div>
            </div>

            {/* Doctor Info Summary */}
            {doctorProfile && (
                <div className="doctor-summary">
                    <h3>Thông tin bác sĩ</h3>
                    <div className="summary-card">
                        <div className="summary-header">
                            <div className="doctor-avatar">
                                <User size={48} />
                            </div>
                            <div className="doctor-info">
                                <h4>{doctorProfile.first_name} {doctorProfile.last_name}</h4>
                                <p>{doctorProfile.specialization}</p>
                                <p>{doctorProfile.department_id?.name}</p>
                            </div>
                        </div>
                        <div className="summary-details">
                            <div className="detail-item">
                                <span>Email:</span>
                                <span>{doctorProfile.email}</span>
                            </div>
                            <div className="detail-item">
                                <span>Điện thoại:</span>
                                <span>{doctorProfile.phone || 'Chưa cập nhật'}</span>
                            </div>
                            <div className="detail-item">
                                <span>Kinh nghiệm:</span>
                                <span>{doctorProfile.experience_years ? `${doctorProfile.experience_years} năm` : 'Chưa cập nhật'}</span>
                            </div>
                            <div className="detail-item">
                                <span>Giấy phép:</span>
                                <span>{doctorProfile.license_number || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Appointments */}
            <div className="recent-appointments">
                <h3>Lịch hẹn gần đây</h3>
                {recentAppointments.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>Chưa có lịch hẹn nào</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {recentAppointments.slice(0, 5).map((appointment) => (
                            <div key={appointment._id} className="appointment-item">
                                <div className="appointment-info">
                                    <h5>{appointment.patient_id?.first_name} {appointment.patient_id?.last_name}</h5>
                                    <p>{new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}</p>
                                    <p>{appointment.reason}</p>
                                </div>
                                <span className={`status ${appointment.status}`}>
                                    {appointment.status === 'pending' && 'Chờ xác nhận'}
                                    {appointment.status === 'confirmed' && 'Đã xác nhận'}
                                    {appointment.status === 'completed' && 'Đã hoàn thành'}
                                    {appointment.status === 'cancelled' && 'Đã hủy'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderDoctorProfile = () => {
        if (!doctorProfile) {
            return (
                <div className="error-message">
                    <p>Không thể tải thông tin hồ sơ</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => fetchDoctorProfile(user?.reference_id)}
                    >
                        Thử lại
                    </button>
                </div>
            );
        }

        return (
            <div className="profile-section">
                {!editProfile ? (
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <User size={64} />
                            </div>
                            <div className="profile-title">
                                <h3>{doctorProfile.first_name} {doctorProfile.last_name}</h3>
                                <p className="specialization">{doctorProfile.specialization}</p>
                            </div>
                            <button className="btn btn-primary" onClick={handleEditProfile}>
                                <Edit size={16} /> Chỉnh sửa
                            </button>
                        </div>

                        <div className="profile-info">
                            <div className="info-section">
                                <h4>Thông tin cá nhân</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Họ tên:</label>
                                        <span>{doctorProfile.first_name} {doctorProfile.last_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>{doctorProfile.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Số điện thoại:</label>
                                        <span>{doctorProfile.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h4>Thông tin chuyên môn</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Chuyên khoa:</label>
                                        <span>{doctorProfile.specialization}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Khoa:</label>
                                        <span>{doctorProfile.department_id?.name || 'Chưa phân công'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Số giấy phép:</label>
                                        <span>{doctorProfile.license_number || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Kinh nghiệm:</label>
                                        <span>{doctorProfile.experience_years ? `${doctorProfile.experience_years} năm` : 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                        <div className="form-header">
                            <h3>Chỉnh sửa hồ sơ cá nhân</h3>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Họ *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profileForm.first_name || ''}
                                    onChange={handleProfileChange}
                                    className={profileErrors.first_name ? 'error' : ''}
                                    placeholder="Nhập họ"
                                />
                                {profileErrors.first_name && (
                                    <span className="error-text">{profileErrors.first_name}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Tên *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={profileForm.last_name || ''}
                                    onChange={handleProfileChange}
                                    className={profileErrors.last_name ? 'error' : ''}
                                    placeholder="Nhập tên"
                                />
                                {profileErrors.last_name && (
                                    <span className="error-text">{profileErrors.last_name}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileForm.email || ''}
                                    onChange={handleProfileChange}
                                    className={profileErrors.email ? 'error' : ''}
                                    placeholder="Nhập email"
                                />
                                {profileErrors.email && (
                                    <span className="error-text">{profileErrors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone || ''}
                                    onChange={handleProfileChange}
                                    className={profileErrors.phone ? 'error' : ''}
                                    placeholder="VD: 0123456789"
                                />
                                {profileErrors.phone && (
                                    <span className="error-text">{profileErrors.phone}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Chuyên khoa *</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={profileForm.specialization || ''}
                                    onChange={handleProfileChange}
                                    className={profileErrors.specialization ? 'error' : ''}
                                    placeholder="VD: Tim mạch"
                                />
                                {profileErrors.specialization && (
                                    <span className="error-text">{profileErrors.specialization}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Số giấy phép</label>
                                <input
                                    type="text"
                                    name="license_number"
                                    value={profileForm.license_number || ''}
                                    onChange={handleProfileChange}
                                    placeholder="VD: BS001"
                                />
                            </div>

                            <div className="form-group">
                                <label>Kinh nghiệm (năm)</label>
                                <input
                                    type="number"
                                    name="experience_years"
                                    value={profileForm.experience_years || ''}
                                    onChange={handleProfileChange}
                                    min="0"
                                    max="50"
                                    placeholder="VD: 5"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setEditProfile(false)}>
                                <X size={16} /> Hủy
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <Save size={16} /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    const renderPendingAppointments = () => (
        <div className="appointments-section">
            <div className="section-header">
                <h3>Lịch hẹn chờ xác nhận ({pendingAppointments.length})</h3>
            </div>

            {pendingAppointments.length === 0 ? (
                <div className="empty-state">
                    <Clock size={48} />
                    <p>Không có lịch hẹn nào chờ xác nhận</p>
                </div>
            ) : (
                <div className="appointments-list">
                    {pendingAppointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="appointment-info">
                                <h4>{appointment.patient_name || `${appointment.patient_id?.first_name || ''} ${appointment.patient_id?.last_name || ''}`}</h4>
                                <p className="appointment-time">
                                    <Calendar size={16} />
                                    {new Date(appointment.appointment_time || appointment.appointment_date).toLocaleString('vi-VN')}
                                </p>
                                <p className="appointment-reason">{appointment.reason || 'Không có lý do'}</p>
                            </div>
                            <div className="appointment-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleConfirmAppointment(appointment._id, 'confirmed')}
                                    disabled={loading}
                                >
                                    <CheckCircle size={16} /> Xác nhận
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleConfirmAppointment(appointment._id, 'cancelled')}
                                    disabled={loading}
                                >
                                    <XCircle size={16} /> Từ chối
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAllAppointments = () => (
        <div className="appointments-section">
            <div className="section-header">
                <h3>Tất cả lịch hẹn ({allAppointments.length})</h3>
            </div>

            {allAppointments.length === 0 ? (
                <div className="empty-state">
                    <Calendar size={48} />
                    <p>Chưa có lịch hẹn nào</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Bệnh nhân</th>
                                <th>Thời gian</th>
                                <th>Lý do</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAppointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patient_name || `${appointment.patient_id?.first_name || ''} ${appointment.patient_id?.last_name || ''}`}</td>
                                    <td>{new Date(appointment.appointment_time || appointment.appointment_date).toLocaleString('vi-VN')}</td>
                                    <td>{appointment.reason || 'Không có'}</td>
                                    <td>
                                        <span className={`status ${appointment.status}`}>
                                            {appointment.status === 'pending' && 'Chờ xác nhận'}
                                            {appointment.status === 'confirmed' && 'Đã xác nhận'}
                                            {appointment.status === 'completed' && 'Đã hoàn thành'}
                                            {appointment.status === 'cancelled' && 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td>
                                        {appointment.status === 'confirmed' && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSelectAppointment(appointment)}
                                            >
                                                <FileText size={14} /> Cập nhật bệnh án
                                            </button>
                                        )}
                                        {appointment.status === 'completed' && (
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleSelectAppointment(appointment)}
                                            >
                                                <Eye size={14} /> Xem bệnh án
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderModal = () => {
        if (!showModal) return null;

        return (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>
                            Hồ Sơ Bệnh Án - {selectedAppointment?.patient_name || `${selectedAppointment?.patient_id?.first_name || ''} ${selectedAppointment?.patient_id?.last_name || ''}`}
                        </h3>
                        <button onClick={() => setShowModal(false)} className="modal-close">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleUpdateMedicalRecord}>
                            <div className="form-group">
                                <label>Chẩn đoán *</label>
                                <textarea
                                    value={medicalRecord.diagnosis}
                                    onChange={e => setMedicalRecord({ ...medicalRecord, diagnosis: e.target.value })}
                                    required
                                    rows="3"
                                    placeholder="Nhập chẩn đoán..."
                                    disabled={selectedAppointment?.status === 'completed'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Đơn thuốc *</label>
                                <textarea
                                    value={medicalRecord.prescription}
                                    onChange={e => setMedicalRecord({ ...medicalRecord, prescription: e.target.value })}
                                    required
                                    rows="4"
                                    placeholder="Nhập đơn thuốc..."
                                    disabled={selectedAppointment?.status === 'completed'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    value={medicalRecord.notes}
                                    onChange={e => setMedicalRecord({ ...medicalRecord, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Nhập ghi chú thêm..."
                                    disabled={selectedAppointment?.status === 'completed'}
                                />
                            </div>
                            {selectedAppointment?.status !== 'completed' && (
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={18} />
                                        {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="doctor-dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <FileText className="title-icon" />
                            MediCare+ Doctor
                        </h1>
                    </div>
                    <div className="header-right">
                        <span className="welcome-text">
                            Xin chào, {doctorProfile?.first_name || user?.first_name || user?.username}
                        </span>
                        <button onClick={handleBackToHome} className="btn btn-outline btn-sm">
                            <Home size={18} />
                            Trang chủ
                        </button>
                        <button onClick={handleLogout} className="btn btn-danger btn-sm">
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="container">
                    <div className="dashboard-layout">
                        <aside className="dashboard-sidebar">
                            <nav className="sidebar-nav">
                                <button
                                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('dashboard')}
                                >
                                    <BarChart3 size={20} />
                                    Tổng quan
                                </button>
                                <button
                                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User size={20} />
                                    Hồ sơ cá nhân
                                </button>
                                <button
                                    className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    <Clock size={20} />
                                    Lịch hẹn chờ xác nhận
                                    {pendingAppointments.length > 0 && (
                                        <span className="badge">{pendingAppointments.length}</span>
                                    )}
                                </button>
                                <button
                                    className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('appointments')}
                                >
                                    <Calendar size={20} />
                                    Tất cả lịch hẹn
                                </button>
                            </nav>
                        </aside>

                        <main className="dashboard-main">
                            {loading && (
                                <div className="loading-overlay">
                                    <div className="loading-spinner"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            )}

                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'profile' && renderDoctorProfile()}
                            {activeTab === 'pending' && renderPendingAppointments()}
                            {activeTab === 'appointments' && renderAllAppointments()}
                        </main>
                    </div>
                </div>
            </div>

            {renderModal()}
        </div>
    );
};

export default DoctorDashboard;
