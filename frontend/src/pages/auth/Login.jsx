import React from "react";
import { UserCircle } from "lucide-react";

const LoginForm = ({ formData, onChange, onSubmit, onSwitch, error, onGoogleLogin }) => (
  <form onSubmit={onSubmit} className="login-form">
    {error && <p className="error-message">{error}</p>}

    <div className="input-group">
      <UserCircle className="icon" />
      <input
        type="text"
        name="txt_username"
        value={formData.txt_username || ""}
        onChange={onChange}
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
        onChange={onChange}
        placeholder="Mật khẩu"
        required
      />
    </div>

    <button type="submit" className="action-button">Đăng nhập</button>
    <button type="button" onClick={() => onSwitch("register")} className="action-button cancel">Chưa có tài khoản? Đăng ký</button>
    <button type="button" onClick={() => onSwitch("forgot")} className="action-button cancel">Quên mật khẩu?</button>
    <button type="button" onClick={onGoogleLogin} className="action-button google">Đăng nhập với Google</button>
  </form>
);

export default LoginForm;
