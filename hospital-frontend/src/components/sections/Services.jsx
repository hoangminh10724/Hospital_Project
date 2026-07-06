// src/components/sections/Services.jsx
import React from 'react';
import { Heart, Brain, Eye, Bone, Baby, Stethoscope } from 'lucide-react';
import './Services.css';

const Services = () => {
    const services = [
        {
            icon: <Heart />,
            title: "Tim mạch",
            description: "Chẩn đoán và điều trị các bệnh về tim mạch với công nghệ hiện đại"
        },
        {
            icon: <Brain />,
            title: "Thần kinh",
            description: "Chuyên khoa thần kinh với đội ngũ bác sĩ giàu kinh nghiệm"
        },
        {
            icon: <Eye />,
            title: "Mắt",
            description: "Khám và điều trị các bệnh về mắt, phẫu thuật mắt"
        },
        {
            icon: <Bone />,
            title: "Xương khớp",
            description: "Điều trị các bệnh về xương khớp, chấn thương thể thao"
        },
        {
            icon: <Baby />,
            title: "Sản phụ khoa",
            description: "Chăm sóc sức khỏe phụ nữ và trẻ em toàn diện"
        },
        {
            icon: <Stethoscope />,
            title: "Nội tổng quát",
            description: "Khám và điều trị các bệnh nội khoa thường gặp"
        }
    ];

    return (
        <section className="section services" id="services">
            <div className="container">
                <div className="section-title">
                    <h2>Dịch vụ y tế</h2>
                    <p>Chúng tôi cung cấp đầy đủ các dịch vụ y tế chuyên nghiệp</p>
                </div>

                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-card">
                            <div className="service-icon">
                                {service.icon}
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            <a href="#" className="service-link">Tìm hiểu thêm →</a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
