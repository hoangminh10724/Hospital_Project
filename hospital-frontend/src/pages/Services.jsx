// src/pages/Services.jsx
import React, { useState } from 'react';
import {
    Heart, Brain, Eye, Bone, Baby, Stethoscope,
    Search, Filter, ChevronRight
} from 'lucide-react';
import './Services.css';

const Services = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const services = [
        {
            id: 1,
            icon: <Heart />,
            title: "Tim mạch",
            category: "specialist",
            description: "Chẩn đoán và điều trị các bệnh về tim mạch với công nghệ hiện đại",
            features: ["Siêu âm tim", "Điện tâm đồ", "Thông tim", "Phẫu thuật tim"],
            price: "500,000 - 2,000,000 VNĐ"
        },
        {
            id: 2,
            icon: <Brain />,
            title: "Thần kinh",
            category: "specialist",
            description: "Chuyên khoa thần kinh với đội ngũ bác sĩ giàu kinh nghiệm",
            features: ["MRI não", "Điện não đồ", "Điều trị đột quỵ", "Phẫu thuật não"],
            price: "400,000 - 1,500,000 VNĐ"
        },
        {
            id: 3,
            icon: <Eye />,
            title: "Mắt",
            category: "specialist",
            description: "Khám và điều trị các bệnh về mắt, phẫu thuật mắt",
            features: ["Khám tật khúc xạ", "Phẫu thuật cận thị", "Điều trị glaucoma", "Phẫu thuật võng mạc"],
            price: "200,000 - 800,000 VNĐ"
        },
        {
            id: 4,
            icon: <Bone />,
            title: "Xương khớp",
            category: "specialist",
            description: "Điều trị các bệnh về xương khớp, chấn thương thể thao",
            features: ["X-quang", "MRI khớp", "Phẫu thuật khớp", "Vật lý trị liệu"],
            price: "300,000 - 1,200,000 VNĐ"
        },
        {
            id: 5,
            icon: <Baby />,
            title: "Sản phụ khoa",
            category: "specialist",
            description: "Chăm sóc sức khỏe phụ nữ và trẻ em toàn diện",
            features: ["Khám thai", "Siêu âm 4D", "Sinh thường", "Mổ đẻ"],
            price: "250,000 - 1,000,000 VNĐ"
        },
        {
            id: 6,
            icon: <Stethoscope />,
            title: "Nội tổng quát",
            category: "general",
            description: "Khám và điều trị các bệnh nội khoa thường gặp",
            features: ["Khám tổng quát", "Xét nghiệm máu", "Siêu âm bụng", "Nội soi"],
            price: "150,000 - 500,000 VNĐ"
        }
    ];

    const categories = [
        { id: 'all', name: 'Tất cả dịch vụ' },
        { id: 'general', name: 'Khám tổng quát' },
        { id: 'specialist', name: 'Chuyên khoa' },
        { id: 'emergency', name: 'Cấp cứu' },
        { id: 'diagnostic', name: 'Chẩn đoán hình ảnh' }
    ];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="services-page">
            {/* Hero Section */}
            <section className="services-hero">
                <div className="container">
                    <h1>Dịch vụ y tế</h1>
                    <p>Khám phá đầy đủ các dịch vụ y tế chuyên nghiệp của chúng tôi</p>
                </div>
            </section>

            {/* Search and Filter */}
            <section className="services-filter">
                <div className="container">
                    <div className="filter-bar">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm dịch vụ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="category-filter">
                            <Filter size={20} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="services-content">
                <div className="container">
                    <div className="services-grid">
                        {filteredServices.map(service => (
                            <div key={service.id} className="service-card">
                                <div className="service-header">
                                    <div className="service-icon">
                                        {service.icon}
                                    </div>
                                    <h3>{service.title}</h3>
                                </div>

                                <p className="service-description">{service.description}</p>

                                <div className="service-features">
                                    <h4>Dịch vụ bao gồm:</h4>
                                    <ul>
                                        {service.features.map((feature, index) => (
                                            <li key={index}>
                                                <ChevronRight size={16} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="service-price">
                                    <span>Giá: {service.price}</span>
                                </div>

                                <div className="service-actions">
                                    <button className="btn btn-primary">Đặt lịch khám</button>
                                    <button className="btn btn-outline">Tìm hiểu thêm</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="no-results">
                            <p>Không tìm thấy dịch vụ phù hợp</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Emergency Section */}
            <section className="emergency-section">
                <div className="container">
                    <div className="emergency-card">
                        <h2>Dịch vụ cấp cứu 24/7</h2>
                        <p>Chúng tôi luôn sẵn sàng phục vụ trong các trường hợp khẩn cấp</p>
                        <div className="emergency-contact">
                            <span>Hotline cấp cứu: </span>
                            <strong>+84 987 654 321</strong>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;
