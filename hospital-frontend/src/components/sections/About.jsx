// src/components/sections/About.jsx
import React from 'react';
import { Award, Users, Heart, Shield } from 'lucide-react';
import './About.css';

const About = () => {
    return (
        <section className="section about" id="about">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <div className="section-title-left">
                            <h2>Về chúng tôi</h2>
                            <p>
                                Với hơn 15 năm kinh nghiệm trong lĩnh vực y tế, chúng tôi cam kết
                                mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho cộng đồng.
                            </p>
                        </div>

                        <div className="about-features">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <Award />
                                </div>
                                <div className="feature-content">
                                    <h4>Chất lượng hàng đầu</h4>
                                    <p>Được công nhận bởi các tổ chức y tế quốc tế</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <Users />
                                </div>
                                <div className="feature-content">
                                    <h4>Đội ngũ chuyên nghiệp</h4>
                                    <p>Bác sĩ giàu kinh nghiệm và tận tâm</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <Heart />
                                </div>
                                <div className="feature-content">
                                    <h4>Chăm sóc tận tình</h4>
                                    <p>Luôn đặt bệnh nhân lên hàng đầu</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <Shield />
                                </div>
                                <div className="feature-content">
                                    <h4>An toàn tuyệt đối</h4>
                                    <p>Tuân thủ nghiêm ngặt các tiêu chuẩn y tế</p>
                                </div>
                            </div>
                        </div>

                        <div className="about-actions">
                            <a href="#contact" className="btn btn-primary">Liên hệ ngay</a>
                            <a href="#services" className="btn btn-outline">Xem dịch vụ</a>
                        </div>
                    </div>

                    <div className="about-image">
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Hospital Interior"
                        />
                        <div className="about-stats">
                            <div className="stat">
                                <h3>15+</h3>
                                <p>Năm kinh nghiệm</p>
                            </div>
                            <div className="stat">
                                <h3>50+</h3>
                                <p>Bác sĩ chuyên khoa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
