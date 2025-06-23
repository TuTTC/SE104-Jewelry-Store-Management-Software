import React, { useState } from "react";
import './Auth.css';
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { sendOtpRegister, login } from "./authAPI";
import Auth from "./auth/Auth"; // <- thêm import
function Auth({ onAuthSuccess }) {
  const [selectedPage, setSelectedPage] = useState("login");
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const openModal = (page) => {
    setSelectedPage(page);
    setShowModal(true);
    setError("");
    setFormData({});
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validateRegister = () => {
    if (!formData.txt_username || formData.txt_username.length > 100) {
      setError("Tên đăng nhập không hợp lệ (tối đa 100 ký tự).");
      return false;
    }
    if (!formData.txt_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.txt_email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (!formData.txt_password || formData.txt_password !== formData.txt_confirmPassword) {
      setError("Mật khẩu không khớp hoặc không hợp lệ.");
      return false;
    }
    if (!formData.select_role || !["admin", "customer"].includes(formData.select_role)) {
      setError("Vui lòng chọn vai trò hợp lệ.");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!formData.txt_username || !formData.txt_password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPage === "register" && validateRegister()) {
      try {
        const res = await sendOtpRegister({
          TenDangNhap: formData.txt_username,
          Email: formData.txt_email,
          MatKhau: formData.txt_password,
          VaiTro: formData.select_role,
        });
        if (res.success) {
          alert("Gửi OTP thành công! Kiểm tra email để xác nhận.");
          setSelectedPage("login");
        } else {
          setError(res.message || "Đăng ký thất bại.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi đăng ký.");
      }
    } else if (selectedPage === "login" && validateLogin()) {
      try {
        const res = await login({
          TenDangNhap: formData.txt_username,
          MatKhau: formData.txt_password,
        });
        if (res.token) {
          localStorage.setItem("token", res.token);
          onAuthSuccess(true, res.user.VaiTro, res.user);
          closeModal();
        } else {
          setError(res.message || "Đăng nhập thất bại.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi đăng nhập.");
      }
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login triggered");
  };

  return (
    <div className="container">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedPage === "login" ? "Đăng nhập" : selectedPage === "register" ? "Đăng ký" : "Quên mật khẩu"}</h2>
              <button onClick={closeModal} className="modal-close"><X className="icon" /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {selectedPage === "login" && (
                <LoginForm
                  formData={formData}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onSwitch={openModal}
                  error={error}
                  onGoogleLogin={handleGoogleLogin}
                />
              )}
              {selectedPage === "register" && (
                <RegisterForm
                  formData={formData}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onSwitch={openModal}
                  error={error}
                  onGoogleLogin={handleGoogleLogin}
                />
              )}
              {selectedPage === "forgot" && (
                <ForgotPasswordForm
                  formData={formData}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onSwitch={openModal}
                  error={error}
                />
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
