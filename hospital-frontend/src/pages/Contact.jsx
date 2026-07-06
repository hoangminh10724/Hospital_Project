// src/pages/Contact.jsx
import React, { useState } from 'react';
import {
    MapPin, Phone, Mail, Clock, Send,
    Facebook, Twitter, Instagram, Linkedin,
    MessageCircle, Calendar, Users
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const departments = [
        { id: 'general', name: 'Thông tin chung' },
        { id: 'appointment', name: 'Đặt lịch hẹn' },
        { id: 'emergency', name: 'Cấp cứu' },
        { id: 'billing', name: 'Thanh toán' },
        { id: 'feedback', name: 'Góp ý - Phản hồi' }
    ];

    const contactInfo = [
        {
            icon: <MapPin />,
            title: "Địa chỉ",
            content: "123 Đường Y Tế, Quận 1\nTP. Hồ Chí Minh, Việt Nam",
            action: "Xem bản đồ"
        },
        {
            icon: <Phone />,
            title: "Điện thoại",
            content: "Tổng đài: +84 123 456 789\nCấp cứu: +84 987 654 321",
            action: "Gọi ngay"
        },
        {
            icon: <Mail />,
            title: "Email",
            content: "info@medicare.com\nsupport@medicare.com",
            action: "Gửi email"
        },
        {
            icon: <Clock />,
            title: "Giờ làm việc",
            content: "T2-T7: 8:00 - 17:00\nCN: 8:00 - 12:00\nCấp cứu: 24/7",
            action: null
        }
    ];

    const quickActions = [
        {
            icon: <Calendar />,
            title: "Đặt lịch khám",
            description: "Đặt lịch hẹn với bác sĩ chuyên khoa",
            link: "/appointment",
            color: "primary"
        },
        {
            icon: <MessageCircle />,
            title: "Tư vấn trực tuyến",
            description: "Chat với bác sĩ qua video call",
            link: "#",
            color: "secondary"
        },
        {
            icon: <Users />,
            title: "Dịch vụ khách hàng",
            description: "Hỗ trợ 24/7 cho mọi thắc mắc",
            link: "#",
            color: "accent"
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                department: ''
            });
        }, 2000);
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="container">
                    <h1>Liên hệ với chúng tôi</h1>
                    <p>Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn</p>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
                <div className="container">
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <a key={index} href={action.link} className={`quick-action-card ${action.color}`}>
                                <div className="action-icon">
                                    {action.icon}
                                </div>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <h2>Gửi tin nhắn cho chúng tôi</h2>
                            <p>Điền thông tin vào form bên dưới và chúng tôi sẽ phản hồi sớm nhất</p>

                            {submitted ? (
                                <div className="success-message">
                                    <div className="success-icon">
                                        <Send size={40} color="#10b981" />
                                    </div>
                                    <h3>Gửi tin nhắn thành công!</h3>
                                    <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        Gửi tin nhắn khác
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Họ và tên *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phòng ban</label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Chọn phòng ban</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Chủ đề *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nội dung tin nhắn *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="6"
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <div className="loading-spinner"></div>
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Gửi tin nhắn
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info-section">
                            <h2>Thông tin liên hệ</h2>
                            <div className="contact-cards">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="contact-info-card">
                                        <div className="contact-icon">
                                            {info.icon}
                                        </div>
                                        <div className="contact-details">
                                            <h4>{info.title}</h4>
                                            <p>{info.content}</p>
                                            {info.action && (
                                                <button className="contact-action">{info.action}</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Social Media */}
                            <div className="social-section">
                                <h3>Theo dõi chúng tôi</h3>
                                <div className="social-links">
                                    <a href="#" className="social-link facebook">
                                        <Facebook size={20} />
                                    </a>
                                    <a href="#" className="social-link twitter">
                                        <Twitter size={20} />
                                    </a>
                                    <a href="#" className="social-link instagram">
                                        <Instagram size={20} />
                                    </a>
                                    <a href="#" className="social-link linkedin">
                                        <Linkedin size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section">
                <div className="container">
                    <h2>Vị trí bệnh viện</h2>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sBệnh%20viện%20Đại%20học%20Y%20Dược%20TP.HCM!5e0!3m2!1svi!2s!4v1234567890"
                            width="100%"
                            height="400"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="container">
                    <h2>Câu hỏi thường gặp</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Làm thế nào để đặt lịch khám?</h4>
                            <p>Bạn có thể đặt lịch khám qua website, hotline hoặc trực tiếp tại bệnh viện.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Bệnh viện có dịch vụ cấp cứu 24/7 không?</h4>
                            <p>Có, chúng tôi cung cấp dịch vụ cấp cứu 24/7 với đội ngũ y bác sĩ chuyên nghiệp.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Có thể thanh toán bằng thẻ không?</h4>
                            <p>Có, chúng tôi chấp nhận thanh toán bằng tiền mặt, thẻ ATM, và chuyển khoản.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Có dịch vụ đưa đón không?</h4>
                            <p>Chúng tôi có dịch vụ xe cứu thương và hỗ trợ đưa đón cho các trường hợp đặc biệt.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
