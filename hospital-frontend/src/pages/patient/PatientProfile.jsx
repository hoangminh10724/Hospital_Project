// src/pages/patient/PatientProfile.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, Save, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import './PatientProfile.css';

const PatientProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        emergency_contact: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // SỬA LỖI: Thêm function format ngày
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            // Format thành yyyy-MM-dd cho input type="date"
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('=== DEBUG PATIENT PROFILE ===');
        console.log('User data:', userData);
        console.log('Token exists:', !!token);

        if (userData && token) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user:', parsedUser);
                console.log('User role:', parsedUser.role);
                console.log('Reference ID:', parsedUser.reference_id);

                setUser(parsedUser);

                const patientId = parsedUser.reference_id || parsedUser.patient_id;
                if (patientId) {
                    loadProfile(patientId);
                } else {
                    setError('Không tìm thấy ID bệnh nhân');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const loadProfile = async (patientId) => {
        try {
            console.log('Loading profile for patient ID:', patientId);

            const response = await patientAPI.getById(patientId);
            console.log('Profile response:', response.data);

            const profile = response.data.success ? response.data.data : response.data;

            console.log('Profile data:', profile);

            // SỬA LỖI: Format ngày sinh đúng cách
            setProfileData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                dob: formatDateForInput(profile.dob), // SỬA LỖI: Format ngày
                gender: profile.gender || '',
                address: profile.address || '',
                emergency_contact: profile.emergency_contact || ''
            });

        } catch (error) {
            console.error('Error loading profile:', error);
            console.error('Error response:', error.response?.data);
            setError('Không thể tải thông tin cá nhân');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const patientId = user.reference_id || user.patient_id;

            console.log('=== UPDATING PROFILE ===');
            console.log('Patient ID:', patientId);
            console.log('Profile data to update:', profileData);

            // SỬA LỖI: Validation trước khi gửi
            if (!profileData.first_name || !profileData.last_name) {
                setError('Họ tên không được để trống');
                return;
            }

            if (!profileData.email) {
                setError('Email không được để trống');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profileData.email)) {
                setError('Email không đúng định dạng');
                return;
            }

            // Validate phone
            if (profileData.phone && !/^[0-9+\-\s()]+$/.test(profileData.phone)) {
                setError('Số điện thoại chỉ được chứa số và ký tự +, -, (), space');
                return;
            }

            const response = await patientAPI.update(patientId, profileData);

            console.log('Update response:', response.data);

            if (response.data?.success || response.status === 200) {
                setSuccess('Cập nhật thông tin thành công!');

                // SỬA LỖI: Cập nhật localStorage nếu cần
                if (user.email !== profileData.email) {
                    const updatedUser = { ...user, email: profileData.email };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } else {
                throw new Error('Update failed');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            console.error('Error response:', error.response?.data);

            // SỬA LỖI: Error handling chi tiết hơn
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ';
                setError(errorMessage);
            } else if (error.response?.status === 409) {
                setError('Email hoặc số điện thoại đã được sử dụng');
            } else if (error.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.response?.status === 404) {
                setError('Không tìm thấy thông tin bệnh nhân');
            } else {
                setError('Không thể cập nhật thông tin. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // SỬA LỖI: Clear error khi user thay đổi input
        if (error) setError('');
        if (success) setSuccess('');

        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    return (
        <div className="patient-profile">
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
                    <h1>Cập nhật thông tin cá nhân</h1>
                    <p>Chỉnh sửa thông tin cá nhân của bạn</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Họ *</label>
                            <input
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleChange}
                                required
                                maxLength="50"
                            />
                        </div>
                        <div className="form-group">
                            <label>Tên *</label>
                            <input
                                type="text"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleChange}
                                required
                                maxLength="50"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            required
                            maxLength="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            placeholder="VD: 0123456789"
                            maxLength="15"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="dob"
                                value={profileData.dob}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]} // Không cho chọn ngày tương lai
                            />
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select
                                name="gender"
                                value={profileData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ</label>
                        <textarea
                            name="address"
                            value={profileData.address}
                            onChange={handleChange}
                            rows="3"
                            maxLength="200"
                            placeholder="Nhập địa chỉ của bạn"
                        />
                    </div>

                    <div className="form-group">
                        <label>Liên hệ khẩn cấp</label>
                        <input
                            type="text"
                            name="emergency_contact"
                            value={profileData.emergency_contact}
                            onChange={handleChange}
                            placeholder="Tên và số điện thoại người liên hệ"
                            maxLength="100"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientProfile;
