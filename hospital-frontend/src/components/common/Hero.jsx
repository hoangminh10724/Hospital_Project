// src/components/common/Hero.jsx
import React from 'react';
import { Calendar, Shield, Heart, Users } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="home">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>
                            Chăm sóc sức khỏe <br />
                            <span className="highlight">chuyên nghiệp</span> <br />
                            cho mọi người
                        </h1>
                        <p>
                            Chúng tôi cung cấp dịch vụ y tế chất lượng cao với đội ngũ bác sĩ
                            giàu kinh nghiệm và trang thiết bị hiện đại nhất.
                        </p>
                        <div className="hero-actions">
                            <a href="#appointment" className="btn btn-primary">
                                Đặt lịch khám
                            </a>
                            <a href="#services" className="btn btn-outline">
                                Tìm hiểu thêm
                            </a>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Medical Team"
                        />
                    </div>
                </div>

                <div className="hero-stats">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <Users />
                        </div>
                        <div className="stat-content">
                            <h3>10,000+</h3>
                            <p>Bệnh nhân hài lòng</p>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <Shield />
                        </div>
                        <div className="stat-content">
                            <h3>50+</h3>
                            <p>Bác sĩ chuyên khoa</p>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <Heart />
                        </div>
                        <div className="stat-content">
                            <h3>15+</h3>
                            <p>Năm kinh nghiệm</p>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <Calendar />
                        </div>
                        <div className="stat-content">
                            <h3>24/7</h3>
                            <p>Dịch vụ cấp cứu</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
