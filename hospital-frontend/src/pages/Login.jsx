// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Sending login request with data:', formData); // Debug log
            const response = await authAPI.login(formData);
            console.log('Login response:', response); // Debug log

            if (response.data && response.data.success && response.data.token) {
                // Lưu token và user info
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log('Login successful, user:', response.data.user);

                // Chuyển hướng dựa trên role của user
                const userRole = response.data.user?.role;
                switch (userRole) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'patient':
                        navigate('/patient-dashboard');
                        break;
                    case 'doctor':
                        navigate('/doctor-dashboard');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                throw new Error('Invalid server response format');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 403) {
                setError('Tài khoản hoặc mật khẩu không chính xác');
            } else if (error.response?.status === 401) {
                setError('Không có quyền truy cập');
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="login-page">
            {/* Header với nút quay lại */}
            <div className="login-header">
                <div className="container">
                    <button onClick={handleBackToHome} className="back-to-home-btn">
                        <ArrowLeft size={20} />
                        Quay lại trang chủ
                    </button>
                    <Link to="/" className="home-logo">
                        <Home size={20} />
                        MediCare+
                    </Link>
                </div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <h2>Đăng nhập</h2>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p>
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
