// src/pages/Appointment.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import {
    departmentAPI,
    doctorAPI,
    appointmentAPI,
    patientAPI
} from '../services/api';
import './Appointment.css';

const Appointment = () => {
    const [step, setStep] = useState(1);
    const [user, setUser] = useState(null);
    const [patientProfile, setPatientProfile] = useState(null);
    const [formData, setFormData] = useState({
        // Personal Info (chỉ cần nếu chưa đăng nhập)
        first_name: '',
        last_name: '',
        phone: '',
        email: '',

        // Appointment Info
        department_id: '',
        doctor_id: '',
        appointment_date: '',
        start_time: '',
        end_time: '',
        reason: '',
        notes: ''
    });

    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState('');

    // Sử dụng useRef thay vì useState để ngăn duplicate
    const isSubmittingRef = useRef(false);
    const submissionTokenRef = useRef(null);
    const mountedRef = useRef(false);

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30'
    ];

    useEffect(() => {
        // Ngăn chặn double execution trong React 18 Strict Mode
        if (mountedRef.current) return;
        mountedRef.current = true;

        // Kiểm tra user đã đăng nhập chưa
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Load patient profile từ database
                if (parsedUser.role === 'patient' && parsedUser.reference_id) {
                    loadPatientProfile(parsedUser.reference_id);
                } else {
                    // Fallback: Điền thông tin từ user data
                    setFormData(prev => ({
                        ...prev,
                        first_name: parsedUser.first_name || '',
                        last_name: parsedUser.last_name || '',
                        email: parsedUser.email || ''
                    }));
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        loadInitialData();

        // Generate unique token với useRef
        submissionTokenRef.current = Date.now().toString() + Math.random().toString(36);
        console.log('Generated submission token:', submissionTokenRef.current);

        // Cleanup function
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Thêm function để load patient profile
    const loadPatientProfile = async (patientId) => {
        try {
            setProfileLoading(true);
            console.log('Loading patient profile for ID:', patientId);

            const response = await patientAPI.getById(patientId);
            console.log('Patient profile response:', response.data);

            if (response.data) {
                const profile = response.data.success ? response.data.data : response.data;
                setPatientProfile(profile);

                // Điền form với thông tin từ patient profile
                setFormData(prev => ({
                    ...prev,
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    phone: profile.phone || '',
                    email: profile.email || '',
                    address: profile.address || '',
                    dob: profile.dob || '',
                    gender: profile.gender || ''
                }));

                console.log('Patient profile loaded and form filled:', profile);
            }
        } catch (error) {
            console.error('Error loading patient profile:', error);
            // Nếu không load được profile, sử dụng user data
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || ''
                }));
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const loadInitialData = async () => {
        try {
            const response = await departmentAPI.getAll();
            setDepartments(response.data.data || response.data);
        } catch (error) {
            console.error('Error loading departments:', error);
            // Mock data fallback
            setDepartments([
                { _id: '1', name: 'Tim mạch' },
                { _id: '2', name: 'Nhi khoa' },
                { _id: '3', name: 'Thần kinh' },
                { _id: '4', name: 'Xương khớp' }
            ]);
        }
    };

    const loadDoctorsByDepartment = async (departmentId) => {
        try {
            const response = await doctorAPI.getByDepartment(departmentId);
            setDoctors(response.data.data || response.data);
        } catch (error) {
            console.error('Error loading doctors:', error);
            // Mock data fallback
            setDoctors([
                {
                    _id: '1',
                    first_name: 'Nguyễn',
                    last_name: 'Văn A',
                    specialization: 'Tim mạch'
                }
            ]);
        }
    };

    const loadAvailableTimes = async () => {
        if (!formData.doctor_id || !formData.appointment_date) return;

        try {
            const response = await appointmentAPI.getByDate(formData.appointment_date);
            const bookedAppointments = response.data.data || [];

            // Lọc ra các giờ đã được đặt cho bác sĩ này
            const bookedTimes = bookedAppointments
                .filter(apt => apt.doctor_id === formData.doctor_id)
                .map(apt => apt.start_time);

            const available = timeSlots.filter(time => !bookedTimes.includes(time));
            setAvailableTimes(available);
        } catch (error) {
            console.error('Error loading available times:', error);
            // Fallback: tất cả thời gian đều available
            setAvailableTimes(timeSlots);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Load doctors khi chọn department
        if (name === 'department_id' && value) {
            loadDoctorsByDepartment(value);
            setFormData(prev => ({ ...prev, doctor_id: '' })); // Reset doctor
        }
    };

    const handleTimeSelect = (time) => {
        const endTime = calculateEndTime(time);
        setFormData(prev => ({
            ...prev,
            start_time: time,
            end_time: endTime
        }));
    };

    const calculateEndTime = (startTime) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endMinutes = minutes + 30;
        const endHours = hours + Math.floor(endMinutes / 60);
        const finalMinutes = endMinutes % 60;

        return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    };

    const validateStep = (currentStep) => {
        switch (currentStep) {
            case 1:
                if (!user) {
                    return formData.first_name && formData.last_name && formData.phone && formData.email;
                }
                return true;
            case 2:
                return formData.department_id && formData.doctor_id && formData.appointment_date && formData.start_time;
            case 3:
                return formData.reason;
            default:
                return true;
        }
    };

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handlePrevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra với useRef thay vì useState
        if (isSubmittingRef.current) {
            console.log('Form is already being submitted, ignoring duplicate call...');
            return;
        }

        // Set flag với useRef
        isSubmittingRef.current = true;
        setLoading(true);
        setError('');

        console.log('Starting form submission with token:', submissionTokenRef.current);

        try {
            // Chuẩn bị data để gửi API
            const appointmentData = {
                doctor_id: formData.doctor_id,
                department_id: formData.department_id,
                appointment_date: formData.appointment_date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                reason: formData.reason,
                notes: formData.notes,
                status: 'pending',
                // Sử dụng submissionTokenRef
                submission_token: submissionTokenRef.current
            };

            // Nếu user chưa đăng nhập, cần thêm thông tin patient
            if (!user) {
                appointmentData.patient_info = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    email: formData.email
                };
            }

            console.log('Sending appointment data:', appointmentData);

            // Gọi API tạo appointment
            const response = await appointmentAPI.create(appointmentData);

            console.log('Appointment created successfully:', response.data);

            // Chuyển đến step thành công
            setStep(4);

            // Generate token mới với useRef
            submissionTokenRef.current = Date.now().toString() + Math.random().toString(36);
            console.log('Generated new token for next submission:', submissionTokenRef.current);

        } catch (error) {
            console.error('Error creating appointment:', error);
            setError(
                error.response?.data?.message ||
                'Không thể đặt lịch hẹn. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
            // Reset flag với useRef
            isSubmittingRef.current = false;
            console.log('Form submission completed, flag reset');
        }
    };

    // Load available times khi chọn doctor hoặc date
    useEffect(() => {
        loadAvailableTimes();
    }, [formData.doctor_id, formData.appointment_date]);

    // Render methods cho từng step
    const renderStep1 = () => {
        // Hiển thị thông tin từ patient profile
        if (user) {
            if (profileLoading) {
                return (
                    <div className="step-content">
                        <h3>Đang tải thông tin bệnh nhân...</h3>
                        <div className="loading-spinner"></div>
                    </div>
                );
            }

            return (
                <div className="step-content">
                    <h3>Thông tin bệnh nhân</h3>
                    <div className="user-info">
                        <div className="patient-profile-display">
                            <h4>Thông tin cá nhân:</h4>
                            <p><strong>Họ tên:</strong> {formData.first_name} {formData.last_name}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>Số điện thoại:</strong> {formData.phone || 'Chưa cập nhật'}</p>

                            {patientProfile && (
                                <>
                                    {patientProfile.dob && (
                                        <p><strong>Ngày sinh:</strong> {new Date(patientProfile.dob).toLocaleDateString('vi-VN')}</p>
                                    )}
                                    {patientProfile.gender && (
                                        <p><strong>Giới tính:</strong> {patientProfile.gender === 'Male' ? 'Nam' : 'Nữ'}</p>
                                    )}
                                    {patientProfile.address && (
                                        <p><strong>Địa chỉ:</strong> {patientProfile.address}</p>
                                    )}
                                    {patientProfile.emergency_contact && (
                                        <p><strong>Liên hệ khẩn cấp:</strong> {patientProfile.emergency_contact}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="step-content">
                <h3>Thông tin cá nhân</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Họ *</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tên *</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
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
            </div>
        );
    };

    const renderStep2 = () => (
        <div className="step-content">
            <h3>Thông tin lịch hẹn</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label>Chuyên khoa *</label>
                    <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Chọn chuyên khoa</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Bác sĩ *</label>
                    <select
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.department_id}
                    >
                        <option value="">Chọn bác sĩ</option>
                        {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Ngày khám *</label>
                    <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Giờ khám *</label>
                    <div className="time-slots">
                        {availableTimes.map(time => (
                            <button
                                key={time}
                                type="button"
                                className={`time-slot ${formData.start_time === time ? 'selected' : ''}`}
                                onClick={() => handleTimeSelect(time)}
                                disabled={!formData.appointment_date || !formData.doctor_id}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="step-content">
            <h3>Lý do khám và ghi chú</h3>
            <div className="form-group">
                <label>Lý do khám *</label>
                <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Mô tả triệu chứng hoặc lý do khám..."
                    required
                />
            </div>
            <div className="form-group">
                <label>Ghi chú thêm</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Thông tin bổ sung (nếu có)..."
                />
            </div>
        </div>
    );

    const renderStep4 = () => {
        const selectedDept = departments.find(d => d._id === formData.department_id);
        const selectedDoc = doctors.find(d => d._id === formData.doctor_id);

        return (
            <div className="step-content success">
                <div className="success-icon">
                    <CheckCircle size={80} color="#10b981" />
                </div>
                <h3>Đặt lịch thành công!</h3>
                <p>Lịch hẹn của bạn đã được gửi và đang chờ xác nhận</p>
                <div className="success-info">
                    <div className="info-row">
                        <strong>Bệnh nhân:</strong>
                        <span>{formData.first_name} {formData.last_name}</span>
                    </div>
                    <div className="info-row">
                        <strong>Bác sĩ:</strong>
                        <span>{selectedDoc?.first_name} {selectedDoc?.last_name}</span>
                    </div>
                    <div className="info-row">
                        <strong>Chuyên khoa:</strong>
                        <span>{selectedDept?.name}</span>
                    </div>
                    <div className="info-row">
                        <strong>Ngày giờ:</strong>
                        <span>{formData.appointment_date} - {formData.start_time}</span>
                    </div>
                    <div className="info-row">
                        <strong>Trạng thái:</strong>
                        <span>Chờ xác nhận</span>
                    </div>
                </div>
                <div className="success-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = user ? '/patient-dashboard' : '/'}
                    >
                        {user ? 'Về Dashboard' : 'Về trang chủ'}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            setStep(1);
                            // Reset form nhưng giữ thông tin patient profile
                            const profileData = patientProfile ? {
                                first_name: patientProfile.first_name || '',
                                last_name: patientProfile.last_name || '',
                                phone: patientProfile.phone || '',
                                email: patientProfile.email || ''
                            } : {
                                first_name: user?.first_name || '',
                                last_name: user?.last_name || '',
                                phone: '',
                                email: user?.email || ''
                            };

                            setFormData({
                                ...profileData,
                                department_id: '',
                                doctor_id: '',
                                appointment_date: '',
                                start_time: '',
                                end_time: '',
                                reason: '',
                                notes: ''
                            });

                            // Reset với useRef
                            submissionTokenRef.current = Date.now().toString() + Math.random().toString(36);
                            isSubmittingRef.current = false;
                            console.log('Form reset with new token:', submissionTokenRef.current);
                        }}
                    >
                        Đặt lịch mới
                    </button>
                </div>
            </div>
        );
    };

    // Cập nhật nút submit để disable khi đang submit
    const renderFormActions = () => (
        <div className="form-actions">
            {step > 1 && (
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePrevStep}
                    disabled={isSubmittingRef.current || loading}
                >
                    Quay lại
                </button>
            )}
            {step < 3 ? (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                    disabled={!validateStep(step) || isSubmittingRef.current || loading}
                >
                    Tiếp tục
                </button>
            ) : (
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !validateStep(step) || isSubmittingRef.current}
                >
                    {isSubmittingRef.current || loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                </button>
            )}
        </div>
    );

    return (
        <div className="appointment-page">
            {/* Hero Section */}
            <section className="appointment-hero">
                <div className="container">
                    <h1>Đặt lịch khám</h1>
                    <p>Đặt lịch hẹn với bác sĩ chuyên khoa một cách dễ dàng và nhanh chóng</p>
                </div>
            </section>

            {/* Progress Steps */}
            <section className="appointment-progress">
                <div className="container">
                    <div className="progress-bar">
                        {[1, 2, 3].map(stepNum => (
                            <div key={stepNum} className={`progress-step ${step >= stepNum ? 'active' : ''} ${step > stepNum ? 'completed' : ''}`}>
                                <div className="step-number">{stepNum}</div>
                                <div className="step-label">
                                    {stepNum === 1 && (user ? 'Xác nhận' : 'Thông tin')}
                                    {stepNum === 2 && 'Lịch hẹn'}
                                    {stepNum === 3 && 'Chi tiết'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Form Content */}
            <section className="appointment-form">
                <div className="container">
                    <div className="form-container">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}

                            {step < 4 && renderFormActions()}
                        </form>
                    </div>

                    {/* Info Sidebar */}
                    {step < 4 && (
                        <div className="info-sidebar">
                            <div className="info-card">
                                <h4>Thông tin quan trọng</h4>
                                <div className="info-item">
                                    <Clock />
                                    <div>
                                        <strong>Thời gian khám</strong>
                                        <p>Mỗi lịch hẹn kéo dài 30 phút</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Calendar />
                                    <div>
                                        <strong>Xác nhận lịch hẹn</strong>
                                        <p>Chúng tôi sẽ liên hệ xác nhận trong 24h</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Phone />
                                    <div>
                                        <strong>Hỗ trợ</strong>
                                        <p>Hotline: 1900-xxxx</p>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <h4>Lưu ý khi khám</h4>
                                <ul>
                                    <li>Mang theo CMND/CCCD</li>
                                    <li>Đến sớm 15 phút</li>
                                    <li>Mang theo kết quả xét nghiệm cũ (nếu có)</li>
                                    <li>Thông báo nếu cần hủy/đổi lịch</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Appointment;
