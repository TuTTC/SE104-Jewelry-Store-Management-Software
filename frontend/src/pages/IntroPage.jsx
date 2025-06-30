import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function IntroPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="intro-page">
      <div className="intro-content">
        <img src="/logoVTP.svg" alt="Jewelry Admin Logo" className="intro-logo" />
        <h1>Welcome to Jewelry Admin</h1>
        <p>
          Jewelry Admin là một ứng dụng web toàn diện được thiết kế để quản lý mọi khía cạnh của doanh nghiệp trang sức của bạn. 
          Với các tính năng như quản lý sản phẩm, theo dõi đơn hàng, quản lý khách hàng và hơn thế nữa, 
          nó cung cấp một nền tảng tập trung để đơn giản hóa hoạt động và nâng cao năng suất.
        </p>
        <button onClick={handleLoginClick} className="action-button">Đăng nhập</button>
      </div>
    </div>
  );
}

export default IntroPage;