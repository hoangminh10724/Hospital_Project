// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, LogOut, Calendar, Activity, CreditCard, Edit, Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        console.log('=== DEBUG PATIENT DASHBOARD ===');
        console.log('Token exists:', !!token);
        console.log('User data:', userData);

        if (!token || !userData || userData === 'undefined') {
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

            const patientId = parsedUser.reference_id;
            if (patientId) {
                loadPatientProfile(patientId);
            } else {
                setError('Không tìm thấy thông tin bệnh nhân');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const loadPatientProfile = async (patientId) => {
        try {
            setLoading(true);
            setError('');

            console.log('Loading patient profile for ID:', patientId);

            const response = await patientAPI.getById(patientId);
            console.log('Profile response:', response.data);

            if (response.data) {
                const profile = response.data.success ? response.data.data : response.data;
                setPatientProfile(profile);
                console.log('Patient profile loaded:', profile);
            }
        } catch (error) {
            console.error('Error loading patient profile:', error);
            setError('Không thể tải thông tin bệnh nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBookAppointment = () => {
        navigate('/appointment');
    };

    const handleViewMedicalRecords = () => {
        navigate('/patient/medical-records');
    };

    const handleUpdateProfile = () => {
        navigate('/patient/profile');
    };

    const handlePayments = () => {
        navigate('/patient/payments');
    };

    const handleViewAllAppointments = () => {
        navigate('/patient/appointments');
    };

    if (loading) {
        return (
            <div className="patient-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải thông tin bệnh nhân...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-dashboard">
            {/* Header */}
            <div className="dashboard-header-bar">
                <div className="container">
                    <div className="header-left">
                        <Link to="/" className="home-btn">
                            <Home size={20} />
                            MediCare+
                        </Link>
                    </div>
                    <div className="header-right">
                        <span className="welcome-text">
                            Xin chào, {user?.first_name || user?.username}
                        </span>
                        <button onClick={handleLogout} className="logout-btn">
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Patient Profile Header */}
                <div className="patient-profile-header">
                    <div className="profile-avatar">
                        <User size={64} />
                    </div>
                    <div className="profile-info">
                        <h1>
                            {patientProfile?.first_name || user?.first_name || 'Chưa có'} {' '}
                            {patientProfile?.last_name || user?.last_name || ''}
                        </h1>
                        <div className="profile-details">
                            <div className="detail-item">
                                <Mail size={16} />
                                <span>{patientProfile?.email || user?.email || 'Chưa có email'}</span>
                            </div>
                            <div className="detail-item">
                                <Phone size={16} />
                                <span>{patientProfile?.phone || 'Chưa có số điện thoại'}</span>
                            </div>
                            <div className="detail-item">
                                <MapPin size={16} />
                                <span>{patientProfile?.address || 'Chưa có địa chỉ'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Thao tác nhanh</h2>
                    <div className="action-buttons">
                        <button onClick={handleBookAppointment} className="action-btn primary">
                            <Calendar />
                            <span>Đặt lịch khám</span>
                        </button>

                        <button onClick={handleViewAllAppointments} className="action-btn">
                            <Calendar />
                            <span>Xem lịch hẹn</span>
                        </button>

                        <button onClick={handleViewMedicalRecords} className="action-btn">
                            <Activity />
                            <span>Hồ sơ bệnh án</span>
                        </button>

                        <button onClick={handlePayments} className="action-btn">
                            <CreditCard />
                            <span>Thanh toán</span>
                        </button>

                        <button onClick={handleUpdateProfile} className="action-btn">
                            <Edit />
                            <span>Cập nhật thông tin</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
