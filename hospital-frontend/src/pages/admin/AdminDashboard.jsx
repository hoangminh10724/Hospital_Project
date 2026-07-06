// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Users, UserCheck, Calendar, BarChart3, Settings, Bell, Plus, Search,
    Edit, Trash2, LogOut, Home, X, Save, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    doctorAPI,
    patientAPI,
    appointmentAPI,
    departmentAPI
} from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [searchTerms, setSearchTerms] = useState({
        doctor: '',
        patient: '',
        appointment: '',
        department: ''
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalEntity, setModalEntity] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            // SỬA LỖI: Cho phép cả admin và doctor truy cập (lưu ý: dashboard này hiện chỉ hiển thị dữ liệu admin)
            const allowedRoles = ['admin', 'doctor'];
            if (!allowedRoles.includes(parsedUser.role)) {
                navigate('/'); // Redirect if not admin or doctor
                return;
            }
            setUser(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
            return;
        }

        loadDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [doctorsRes, patientsRes, appointmentsRes, departmentsRes] = await Promise.all([
                doctorAPI.getAll({ limit: 100 }),
                patientAPI.getAll({ limit: 100 }),
                appointmentAPI.getAll({ limit: 100 }),
                departmentAPI.getAll()
            ]);

            setDoctors(doctorsRes.data.data || []);
            setPatients(patientsRes.data.data || []);
            setAppointments(appointmentsRes.data.data || []);
            setDepartments(departmentsRes.data.data || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, entity, item = null) => {
        setModalType(type);
        setModalEntity(entity);
        setSelectedItem(item);
        setShowModal(true);
        setFormErrors({});

        if (type === 'add') {
            setFormData(getEmptyFormData(entity));
        } else if (type === 'edit' && item) {
            // SỬA LỖI: Tạm thời bỏ qua việc lấy thông tin user liên quan khi sửa bác sĩ
            // vì API patientAPI.getUserByReferenceId có thể chưa tồn tại hoặc có lỗi.
            // Admin sẽ cần nhập lại username/email nếu muốn thay đổi.
            if (entity === 'doctor') {
                // Thay vì gọi API, chỉ điền thông tin bác sĩ hiện có
                setFormData({
                    ...item,
                    // Đặt rỗng cho username và password khi sửa
                    username: '',
                    password: ''
                });
            } else {
                setFormData(item);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setModalEntity('');
        setSelectedItem(null);
        setFormData({});
        setFormErrors({});
    };

    const getEmptyFormData = (entity) => {
        switch (entity) {
            case 'doctor':
                return {
                    username: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    specialization: '',
                    department_id: '',
                    license_number: '',
                    experience_years: ''
                };
            case 'patient':
                return {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    dob: '',
                    gender: '',
                    address: '',
                    emergency_contact: ''
                };
            case 'appointment':
                return {
                    patient_id: '',
                    doctor_id: '',
                    appointment_date: '',
                    start_time: '',
                    end_time: '',
                    reason: '',
                    status: 'pending'
                };
            case 'department':
                return {
                    name: '',
                    description: '',
                    head_doctor: '',
                    phone: '',
                    location: ''
                };
            default:
                return {};
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (entity, data, type) => {
        const errors = {};

        switch (entity) {
            case 'doctor':
                if (!data.first_name) errors.first_name = 'Họ không được để trống';
                if (!data.last_name) errors.last_name = 'Tên không được để trống';
                if (!data.email) errors.email = 'Email không được để trống';
                if (!data.specialization) errors.specialization = 'Chuyên khoa không được để trống';
                if (!data.department_id) errors.department_id = 'Khoa không được để trống';
                // Kiểm tra username và password khi THÊM mới
                if (type === 'add') {
                    if (!data.username) errors.username = 'Tên đăng nhập không được để trống';
                    if (!data.password) errors.password = 'Mật khẩu không được để trống';
                }
                // Khi SỬA, password là tùy chọn, nhưng username thì không được để trống nếu có
                if (type === 'edit' && data.username && !data.username.trim()) errors.username = 'Tên đăng nhập không được để trống';
                break;
            case 'patient':
                if (!data.first_name) errors.first_name = 'Họ không được để trống';
                if (!data.last_name) errors.last_name = 'Tên không được để trống';
                if (!data.email) errors.email = 'Email không được để trống';
                break;
            case 'appointment':
                if (!data.patient_id) errors.patient_id = 'Bệnh nhân không được để trống';
                if (!data.doctor_id) errors.doctor_id = 'Bác sĩ không được để trống';
                if (!data.appointment_date) errors.appointment_date = 'Ngày hẹn không được để trống';
                if (!data.start_time) errors.start_time = 'Giờ bắt đầu không được để trống';
                if (!data.reason) errors.reason = 'Lý do khám không được để trống';
                break;
            case 'department':
                if (!data.name) errors.name = 'Tên khoa không được để trống';
                if (!data.description) errors.description = 'Mô tả không được để trống';
                break;
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormErrors({});
        let response;
        try {
            if (modalType === 'add') {
                switch (modalEntity) {
                    case 'doctor':
                        response = await doctorAPI.create(formData);
                        setDoctors(prev => [...prev, response.data.data.doctor]);
                        break;
                    case 'patient':
                        response = await patientAPI.create(formData);
                        setPatients(prev => [...prev, response.data.data]);
                        break;
                    case 'appointment':
                        response = await appointmentAPI.create(formData);
                        setAppointments(prev => [...prev, response.data.data]);
                        break;
                    case 'department':
                        response = await departmentAPI.create(formData);
                        setDepartments(prev => [...prev, response.data.data]);
                        break;
                }
            } else if (modalType === 'edit') {
                switch (modalEntity) {
                    case 'doctor':
                        // Update doctor and handle user data sync
                        response = await doctorAPI.update(selectedItem._id, formData);
                        const updatedDoctor = response.data.data;
                        setDoctors(prev => prev.map(item =>
                            item._id === selectedItem._id ? updatedDoctor : item
                        ));
                        // Refresh all appointments that involve this doctor to update their display
                        const appointmentsRes = await appointmentAPI.getAll();
                        if (appointmentsRes.data.data) {
                            setAppointments(appointmentsRes.data.data);
                        }
                        break;
                    case 'patient':
                        response = await patientAPI.update(selectedItem._id, formData);
                        setPatients(prev => prev.map(item =>
                            item._id === selectedItem._id ? response.data.data : item
                        ));
                        break;
                    case 'appointment':
                        response = await appointmentAPI.update(selectedItem._id, formData);
                        setAppointments(prev => prev.map(item =>
                            item._id === selectedItem._id ? response.data.data : item
                        ));
                        break;
                    case 'department':
                        response = await departmentAPI.update(selectedItem._id, formData);
                        setDepartments(prev => prev.map(item =>
                            item._id === selectedItem._id ? response.data.data : item
                        ));
                        break;
                }
            }
            closeModal();
            alert(`${modalType === 'add' ? 'Thêm' : 'Cập nhật'} ${modalEntity} thành công!`);
        } catch (error) {
            console.error('Error submitting form:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            setFormErrors({ submit: message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (entity, id) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${entity} này?`)) {
            return;
        }

        setLoading(true);
        try {
            switch (entity) {
                case 'doctor':
                    await doctorAPI.delete(id);
                    setDoctors(prev => prev.filter(item => item._id !== id));
                    break;
                case 'patient':
                    await patientAPI.delete(id);
                    setPatients(prev => prev.filter(item => item._id !== id));
                    break;
                case 'appointment':
                    await appointmentAPI.delete(id);
                    setAppointments(prev => prev.filter(item => item._id !== id));
                    break;
                case 'department':
                    await departmentAPI.delete(id);
                    setDepartments(prev => prev.filter(item => item._id !== id));
                    break;
            }
            alert(`Xóa ${entity} thành công!`);
        } catch (error) {
            console.error('Error deleting:', error);
            alert(`Lỗi khi xóa ${entity}: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    const handleSearch = (type, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const filteredDoctors = doctors.filter(doctor =>
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerms.doctor.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerms.doctor.toLowerCase())
    );

    const filteredPatients = patients.filter(patient =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerms.patient.toLowerCase()) ||
        patient.phone?.includes(searchTerms.patient)
    );

    const filteredAppointments = appointments.filter(appointment =>
        appointment.patient_id?.first_name?.toLowerCase().includes(searchTerms.appointment.toLowerCase()) ||
        appointment.doctor_id?.first_name?.toLowerCase().includes(searchTerms.appointment.toLowerCase())
    );

    const filteredDepartments = departments.filter(department =>
        department.name?.toLowerCase().includes(searchTerms.department.toLowerCase()) ||
        department.description?.toLowerCase().includes(searchTerms.department.toLowerCase())
    );

    const renderModal = () => {
        if (!showModal) return null;

        return (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>
                            {modalType === 'add' && `Thêm ${modalEntity}`}
                            {modalType === 'edit' && `Sửa ${modalEntity}`}
                            {modalType === 'view' && `Xem ${modalEntity}`}
                        </h3>
                        <button onClick={closeModal} className="modal-close">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {modalType === 'view' ? (
                            <div className="view-details">
                                {Object.entries(selectedItem || {}).map(([key, value]) => (
                                    <div key={key} className="detail-row">
                                        <strong>{key}:</strong> {String(value)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {modalEntity === 'doctor' && (
                                    <>
                                        {/* Thêm trường Username */}
                                        <div className="form-group">
                                            <label>Tên đăng nhập *</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.username ? 'error' : ''}
                                                placeholder="Tên đăng nhập"
                                                required={modalType === 'add'} // Bắt buộc khi thêm mới
                                            />
                                            {formErrors.username && <span className="error-text">{formErrors.username}</span>}
                                        </div>
                                        {/* Thêm trường Password */}
                                        <div className="form-group">
                                            <label>Mật khẩu {modalType === 'add' ? '*' : '(Để trống nếu không đổi)'}</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.password ? 'error' : ''}
                                                placeholder={modalType === 'add' ? 'Nhập mật khẩu' : 'Để trống nếu không đổi'}
                                                required={modalType === 'add'} // Bắt buộc khi thêm mới
                                            />
                                            {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Họ *</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.first_name ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.first_name && <span className="error-text">{formErrors.first_name}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label>Tên *</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.last_name ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.last_name && <span className="error-text">{formErrors.last_name}</span>}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.email ? 'error' : ''}
                                                required
                                            />
                                            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Chuyên khoa *</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.specialization ? 'error' : ''}
                                                required
                                            />
                                            {formErrors.specialization && <span className="error-text">{formErrors.specialization}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Khoa *</label>
                                            <select
                                                name="department_id"
                                                value={formData.department_id || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.department_id ? 'error' : ''}
                                                required
                                            >
                                                <option value="">Chọn khoa</option>
                                                {departments.map(dept => (
                                                    <option key={dept._id} value={dept._id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.department_id && <span className="error-text">{formErrors.department_id}</span>}
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Số giấy phép</label>
                                                <input
                                                    type="text"
                                                    name="license_number"
                                                    value={formData.license_number || ''}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Số năm kinh nghiệm</label>
                                                <input
                                                    type="number"
                                                    name="experience_years"
                                                    value={formData.experience_years || ''}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {modalEntity === 'patient' && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Họ *</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.first_name ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.first_name && <span className="error-text">{formErrors.first_name}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label>Tên *</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.last_name ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.last_name && <span className="error-text">{formErrors.last_name}</span>}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.email ? 'error' : ''}
                                                required
                                            />
                                            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Ngày sinh</label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob ? formData.dob.split('T')[0] : ''}
                                                    onChange={handleFormChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Giới tính</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender || ''}
                                                    onChange={handleFormChange}
                                                >
                                                    <option value="">Chọn giới tính</option>
                                                    <option value="Male">Nam</option>
                                                    <option value="Female">Nữ</option>
                                                    <option value="Other">Khác</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Địa chỉ</label>
                                            <textarea
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleFormChange}
                                                rows="3"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Liên hệ khẩn cấp</label>
                                            <input
                                                type="text"
                                                name="emergency_contact"
                                                value={formData.emergency_contact || ''}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </>
                                )}

                                {modalEntity === 'appointment' && (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Bệnh nhân *</label>
                                                <select
                                                    name="patient_id"
                                                    value={formData.patient_id || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.patient_id ? 'error' : ''}
                                                    required
                                                >
                                                    <option value="">Chọn bệnh nhân</option>
                                                    {patients.map(patient => (
                                                        <option key={patient._id} value={patient._id}>
                                                            {patient.first_name} {patient.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.patient_id && <span className="error-text">{formErrors.patient_id}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label>Bác sĩ *</label>
                                                <select
                                                    name="doctor_id"
                                                    value={formData.doctor_id || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.doctor_id ? 'error' : ''}
                                                    required
                                                >
                                                    <option value="">Chọn bác sĩ</option>
                                                    {doctors.map(doctor => (
                                                        <option key={doctor._id} value={doctor._id}>
                                                            {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                                                        </option>
                                                    ))}
                                                </select>
                                                {formErrors.doctor_id && <span className="error-text">{formErrors.doctor_id}</span>}
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Ngày hẹn *</label>
                                                <input
                                                    type="date"
                                                    name="appointment_date"
                                                    value={formData.appointment_date ? formData.appointment_date.split('T')[0] : ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.appointment_date ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.appointment_date && <span className="error-text">{formErrors.appointment_date}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label>Giờ bắt đầu *</label>
                                                <input
                                                    type="time"
                                                    name="start_time"
                                                    value={formData.start_time || ''}
                                                    onChange={handleFormChange}
                                                    className={formErrors.start_time ? 'error' : ''}
                                                    required
                                                />
                                                {formErrors.start_time && <span className="error-text">{formErrors.start_time}</span>}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Lý do khám *</label>
                                            <textarea
                                                name="reason"
                                                value={formData.reason || ''}
                                                onChange={handleFormChange}
                                                rows="3"
                                                className={formErrors.reason ? 'error' : ''}
                                                required
                                            />
                                            {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select
                                                name="status"
                                                value={formData.status || 'pending'}
                                                onChange={handleFormChange}
                                            >
                                                <option value="pending">Chờ xác nhận</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="completed">Đã hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {modalEntity === 'department' && (
                                    <>
                                        <div className="form-group">
                                            <label>Tên khoa *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.name ? 'error' : ''}
                                                placeholder="VD: Khoa Tim mạch"
                                                required
                                            />
                                            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Mô tả *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description || ''}
                                                onChange={handleFormChange}
                                                className={formErrors.description ? 'error' : ''}
                                                rows="4"
                                                placeholder="Mô tả về khoa, chuyên môn, dịch vụ..."
                                                required
                                            />
                                            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Trưởng khoa</label>
                                            <select
                                                name="head_doctor"
                                                value={formData.head_doctor || ''}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">Chọn trưởng khoa</option>
                                                {doctors.map(doctor => (
                                                    <option key={doctor._id} value={doctor._id}>
                                                        {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Số điện thoại</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone || ''}
                                                    onChange={handleFormChange}
                                                    placeholder="VD: 028-1234-5678"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Vị trí</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location || ''}
                                                    onChange={handleFormChange}
                                                    placeholder="VD: Tầng 3, Tòa nhà A"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="modal-actions">
                                    <button type="button" onClick={closeModal} className="btn btn-outline">
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <Save size={18} />
                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="dashboard-section">
            <h2 className="section-title">Bảng Điều Khiển</h2>
            <div className="stats-grid">
                <div className="stat-card doctors">
                    <div className="stat-icon">
                        <UserCheck size={48} />
                    </div>
                    <div className="stat-content">
                        <h3>{doctors.length}</h3>
                        <p>Bác Sĩ</p>
                    </div>
                </div>
                <div className="stat-card patients">
                    <div className="stat-icon">
                        <Users size={48} />
                    </div>
                    <div className="stat-content">
                        <h3>{patients.length}</h3>
                        <p>Bệnh Nhân</p>
                    </div>
                </div>
                <div className="stat-card appointments">
                    <div className="stat-icon">
                        <Calendar size={48} />
                    </div>
                    <div className="stat-content">
                        <h3>{appointments.length}</h3>
                        <p>Lịch Hẹn</p>
                    </div>
                </div>
                <div className="stat-card departments">
                    <div className="stat-icon">
                        <Settings size={48} />
                    </div>
                    <div className="stat-content">
                        <h3>{departments.length}</h3>
                        <p>Khoa</p>
                    </div>
                </div>
            </div>

            <div className="quick-stats">
                <div className="quick-stat">
                    <h4>Tổng số lịch hẹn hôm nay</h4>
                    <p className="big-number">
                        {appointments.filter(apt => {
                            const today = new Date().toISOString().split('T')[0];
                            return apt.appointment_date?.split('T')[0] === today;
                        }).length}
                    </p>
                </div>
                <div className="quick-stat">
                    <h4>Lịch hẹn chờ xác nhận</h4>
                    <p className="big-number">
                        {appointments.filter(apt => apt.status === 'pending').length}
                    </p>
                </div>
                <div className="quick-stat">
                    <h4>Bác sĩ đang hoạt động</h4>
                    <p className="big-number">{doctors.length}</p>
                </div>
            </div>
        </div>
    );

    const renderDoctors = () => (
        <div className="management-section">
            <div className="section-header">
                <h2 className="section-title">Quản Lý Bác Sĩ</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => openModal('add', 'doctor')}
                >
                    <Plus size={20} />
                    Thêm Bác Sĩ
                </button>
            </div>

            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm bác sĩ..."
                    value={searchTerms.doctor}
                    onChange={(e) => handleSearch('doctor', e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên</th>
                            <th>Chuyên Khoa</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDoctors.map((doctor, index) => (
                            <tr key={doctor._id}>
                                <td>{index + 1}</td>
                                <td>{doctor.first_name} {doctor.last_name}</td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.email}</td>
                                <td>{doctor.phone}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('view', 'doctor', doctor)}
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('edit', 'doctor', doctor)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete('doctor', doctor._id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPatients = () => (
        <div className="management-section">
            <div className="section-header">
                <h2 className="section-title">Quản Lý Bệnh Nhân</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => openModal('add', 'patient')}
                >
                    <Plus size={20} />
                    Thêm Bệnh Nhân
                </button>
            </div>

            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm bệnh nhân..."
                    value={searchTerms.patient}
                    onChange={(e) => handleSearch('patient', e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên</th>
                            <th>SĐT</th>
                            <th>Email</th>
                            <th>Giới tính</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((patient, index) => (
                            <tr key={patient._id}>
                                <td>{index + 1}</td>
                                <td>{patient.first_name} {patient.last_name}</td>
                                <td>{patient.phone}</td>
                                <td>{patient.email}</td>
                                <td>{patient.gender === 'Male' ? 'Nam' : patient.gender === 'Female' ? 'Nữ' : 'Khác'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('view', 'patient', patient)}
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('edit', 'patient', patient)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete('patient', patient._id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDepartments = () => (
        <div className="management-section">
            <div className="section-header">
                <h2 className="section-title">Quản Lý Khoa</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => openModal('add', 'department')}
                >
                    <Plus size={20} />
                    Thêm Khoa
                </button>
            </div>

            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm khoa..."
                    value={searchTerms.department}
                    onChange={(e) => handleSearch('department', e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên Khoa</th>
                            <th>Mô Tả</th>
                            <th>Trưởng Khoa</th>
                            <th>SĐT</th>
                            <th>Vị Trí</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDepartments.map((department, index) => (
                            <tr key={department._id}>
                                <td>{index + 1}</td>
                                <td className="font-weight-bold">{department.name}</td>
                                <td className="description-cell">
                                    {department.description?.length > 50
                                        ? `${department.description.substring(0, 50)}...`
                                        : department.description
                                    }
                                </td>
                                <td>
                                    {department.head_doctor?.first_name
                                        ? `${department.head_doctor.first_name} ${department.head_doctor.last_name}`
                                        : 'Chưa có'
                                    }
                                </td>
                                <td>{department.phone || 'Chưa có'}</td>
                                <td>{department.location || 'Chưa có'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('view', 'department', department)}
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('edit', 'department', department)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete('department', department._id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="management-section">
            <div className="section-header">
                <h2 className="section-title">Quản Lý Lịch Hẹn</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => openModal('add', 'appointment')}
                >
                    <Plus size={20} />
                    Đặt Lịch
                </button>
            </div>

            <div className="search-box">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm lịch hẹn..."
                    value={searchTerms.appointment}
                    onChange={(e) => handleSearch('appointment', e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Bệnh Nhân</th>
                            <th>Bác Sĩ</th>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((appointment, index) => (
                            <tr key={appointment._id}>
                                <td>{index + 1}</td>
                                <td>
                                    {appointment.patient_id?.first_name} {appointment.patient_id?.last_name}
                                </td>
                                <td>
                                    {appointment.doctor_id?.first_name} {appointment.doctor_id?.last_name}
                                </td>
                                <td>
                                    {appointment.appointment_date ?
                                        new Date(appointment.appointment_date).toLocaleDateString('vi-VN') :
                                        'N/A'
                                    }
                                </td>
                                <td>{appointment.start_time}</td>
                                <td>
                                    <span className={`status ${appointment.status}`}>
                                        {appointment.status === 'pending' && 'Chờ xác nhận'}
                                        {appointment.status === 'confirmed' && 'Đã xác nhận'}
                                        {appointment.status === 'completed' && 'Đã hoàn thành'}
                                        {appointment.status === 'cancelled' && 'Đã hủy'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('view', 'appointment', appointment)}
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => openModal('edit', 'appointment', appointment)}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete('appointment', appointment._id)}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="management-section">
            <h2 className="section-title">Thống Kê & Báo Cáo</h2>
            <div className="chart-container">
                <div className="stats-summary">
                    <div className="summary-card">
                        <h4>Tổng số lịch hẹn hôm nay</h4>
                        <p className="big-number">
                            {appointments.filter(apt => {
                                const today = new Date().toISOString().split('T')[0];
                                return apt.appointment_date?.split('T')[0] === today;
                            }).length}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h4>Lịch hẹn chờ xác nhận</h4>
                        <p className="big-number">
                            {appointments.filter(apt => apt.status === 'pending').length}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h4>Bác sĩ đang hoạt động</h4>
                        <p className="big-number">{doctors.length}</p>
                    </div>
                </div>
                <p className="text-muted"></p>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="management-section">
            <h2 className="section-title">Gửi Thông Báo</h2>
            <div className="notification-form">
                <div className="form-group">
                    <label>Tiêu đề thông báo</label>
                    <input type="text" className="form-control" placeholder="Nhập tiêu đề..." />
                </div>
                <div className="form-group">
                    <label>Nội dung thông báo</label>
                    <textarea
                        className="form-control"
                        placeholder="Nhập nội dung thông báo..."
                        rows="5"
                    />
                </div>
                <div className="form-group">
                    <label>Gửi đến</label>
                    <select className="form-control">
                        <option value="">Chọn đối tượng</option>
                        <option value="all">Tất cả người dùng</option>
                        <option value="doctors">Chỉ bác sĩ</option>
                        <option value="patients">Chỉ bệnh nhân</option>
                    </select>
                </div>
                <button className="btn btn-primary">
                    <Bell size={20} />
                    Gửi Thông Báo
                </button>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="container">
                    <div className="header-left">
                        <h1 className="admin-title">
                            <UserCheck className="title-icon" />
                            MediCare+ Admin
                        </h1>
                    </div>
                    <div className="header-right">
                        <span className="admin-welcome">
                            Xin chào, {user?.first_name || user?.username}
                        </span>
                        <button onClick={handleBackToHome} className="btn btn-outline btn-sm">
                            <Home size={18} />
                            Trang chủ
                        </button>
                        <button onClick={handleLogout} className="btn btn-danger btn-sm">
                            <LogOut size={18} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                <div className="container">
                    <div className="admin-layout">
                        <aside className="admin-sidebar">
                            <div className="sidebar-content">
                                <h5 className="sidebar-title">Menu Quản Trị</h5>
                                <nav className="sidebar-nav">
                                    <button
                                        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('dashboard')}
                                    >
                                        <BarChart3 size={20} />
                                        Bảng Điều Khiển
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'doctors' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('doctors')}
                                    >
                                        <UserCheck size={20} />
                                        Quản Lý Bác Sĩ
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'patients' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('patients')}
                                    >
                                        <Users size={20} />
                                        Quản Lý Bệnh Nhân
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'departments' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('departments')}
                                    >
                                        <Settings size={20} />
                                        Quản Lý Khoa
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'appointments' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('appointments')}
                                    >
                                        <Calendar size={20} />
                                        Quản Lý Lịch Hẹn
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('reports')}
                                    >
                                        <BarChart3 size={20} />
                                        Thống Kê & Báo Cáo
                                    </button>
                                    <button
                                        className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                                        onClick={() => handleSectionChange('notifications')}
                                    >
                                        <Bell size={20} />
                                        Gửi Thông Báo
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        <main className="admin-main">
                            {loading && (
                                <div className="loading-overlay">
                                    <div className="loading-spinner"></div>
                                    <p>Đang tải dữ liệu...</p>
                                </div>
                            )}

                            {activeSection === 'dashboard' && renderDashboard()}
                            {activeSection === 'doctors' && renderDoctors()}
                            {activeSection === 'patients' && renderPatients()}
                            {activeSection === 'departments' && renderDepartments()}
                            {activeSection === 'appointments' && renderAppointments()}
                            {activeSection === 'reports' && renderReports()}
                            {activeSection === 'notifications' && renderNotifications()}
                        </main>
                    </div>
                </div>
            </div>

            {renderModal()}
        </div>
    );
};

export default AdminDashboard;
