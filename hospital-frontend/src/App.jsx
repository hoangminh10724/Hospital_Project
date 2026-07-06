// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientPayments from './pages/patient/PatientPayments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard'; 
import './styles/index.css';

// 404 Not Found Component
const NotFound = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textAlign: 'center',
    padding: '40px 20px'
  }}>
    <h1 style={{
      fontSize: '3rem',
      fontWeight: '700',
      color: '#dc2626',
      marginBottom: '16px'
    }}>
      404
    </h1>
    <h2 style={{
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '12px'
    }}>
      Trang không tìm thấy
    </h2>
    <p style={{
      color: '#6b7280',
      marginBottom: '24px',
      maxWidth: '400px'
    }}>
      Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
    </p>
    <a
      href="/"
      style={{
        color: 'var(--primary-color)',
        textDecoration: 'none',
        fontWeight: '600',
        padding: '12px 24px',
        border: '2px solid var(--primary-color)',
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = 'var(--primary-color)';
        e.target.style.color = 'white';
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.color = 'var(--primary-color)';
      }}
    >
      Về trang chủ
    </a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication routes - No header/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard routes - No header/footer */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Patient Dashboard routes - No header/footer */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient/payments" element={<PatientPayments />} />
        <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />

        {/* Public routes with header/footer */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Header />
              <About />
              <Footer />
            </>
          }
        />

        <Route
          path="/services"
          element={
            <>
              <Header />
              <Services />
              <Footer />
            </>
          }
        />

        <Route
          path="/doctors"
          element={
            <>
              <Header />
              <Doctors />
              <Footer />
            </>
          }
        />

        <Route
          path="/appointment"
          element={
            <>
              <Header />
              <Appointment />
              <Footer />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Header />
              <Contact />
              <Footer />
            </>
          }
        />

        {/* 404 Not Found route */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <NotFound />
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
