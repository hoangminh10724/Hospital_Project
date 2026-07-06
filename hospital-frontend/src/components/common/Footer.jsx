// src/components/common/Footer.jsx
import React from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>MediCare+</h3>
                        <p>
                            Chúng tôi cam kết cung cấp dịch vụ y tế chất lượng cao
                            với sự chăm sóc tận tâm và công nghệ hiện đại.
                        </p>
                        <div className="social-links">
                            <a href="#"><Facebook size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Liên kết nhanh</h4>
                        <ul>
                            <li><a href="#home">Trang chủ</a></li>
                            <li><a href="#about">Giới thiệu</a></li>
                            <li><a href="#services">Dịch vụ</a></li>
                            <li><a href="#doctors">Bác sĩ</a></li>
                            <li><a href="#contact">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Dịch vụ</h4>
                        <ul>
                            <li><a href="#">Khám tổng quát</a></li>
                            <li><a href="#">Chẩn đoán hình ảnh</a></li>
                            <li><a href="#">Xét nghiệm</a></li>
                            <li><a href="#">Phẫu thuật</a></li>
                            <li><a href="#">Cấp cứu 24/7</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Thông tin liên hệ</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>123 Medical Street, City</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>+84 123 456 789</span>
                            </div>
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>info@hospital.com</span>
                            </div>
                            <div className="contact-item">
                                <Clock size={16} />
                                <span>24/7 Emergency Service</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 MediCare+. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
