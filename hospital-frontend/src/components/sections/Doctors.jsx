// src/components/sections/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - sẽ thay thế bằng API call thực
    useEffect(() => {
        const mockDoctors = [
            {
                id: 1,
                name: "BS. Nguyễn Văn A",
                specialization: "Tim mạch",
                experience: "10+ năm kinh nghiệm",
                rating: 4.9,
                image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                location: "Khoa Tim mạch"
            },
            {
                id: 2,
                name: "BS. Trần Thị B",
                specialization: "Thần kinh",
                experience: "8+ năm kinh nghiệm",
                rating: 4.8,
                image: "https://images.unsplash.com/photo-1594824475317-d6b8e0b5f7b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                location: "Khoa Thần kinh"
            },
            {
                id: 3,
                name: "BS. Lê Văn C",
                specialization: "Xương khớp",
                experience: "12+ năm kinh nghiệm",
                rating: 4.9,
                image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                location: "Khoa Xương khớp"
            }
        ];

        setTimeout(() => {
            setDoctors(mockDoctors);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <section className="section doctors">
                <div className="container">
                    <div className="loading">Đang tải...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="section doctors" id="doctors">
            <div className="container">
                <div className="section-title">
                    <h2>Đội ngũ bác sĩ</h2>
                    <p>Gặp gỡ các bác sĩ chuyên khoa giàu kinh nghiệm của chúng tôi</p>
                </div>

                <div className="doctors-grid">
                    {doctors.map((doctor) => (
                        <div key={doctor.id} className="doctor-card">
                            <div className="doctor-image">
                                <img src={doctor.image} alt={doctor.name} />
                                <div className="doctor-overlay">
                                    <button className="btn btn-primary">Đặt lịch khám</button>
                                </div>
                            </div>

                            <div className="doctor-info">
                                <h3>{doctor.name}</h3>
                                <p className="specialization">{doctor.specialization}</p>

                                <div className="doctor-details">
                                    <div className="detail-item">
                                        <Clock size={16} />
                                        <span>{doctor.experience}</span>
                                    </div>
                                    <div className="detail-item">
                                        <MapPin size={16} />
                                        <span>{doctor.location}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Star size={16} fill="currentColor" />
                                        <span>{doctor.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="doctors-actions">
                    <a href="/doctors" className="btn btn-outline">Xem tất cả bác sĩ</a>
                </div>
            </div>
        </section>
    );
};

export default Doctors;
