// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Award, Heart, Star, ArrowRight,
  Clock, Shield, CheckCircle, Phone, MapPin, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    years: 0,
    rating: 0
  });

  const [testimonials, setTestimonials] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Animate stats
    const targetStats = { patients: 10000, doctors: 50, years: 15, rating: 4.9 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        patients: Math.floor(targetStats.patients * progress),
        doctors: Math.floor(targetStats.doctors * progress),
        years: Math.floor(targetStats.years * progress),
        rating: (targetStats.rating * progress).toFixed(1)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, stepDuration);

    // Mock data
    setTestimonials([
      {
        id: 1,
        name: "Nguyễn Thị Mai",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        rating: 5,
        comment: "Dịch vụ tuyệt vời, bác sĩ rất tận tâm và chuyên nghiệp. Tôi rất hài lòng với chất lượng khám chữa bệnh tại đây.",
        treatment: "Khám tim mạch"
      },
      {
        id: 2,
        name: "Trần Văn Hùng",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        rating: 5,
        comment: "Bệnh viện có trang thiết bị hiện đại, quy trình khám bệnh nhanh chóng và hiệu quả. Rất đáng tin cậy.",
        treatment: "Phẫu thuật xương khớp"
      },
      {
        id: 3,
        name: "Lê Thị Hoa",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        rating: 5,
        comment: "Từ lúc đặt lịch đến khi khám xong đều rất thuận tiện. Nhân viên thân thiện, bác sĩ giải thích rõ ràng.",
        treatment: "Khám sản phụ khoa"
      }
    ]);

    setNews([
      {
        id: 1,
        title: "Khai trương phòng khám tim mạch hiện đại",
        excerpt: "Bệnh viện vừa đưa vào hoạt động phòng khám tim mạch với trang thiết bị tiên tiến nhất...",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        date: "15/12/2024",
        category: "Tin tức"
      },
      {
        id: 2,
        title: "Chương trình khám sức khỏe miễn phí",
        excerpt: "Trong tháng 12, bệnh viện tổ chức chương trình khám sức khỏe miễn phí cho người cao tuổi...",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        date: "10/12/2024",
        category: "Sự kiện"
      },
      {
        id: 3,
        title: "Hội thảo về phòng chống bệnh tim mạch",
        excerpt: "Các chuyên gia hàng đầu sẽ chia sẻ kiến thức về phòng ngừa và điều trị bệnh tim mạch...",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        date: "05/12/2024",
        category: "Hội thảo"
      }
    ]);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Shield />,
      title: "An toàn tuyệt đối",
      description: "Tuân thủ nghiêm ngặt các tiêu chuẩn y tế quốc tế"
    },
    {
      icon: <Heart />,
      title: "Chăm sóc tận tâm",
      description: "Đội ngũ y bác sĩ luôn đặt bệnh nhân lên hàng đầu"
    },
    {
      icon: <Award />,
      title: "Chất lượng hàng đầu",
      description: "Được công nhận bởi các tổ chức y tế uy tín"
    },
    {
      icon: <Clock />,
      title: "Dịch vụ 24/7",
      description: "Luôn sẵn sàng phục vụ trong mọi tình huống"
    }
  ];

  const services = [
    {
      icon: "🫀",
      title: "Tim mạch",
      description: "Chẩn đoán và điều trị bệnh tim mạch",
      link: "/services"
    },
    {
      icon: "🧠",
      title: "Thần kinh",
      description: "Chuyên khoa thần kinh chuyên nghiệp",
      link: "/services"
    },
    {
      icon: "👁️",
      title: "Mắt",
      description: "Khám và điều trị các bệnh về mắt",
      link: "/services"
    },
    {
      icon: "🦴",
      title: "Xương khớp",
      description: "Điều trị chấn thương và bệnh xương khớp",
      link: "/services"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Chăm sóc sức khỏe <br />
                <span className="highlight">chuyên nghiệp</span> <br />
                cho mọi người
              </h1>
              <p>
                Chúng tôi cung cấp dịch vụ y tế chất lượng cao với đội ngũ bác sĩ 
                giàu kinh nghiệm và trang thiết bị hiện đại nhất.
              </p>
              <div className="hero-actions">
                <Link to="/appointment" className="btn btn-primary">
                  <Calendar size={20} />
                  Đặt lịch khám
                </Link>
                <Link to="/services" className="btn btn-outline">
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Medical Team" 
              />
              <div className="hero-badge">
                <Star fill="#f59e0b" color="#f59e0b" size={20} />
                <span>4.9/5 đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon patients">
                <Users />
              </div>
              <div className="stat-content">
                <h3>{stats.patients.toLocaleString()}+</h3>
                <p>Bệnh nhân hài lòng</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon doctors">
                <Users />
              </div>
              <div className="stat-content">
                <h3>{stats.doctors}+</h3>
                <p>Bác sĩ chuyên khoa</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon years">
                <Award />
              </div>
              <div className="stat-content">
                <h3>{stats.years}+</h3>
                <p>Năm kinh nghiệm</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon rating">
                <Star />
              </div>
              <div className="stat-content">
                <h3>{stats.rating}</h3>
                <p>Đánh giá trung bình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-title">
            <h2>Tại sao chọn MediCare+?</h2>
            <p>Chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe tốt nhất</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="services-preview">
        <div className="container">
          <div className="section-title">
            <h2>Dịch vụ y tế hàng đầu</h2>
            <p>Khám phá các dịch vụ chuyên khoa của chúng tôi</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <Link key={index} to={service.link} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-arrow">
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>
          
          <div className="services-cta">
            <Link to="/services" className="btn btn-primary">
              Xem tất cả dịch vụ
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-title">
            <h2>Bệnh nhân nói gì về chúng tôi</h2>
            <p>Những phản hồi chân thực từ bệnh nhân đã tin tưởng</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={testimonial.avatar} alt={testimonial.name} />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.treatment}</p>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="news-section">
        <div className="container">
          <div className="section-title">
            <h2>Tin tức & Sự kiện</h2>
            <p>Cập nhật những thông tin mới nhất từ bệnh viện</p>
          </div>
          
          <div className="news-grid">
            {news.map((article) => (
              <div key={article.id} className="news-card">
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                  <div className="news-category">{article.category}</div>
                </div>
                <div className="news-content">
                  <div className="news-date">{article.date}</div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <a href="#" className="news-link">
                    Đọc thêm <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Sẵn sàng bắt đầu hành trình chăm sóc sức khỏe?</h2>
            <p>Đặt lịch khám với bác sĩ chuyên khoa ngay hôm nay</p>
            <div className="cta-actions">
              <Link to="/appointment" className="btn btn-primary">
                Đặt lịch ngay
              </Link>
              <div className="cta-contact">
                <Phone size={20} />
                <span>Hoặc gọi: +84 123 456 789</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="quick-contact">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-item">
              <Phone size={24} />
              <div>
                <h4>Hotline 24/7</h4>
                <p>+84 123 456 789</p>
              </div>
            </div>
            <div className="contact-item">
              <Mail size={24} />
              <div>
                <h4>Email</h4>
                <p>info@medicare.com</p>
              </div>
            </div>
            <div className="contact-item">
              <MapPin size={24} />
              <div>
                <h4>Địa chỉ</h4>
                <p>123 Medical Street, City</p>
              </div>
            </div>
            <div className="contact-item">
              <Clock size={24} />
              <div>
                <h4>Giờ làm việc</h4>
                <p>T2-CN: 8:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
