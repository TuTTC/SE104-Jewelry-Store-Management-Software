import React, { useState } from "react";
import "../../App.css";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import { sendOtpRegister, login } from "./authApi";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [selectedPage, setSelectedPage] = useState("login");
  const [formData, setFormData] = useState({
    select_role: "customer",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
        console.log("Phản hồi từ login API:", res);

        if (res.token) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(res.user));
          navigate("/admin/dashboard");
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
      <div className="modal">
        <div className="modal-header">
          <h2>{selectedPage === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
        </div>
        <div className="modal-form">
          {selectedPage === "login" && (
            <LoginForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onSwitch={setSelectedPage}
              error={error}
              onGoogleLogin={handleGoogleLogin}
            />
          )}
          {selectedPage === "register" && (
            <RegisterForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onSwitch={setSelectedPage}
              error={error}
              onGoogleLogin={handleGoogleLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
