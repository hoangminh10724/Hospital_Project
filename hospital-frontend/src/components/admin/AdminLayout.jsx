// src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import {
    Home, Users, UserCheck, Calendar, FileText,
    CreditCard, Star, BarChart3, Settings, LogOut,
    Menu, X
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Home /> },
        { id: 'patients', label: 'Bệnh nhân', icon: <Users /> },
        { id: 'doctors', label: 'Bác sĩ', icon: <UserCheck /> },
        { id: 'appointments', label: 'Lịch hẹn', icon: <Calendar /> },
        { id: 'medical-records', label: 'Hồ sơ bệnh án', icon: <FileText /> },
        { id: 'payments', label: 'Thanh toán', icon: <CreditCard /> },
        { id: 'reviews', label: 'Đánh giá', icon: <Star /> },
        { id: 'statistics', label: 'Thống kê', icon: <BarChart3 /> },
        { id: 'settings', label: 'Cài đặt', icon: <Settings /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>MediCare+ Admin</h2>
                    <button
                        className="sidebar-toggle mobile-only"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}

                    <button className="nav-item logout" onClick={handleLogout}>
                        <LogOut />
                        <span>Đăng xuất</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <button
                        className="sidebar-toggle desktop-hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu />
                    </button>
                    <div className="header-info">
                        <h1>Quản trị hệ thống</h1>
                        <p>Chào mừng Admin!</p>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
