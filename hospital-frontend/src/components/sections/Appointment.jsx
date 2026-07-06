// src/components/sections/Appointment.jsx
import React, { useState } from 'react';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import './Appointment.css';

const Appointment = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        department: '',
        doctor: '',
        date: '',
        time: '',
        message: ''
    });

    const departments = [
        'Tim mạch',
        'Thần kinh',
        'Xương khớp',
        'Mắt',
        'Tai mũi họng',
        'Nội tổng quát'
    ];

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Appointment data:', formData);
        alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <section className="section appointment" id="appointment">
            <div className="container">
                <div className="section-title">
                    <h2>Đặt lịch khám</h2>
                    <p>Đặt lịch hẹn với bác sĩ chuyên khoa một cách dễ dàng</p>
                </div>

                <div className="appointment-content">
                    <div className="appointment-info">
                        <h3>Thông tin đặt lịch</h3>
                        <div className="info-list">
                            <div className="info-item">
                                <Calendar />
                                <div>
                                    <h4>Giờ làm việc</h4>
                                    <p>Thứ 2 - Thứ 7: 8:00 - 17:00</p>
                                    <p>Chủ nhật: 8:00 - 12:00</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Clock />
                                <div>
                                    <h4>Thời gian khám</h4>
                                    <p>Mỗi lượt khám: 30 phút</p>
                                    <p>Vui lòng đến sớm 15 phút</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <User />
                                <div>
                                    <h4>Chuẩn bị</h4>
                                    <p>Mang theo CMND/CCCD</p>
                                    <p>Hồ sơ bệnh án (nếu có)</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <Phone />
                                <div>
                                    <h4>Hỗ trợ</h4>
                                    <p>Hotline: +84 123 456 789</p>
                                    <p>Email: support@hospital.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="appointment-form">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Chuyên khoa *</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn chuyên khoa</option>
                                        {departments.map((dept, index) => (
                                            <option key={index} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bác sĩ</label>
                                    <select
                                        name="doctor"
                                        value={formData.doctor}
                                        onChange={handleChange}
                                    >
                                        <option value="">Chọn bác sĩ (tùy chọn)</option>
                                        <option value="doctor1">BS. Nguyễn Văn A</option>
                                        <option value="doctor2">BS. Trần Thị B</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày khám *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giờ khám *</label>
                                    <select
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Chọn giờ khám</option>
                                        {timeSlots.map((time, index) => (
                                            <option key={index} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Mô tả triệu chứng hoặc lý do khám..."
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Đặt lịch khám
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Appointment;
