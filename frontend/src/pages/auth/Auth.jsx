import React, { useState } from "react";
import '../../App.css';
import { UserCircle, X, Mail } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const initialAccounts = [
  { id: 1, username: "alice", password: "alice123", name: "Alice Johnson", email: "alice@jewelry.com", role: "admin" },
  { id: 2, username: "bob", password: "bob123", name: "Bob Lee", email: "bob@jewelry.com", role: "customer" },
];

function Auth() {
  const [selectedPage, setSelectedPage] = useState("login");
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({});
  const [accounts, setAccounts] = useState(initialAccounts);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPage === "register" && validateRegister()) {
      const newAccount = { id: Date.now(), ...formData, status: "Active" };
      setAccounts([...accounts, newAccount]);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setSelectedPage("login");
      setFormData({});
    } else if (selectedPage === "login" && validateLogin()) {
      const user = accounts.find(account => 
        account.username === formData.txt_username && 
        account.password === formData.txt_password
      );
      login(user.role, user);
      closeModal();
      navigate('/admin/dashboard');
    } else if (selectedPage === "forgot") {
      handleForgotPassword();
    } else {
      setError("Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
    }
  };

  const validateRegister = () => {
    if (!formData.txt_username || formData.txt_username.length > 100) {
      setError("Tên đăng nhập không hợp lệ (tối đa 100 ký tự).");
      return false;
    }
    if (accounts.some(account => account.username === formData.txt_username)) {
      setError("Tên đăng nhập đã tồn tại.");
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
    if (!formData.select_role || !["admin", "employee", "customer"].includes(formData.select_role)) {
      setError("Vui lòng chọn vai trò hợp lệ.");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    const userExists = accounts.some(account => 
      account.username === formData.txt_username && 
      account.password === formData.txt_password
    );
    if (!userExists) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
    return userExists;
  };

  const handleForgotPassword = () => {
    if (!formData.txt_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.txt_email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    const user = accounts.find(account => account.email === formData.txt_email);
    if (!user) {
      setError("Email không tồn tại trong hệ thống.");
      return;
    }
    alert(`Link đặt lại mật khẩu đã được gửi tới ${formData.txt_email}. (Chức năng mẫu)`);
    setSelectedPage("login");
    setFormData({});
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
              <h2>
                {selectedPage === "login" ? "Đăng nhập" : 
                 selectedPage === "register" ? "Đăng ký" : "Quên mật khẩu"}
              </h2>
              <button onClick={closeModal} className="modal-close">
                <X className="icon" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <p className="error-message">{error}</p>}
              
              {selectedPage === "register" && (
                <>
                  <div className="input-group">
                    <UserCircle className="icon" />
                    <input 
                      type="text" 
                      name="txt_username" 
                      value={formData.txt_username || ""} 
                      onChange={handleInputChange} 
                      placeholder="Tên đăng nhập" 
                      maxLength="100" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Mail className="icon" />
                    <input 
                      type="email" 
                      name="txt_email" 
                      value={formData.txt_email || ""} 
                      onChange={handleInputChange} 
                      placeholder="Địa chỉ email" 
                      maxLength="100" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <input 
                      type="password" 
                      name="txt_password" 
                      value={formData.txt_password || ""} 
                      onChange={handleInputChange} 
                      placeholder="Mật khẩu" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <input 
                      type="password" 
                      name="txt_confirmPassword" 
                      value={formData.txt_confirmPassword || ""} 
                      onChange={handleInputChange} 
                      placeholder="Xác nhận mật khẩu" 
                      required 
                    />
                  </div>
                  <select 
                    name="select_role" 
                    value={formData.select_role || "customer"} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="employee">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                  <button type="submit" className="action-button">Đăng ký</button>
                  <button 
                    type="button" 
                    onClick={() => openModal("login")} 
                    className="action-button cancel"
                  >
                    Đã có tài khoản? Đăng nhập
                  </button>
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    className="action-button google"
                  >
                    Đăng ký với Google
                  </button>
                </>
              )}

              {selectedPage === "login" && (
                <>
                  <div className="input-group">
                    <UserCircle className="icon" />
                    <input 
                      type="text" 
                      name="txt_username" 
                      value={formData.txt_username || ""} 
                      onChange={handleInputChange} 
                      placeholder="Tên đăng nhập" 
                      maxLength="100" 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <input 
                      type="password" 
                      name="txt_password" 
                      value={formData.txt_password || ""} 
                      onChange={handleInputChange} 
                      placeholder="Mật khẩu" 
                      required 
                    />
                  </div>
                  <button type="submit" className="action-button">Đăng nhập</button>
                  <button 
                    type="button" 
                    onClick={() => openModal("register")} 
                    className="action-button cancel"
                  >
                    Chưa có tài khoản? Đăng ký
                  </button>
                  <button 
                    type="button" 
                    onClick={() => openModal("forgot")} 
                    className="action-button cancel"
                  >
                    Quên mật khẩu?
                  </button>
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    className="action-button google"
                  >
                    Đăng nhập với Google
                  </button>
                </>
              )}

              {selectedPage === "forgot" && (
                <>
                  <div className="input-group">
                    <Mail className="icon" />
                    <input 
                      type="email" 
                      name="txt_email" 
                      value={formData.txt_email || ""} 
                      onChange={handleInputChange} 
                      placeholder="Địa chỉ email" 
                      maxLength="100" 
                      required 
                    />
                  </div>
                  <button type="submit" className="action-button">Gửi link đặt lại</button>
                  <button 
                    type="button" 
                    onClick={() => openModal("login")} 
                    className="action-button cancel"
                  >
                    Quay lại đăng nhập
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;

/*
import React, { useState } from "react";
import '../../App.css';
import { X } from "lucide-react";
import LoginForm from "./Login";
import RegisterForm from "./Register";
// import ForgotPasswordForm from "./ForgotPasswordForm";
import { sendOtpRegister, login } from "./authApi";

function Auth({ onAuthSuccess }) {
  const [selectedPage, setSelectedPage] = useState("login");
  const [showModal, setShowModal] = useState(true);
  const [formData, setFormData] = useState({
  select_role: "customer", // Gán mặc định rõ ràng
});
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
              )} */ 
              {/* {selectedPage === "forgot" && (
                <ForgotPasswordForm
                  formData={formData}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  onSwitch={openModal}
                  error={error}
                />
              )} */} /*
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
*/


// src/pages/auth/Auth.jsx
