// src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, MapPin, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css'; // Sửa đường dẫn CSS

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // Thêm hàm isActive bị thiếu
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        // Kiểm tra và xử lý an toàn localStorage
        if (token && userData && userData !== 'undefined' && userData !== 'null') {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Xóa dữ liệu lỗi khỏi localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setShowDropdown(false);
        navigate('/');
        // Không cần reload trang
    };

    const handleProfileClick = () => {
        if (user?.role === 'patient') {
            navigate('/patient-dashboard');
        } else if (user?.role === 'admin') {
            navigate('/admin');
        } else if (user?.role === 'doctor') {
            navigate('/doctor-dashboard');
        }
        setShowDropdown(false);
    };

    // Đóng dropdown khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.user-menu')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <header className="header">
            <div className="header-top">
                <div className="container">
                    <div className="header-info">
                        <div className="info-item">
                            <Phone size={16} />
                            <span>+84 123 456 789</span>
                        </div>
                        <div className="info-item">
                            <Mail size={16} />
                            <span>info@hospital.com</span>
                        </div>
                        <div className="info-item">
                            <Clock size={16} />
                            <span>24/7 Emergency Service</span>
                        </div>
                        <div className="info-item">
                            <MapPin size={16} />
                            <span>123 Medical Street, City</span>
                        </div>
                    </div>
                </div>
            </div>

            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <Link to="/" className="logo">
                            <h2>MediCare+</h2>
                        </Link>

                        <ul className="nav-menu">
                            <li><Link to="/" className={isActive('/')}>Trang chủ</Link></li>
                            <li><Link to="/about" className={isActive('/about')}>Giới thiệu</Link></li>
                            <li><Link to="/services" className={isActive('/services')}>Dịch vụ</Link></li>
                            <li><Link to="/doctors" className={isActive('/doctors')}>Bác sĩ</Link></li>
                            <li><Link to="/appointment" className={isActive('/appointment')}>Đặt lịch</Link></li>
                            <li><Link to="/contact" className={isActive('/contact')}>Liên hệ</Link></li>
                        </ul>

                        <div className="nav-actions">
                            {user ? (
                                <div className="user-menu">
                                    <button
                                        className="user-profile-btn"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        aria-expanded={showDropdown}
                                        aria-haspopup="true"
                                    >
                                        <User size={20} />
                                        <span>Xin chào, {user.first_name || user.username}</span>
                                    </button>

                                    {showDropdown && (
                                        <div className="dropdown-menu" role="menu">
                                            <button
                                                onClick={handleProfileClick}
                                                className="dropdown-item"
                                                role="menuitem"
                                            >
                                                <User size={16} />
                                                Hồ sơ của tôi
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="dropdown-item logout"
                                                role="menuitem"
                                            >
                                                <LogOut size={16} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
                                    <Link to="/register" className="btn btn-primary">Đăng ký</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
