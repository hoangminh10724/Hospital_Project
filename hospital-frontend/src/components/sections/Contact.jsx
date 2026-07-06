// src/components/sections/Contact.jsx
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Contact form:', formData);
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <section className="section contact" id="contact">
            <div className="container">
                <div className="section-title">
                    <h2>Liên hệ với chúng tôi</h2>
                    <p>Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn</p>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <div className="contact-card">
                            <div className="contact-icon">
                                <MapPin />
                            </div>
                            <h4>Địa chỉ</h4>
                            <p>123 Đường Y Tế, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <Phone />
                            </div>
                            <h4>Điện thoại</h4>
                            <p>Hotline: +84 123 456 789<br />Cấp cứu: +84 987 654 321</p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <Mail />
                            </div>
                            <h4>Email</h4>
                            <p>info@hospital.com<br />support@hospital.com</p>
                        </div>

                        <div className="contact-card">
                            <div className="contact-icon">
                                <Clock />
                            </div>
                            <h4>Giờ làm việc</h4>
                            <p>T2-T7: 8:00 - 17:00<br />CN: 8:00 - 12:00</p>
                        </div>
                    </div>

                    <div className="contact-form">
                        <h3>Gửi tin nhắn</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Họ và tên *"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email *"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Số điện thoại"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Chủ đề *"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <textarea
                                    name="message"
                                    placeholder="Nội dung tin nhắn *"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                <Send size={18} />
                                Gửi tin nhắn
                            </button>
                        </form>
                    </div>
                </div>

                <div className="map-section">
                    <h3>Vị trí bệnh viện</h3>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sBệnh%20viện%20Đại%20học%20Y%20Dược%20TP.HCM!5e0!3m2!1svi!2s!4v1234567890"
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
