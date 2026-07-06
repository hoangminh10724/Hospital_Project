// src/pages/About.jsx
import React from 'react';
import { Award, Users, Heart, Shield, Target, Eye } from 'lucide-react';
import './About.css';

const About = () => {
    const values = [
        {
            icon: <Heart />,
            title: "Tận tâm",
            description: "Luôn đặt bệnh nhân lên hàng đầu trong mọi hoạt động"
        },
        {
            icon: <Shield />,
            title: "An toàn",
            description: "Tuân thủ nghiêm ngặt các tiêu chuẩn y tế quốc tế"
        },
        {
            icon: <Award />,
            title: "Chất lượng",
            description: "Cam kết mang đến dịch vụ y tế chất lượng cao"
        },
        {
            icon: <Users />,
            title: "Chuyên nghiệp",
            description: "Đội ngũ y bác sĩ giàu kinh nghiệm và tận tâm"
        }
    ];

    const milestones = [
        { year: "2008", event: "Thành lập bệnh viện với 50 giường bệnh" },
        { year: "2012", event: "Mở rộng quy mô lên 150 giường bệnh" },
        { year: "2016", event: "Đạt chứng nhận JCI về chất lượng y tế" },
        { year: "2020", event: "Khánh thành tòa nhà mới với 300 giường bệnh" },
        { year: "2024", event: "Phục vụ hơn 100,000 bệnh nhân mỗi năm" }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Về MediCare+</h1>
                        <p>
                            Với hơn 15 năm kinh nghiệm, chúng tôi cam kết mang đến
                            dịch vụ chăm sóc sức khỏe tốt nhất cho cộng đồng
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="mission-vision">
                <div className="container">
                    <div className="mv-grid">
                        <div className="mv-card">
                            <div className="mv-icon">
                                <Target />
                            </div>
                            <h3>Sứ mệnh</h3>
                            <p>
                                Cung cấp dịch vụ y tế chất lượng cao, an toàn và hiệu quả,
                                góp phần nâng cao sức khỏe cộng đồng và chất lượng cuộc sống.
                            </p>
                        </div>

                        <div className="mv-card">
                            <div className="mv-icon">
                                <Eye />
                            </div>
                            <h3>Tầm nhìn</h3>
                            <p>
                                Trở thành bệnh viện hàng đầu trong khu vực, được tin tưởng
                                bởi chất lượng dịch vụ và sự chăm sóc tận tâm.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="core-values">
                <div className="container">
                    <div className="section-title">
                        <h2>Giá trị cốt lõi</h2>
                        <p>Những giá trị định hướng mọi hoạt động của chúng tôi</p>
                    </div>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">
                                    {value.icon}
                                </div>
                                <h4>{value.title}</h4>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section">
                <div className="container">
                    <div className="section-title">
                        <h2>Lịch sử phát triển</h2>
                        <p>Hành trình 15 năm xây dựng và phát triển</p>
                    </div>

                    <div className="timeline">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-year">{milestone.year}</div>
                                <div className="timeline-content">
                                    <p>{milestone.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
