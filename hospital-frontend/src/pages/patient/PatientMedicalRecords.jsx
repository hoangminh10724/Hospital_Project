// src/pages/patient/PatientMedicalRecords.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, FileText, Calendar, User, Activity, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { medicalRecordAPI } from '../../services/api';
import './PatientMedicalRecords.css';

const PatientMedicalRecords = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log('=== DEBUG MEDICAL RECORDS ===');
        console.log('Token exists:', !!token);
        console.log('User data:', userData);

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user:', parsedUser);
            console.log('User role:', parsedUser.role);
            console.log('Reference ID:', parsedUser.reference_id);

            if (parsedUser.role !== 'patient') {
                navigate('/');
                return;
            }
            setUser(parsedUser);

            const patientId = parsedUser.reference_id || parsedUser.patient_id;
            console.log('Using patient ID:', patientId);

            if (patientId) {
                loadMedicalRecords(patientId);
            } else {
                console.error('No patient ID found!');
                setError('Không tìm thấy thông tin bệnh nhân');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const loadMedicalRecords = async (patientId, page = 1) => {
        try {
            setLoading(true);
            setError('');

            console.log('Loading medical records for patient:', patientId);

            const response = await medicalRecordAPI.getByPatient(patientId, {
                page,
                limit: 10
            });

            console.log('Medical records API response:', response);
            console.log('Response data:', response.data);

            // Xử lý response linh hoạt
            let recordsData = [];
            let paginationData = {};

            if (response.data) {
                if (response.data.success) {
                    recordsData = response.data.data || [];
                    paginationData = response.data.pagination || {};
                } else if (Array.isArray(response.data)) {
                    recordsData = response.data;
                } else if (response.data.count !== undefined) {
                    recordsData = response.data.data || [];
                    paginationData = {
                        totalItems: response.data.count,
                        currentPage: page,
                        totalPages: Math.ceil((response.data.count || 0) / 10)
                    };
                }
            }

            console.log('Processed records data:', recordsData);
            console.log('Pagination data:', paginationData);

            setMedicalRecords(recordsData);
            setPagination(paginationData);

            if (recordsData.length === 0) {
                console.log('No medical records found');
            }

        } catch (error) {
            console.error('Error loading medical records:', error);
            console.error('Error response:', error.response);

            if (error.response?.status === 403) {
                setError('Bạn không có quyền truy cập hồ sơ bệnh án này');
            } else if (error.response?.status === 404) {
                setError('Không tìm thấy hồ sơ bệnh án');
                setMedicalRecords([]);
            } else if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            } else {
                setError('Không thể tải hồ sơ bệnh án. Vui lòng thử lại.');
                setMedicalRecords([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (recordId) => {
        try {
            console.log('Loading record detail for ID:', recordId);
            const response = await medicalRecordAPI.getById(recordId);
            console.log('Record detail response:', response.data);

            if (response.data) {
                const recordData = response.data.success ? response.data.data : response.data;
                setSelectedRecord(recordData);
            }
        } catch (error) {
            console.error('Error loading record detail:', error);
            alert('Không thể tải chi tiết hồ sơ');
        }
    };

    const handleCloseDetail = () => {
        setSelectedRecord(null);
    };

    const handleDownloadRecord = (recordId) => {
        alert(`Tính năng tải xuống hồ sơ ${recordId} sẽ được phát triển`);
    };

    const handlePageChange = (newPage) => {
        const patientId = user.reference_id || user.patient_id;
        loadMedicalRecords(patientId, newPage);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="patient-medical-records">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải hồ sơ bệnh án...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-medical-records">
            <div className="dashboard-header-bar">
                <div className="container">
                    <button onClick={() => navigate('/patient-dashboard')} className="back-btn">
                        <ArrowLeft size={20} />
                        Quay lại Dashboard
                    </button>
                    <Link to="/" className="home-btn">
                        <Home size={20} />
                        MediCare+
                    </Link>
                </div>
            </div>

            <div className="container">
                <div className="page-header">
                    <h1>
                        <FileText size={32} />
                        Hồ sơ bệnh án
                    </h1>
                    <p>Lịch sử khám bệnh và điều trị của bạn</p>
                </div>

                {error && (
                    <div className="error-message">
                        <Activity size={20} />
                        {error}
                    </div>
                )}

                <div className="records-summary">
                    <div className="summary-card">
                        <h3>Tổng số lần khám</h3>
                        <span className="summary-number">
                            {pagination.totalItems || medicalRecords.length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <h3>Lần khám gần nhất</h3>
                        <span className="summary-date">
                            {medicalRecords.length > 0
                                ? formatDate(medicalRecords[0].record_date || medicalRecords[0].visit_date)
                                : 'Chưa có'
                            }
                        </span>
                    </div>
                </div>

                {medicalRecords.length > 0 ? (
                    <>
                        <div className="medical-records-list">
                            {medicalRecords.map(record => (
                                <div key={record._id} className="medical-record-card">
                                    <div className="record-header">
                                        <div className="record-date">
                                            <Calendar size={16} />
                                            {formatDate(record.record_date || record.visit_date)}
                                        </div>
                                        <div className="record-status">
                                            <span className="status-badge completed">
                                                Hoàn thành
                                            </span>
                                        </div>
                                    </div>

                                    <div className="record-info">
                                        <div className="doctor-info">
                                            <User size={16} />
                                            <span>
                                                {record.doctor_id?.first_name || 'Chưa có'} {record.doctor_id?.last_name || ''}
                                                {record.doctor_id?.specialization && ` - ${record.doctor_id.specialization}`}
                                            </span>
                                        </div>
                                        <div className="diagnosis">
                                            <strong>Chẩn đoán:</strong> {record.diagnosis || 'Chưa có chẩn đoán'}
                                        </div>
                                        {record.symptoms && (
                                            <div className="symptoms">
                                                <strong>Triệu chứng:</strong> {record.symptoms}
                                            </div>
                                        )}
                                    </div>

                                    <div className="record-actions">
                                        <button
                                            onClick={() => handleViewDetail(record._id)}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FileText size={16} />
                                            Xem chi tiết
                                        </button>
                                        <button
                                            onClick={() => handleDownloadRecord(record._id)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <Download size={16} />
                                            Tải xuống
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage <= 1}
                                    className="btn btn-outline"
                                >
                                    Trước
                                </button>

                                <span className="pagination-info">
                                    Trang {pagination.currentPage} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    className="btn btn-outline"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                ) : !loading && (
                    <div className="no-records">
                        <FileText size={64} />
                        <h3>Chưa có hồ sơ bệnh án</h3>
                        <p>Bạn chưa có lịch sử khám bệnh nào được ghi nhận</p>
                        <button
                            onClick={() => navigate('/appointment')}
                            className="btn btn-primary"
                        >
                            Đặt lịch khám ngay
                        </button>
                    </div>
                )}
            </div>

            {/* Modal chi tiết hồ sơ */}
            {selectedRecord && (
                <div className="modal-overlay" onClick={handleCloseDetail}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết hồ sơ bệnh án</h2>
                            <button onClick={handleCloseDetail} className="close-btn">×</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h4>Thông tin khám</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Ngày khám:</strong>
                                        <span>{formatDate(selectedRecord.record_date || selectedRecord.visit_date)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Bác sĩ:</strong>
                                        <span>
                                            {selectedRecord.doctor_id?.first_name} {selectedRecord.doctor_id?.last_name}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Chuyên khoa:</strong>
                                        <span>{selectedRecord.doctor_id?.specialization || 'Chưa có'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedRecord.symptoms && (
                                <div className="detail-section">
                                    <h4>Triệu chứng</h4>
                                    <p>{selectedRecord.symptoms}</p>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>Chẩn đoán</h4>
                                <p>{selectedRecord.diagnosis || 'Chưa có chẩn đoán'}</p>
                            </div>

                            {selectedRecord.treatment && (
                                <div className="detail-section">
                                    <h4>Phương pháp điều trị</h4>
                                    <p>{selectedRecord.treatment}</p>
                                </div>
                            )}

                            {selectedRecord.prescription && (
                                <div className="detail-section">
                                    <h4>Đơn thuốc</h4>
                                    <p>{selectedRecord.prescription}</p>
                                </div>
                            )}

                            {selectedRecord.notes && (
                                <div className="detail-section">
                                    <h4>Ghi chú</h4>
                                    <p>{selectedRecord.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientMedicalRecords;
