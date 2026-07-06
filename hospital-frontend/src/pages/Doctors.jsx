// src/pages/Doctors.jsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Search, Filter, Calendar } from 'lucide-react';
import { doctorAPI, departmentAPI, reviewAPI } from '../services/api';
import { useSequentialAPI } from '../hooks/useSequentialAPI';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const { loading, error, executeSequential } = useSequentialAPI();

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadDoctors(currentPage);
    }, [currentPage, selectedDepartment]);

    useEffect(() => {
        filterDoctors();
    }, [doctors, searchTerm, selectedDepartment]);

    const loadInitialData = async () => {
        try {
            const apiCalls = [
                {
                    name: 'Load Departments',
                    apiFunction: departmentAPI.getAll,
                    params: null
                }
            ];

            const results = await executeSequential(apiCalls);

            if (results[0]?.success) {
                setDepartments(results[0].data.data || results[0].data);
            }

        } catch (err) {
            console.error('Error loading initial data:', err);
        }
    };

    const loadDoctors = async (page = 1) => {
        try {
            const params = {
                page,
                limit: 9,
                ...(selectedDepartment !== 'all' && { department: selectedDepartment })
            };

            const apiCalls = [
                {
                    name: 'Load Doctors',
                    apiFunction: selectedDepartment !== 'all'
                        ? doctorAPI.getByDepartment
                        : doctorAPI.getAll,
                    params: selectedDepartment !== 'all'
                        ? [selectedDepartment, { page, limit: 9 }]
                        : params
                }
            ];

            const results = await executeSequential(apiCalls);

            if (results[0]?.success) {
                const doctorsData = results[0].data.data || results[0].data;

                // Load reviews for each doctor
                const doctorsWithReviews = await Promise.all(
                    doctorsData.map(async (doctor) => {
                        try {
                            const reviewsResponse = await reviewAPI.getByDoctor(doctor._id);
                            const reviews = reviewsResponse.data.data || [];
                            const avgRating = reviews.length > 0
                                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                                : 0;

                            return {
                                ...doctor,
                                rating: Math.round(avgRating * 10) / 10,
                                reviewCount: reviews.length
                            };
                        } catch (err) {
                            return {
                                ...doctor,
                                rating: 0,
                                reviewCount: 0
                            };
                        }
                    })
                );

                setDoctors(doctorsWithReviews);
                setPagination(results[0].data.pagination || {});
            }

        } catch (err) {
            console.error('Error loading doctors:', err);
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        if (searchTerm) {
            filtered = filtered.filter(doctor =>
                `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDoctors(filtered);
    };

    const handleDepartmentChange = (departmentId) => {
        setSelectedDepartment(departmentId);
        setCurrentPage(1);
    };

    const handleBookAppointment = (doctorId) => {
        // Store selected doctor and redirect to appointment page
        localStorage.setItem('selectedDoctorId', doctorId);
        window.location.href = '/appointment';
    };

    if (loading) {
        return (
            <div className="doctors-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách bác sĩ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="doctors-page">
            {/* Hero Section */}
            <section className="doctors-hero">
                <div className="container">
                    <h1>Đội ngũ bác sĩ</h1>
                    <p>Gặp gỡ các bác sĩ chuyên khoa giàu kinh nghiệm và tận tâm</p>
                </div>
            </section>

            {/* Search and Filter */}
            <section className="doctors-filter">
                <div className="container">
                    <div className="filter-bar">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bác sĩ hoặc chuyên khoa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="department-filter">
                            <Filter size={20} />
                            <select
                                value={selectedDepartment}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                            >
                                <option value="all">Tất cả khoa</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Error Display */}
            {error && (
                <section className="error-section">
                    <div className="container">
                        <div className="error-message">
                            Có lỗi xảy ra: {error}
                        </div>
                    </div>
                </section>
            )}

            {/* Doctors Grid */}
            <section className="doctors-content">
                <div className="container">
                    <div className="doctors-grid">
                        {filteredDoctors.map(doctor => (
                            <div key={doctor._id} className="doctor-card">
                                <div className="doctor-image">
                                    <img
                                        src={doctor.profile_image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
                                        alt={`${doctor.first_name} ${doctor.last_name}`}
                                    />
                                    <div className="doctor-overlay">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleBookAppointment(doctor._id)}
                                        >
                                            <Calendar size={18} />
                                            Đặt lịch khám
                                        </button>
                                    </div>
                                </div>

                                <div className="doctor-info">
                                    <h3>{doctor.first_name} {doctor.last_name}</h3>
                                    <p className="specialty">{doctor.specialization}</p>

                                    <div className="doctor-rating">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={i < Math.floor(doctor.rating) ? "#f59e0b" : "none"}
                                                    color="#f59e0b"
                                                />
                                            ))}
                                        </div>
                                        <span>{doctor.rating}/5 ({doctor.reviewCount} đánh giá)</span>
                                    </div>

                                    <div className="doctor-details">
                                        <div className="detail-item">
                                            <Clock size={16} />
                                            <span>Kinh nghiệm: 5+ năm</span>
                                        </div>
                                        <div className="detail-item">
                                            <MapPin size={16} />
                                            <span>{doctor.department_id?.name || 'Chưa xác định'}</span>
                                        </div>
                                    </div>

                                    <div className="doctor-actions">
                                        <button className="btn btn-outline">Xem chi tiết</button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleBookAppointment(doctor._id)}
                                        >
                                            Đặt lịch
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDoctors.length === 0 && !loading && (
                        <div className="no-results">
                            <p>Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="btn btn-outline"
                            >
                                Trước
                            </button>

                            <span className="pagination-info">
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages}
                                className="btn btn-outline"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Doctors;
