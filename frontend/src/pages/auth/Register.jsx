import React from "react";
import { UserCircle, Mail } from "lucide-react";

const RegisterForm = ({ formData, onChange, onSubmit, onSwitch, error, onGoogleLogin }) => (
  <>
    {error && <p className="error-message">{error}</p>}
    <div className="input-group">
      <UserCircle className="icon" />
      <input type="text" name="txt_username" value={formData.txt_username || ""} onChange={onChange} placeholder="Tên đăng nhập" maxLength="100" required />
    </div>
    <div className="input-group">
      <Mail className="icon" />
      <input type="email" name="txt_email" value={formData.txt_email || ""} onChange={onChange} placeholder="Địa chỉ email" maxLength="100" required />
    </div>
    <div className="input-group">
      <input type="password" name="txt_password" value={formData.txt_password || ""} onChange={onChange} placeholder="Mật khẩu" required />
    </div>
    <div className="input-group">
      <input type="password" name="txt_confirmPassword" value={formData.txt_confirmPassword || ""} onChange={onChange} placeholder="Xác nhận mật khẩu" required />
    </div>
    <select name="select_role" value={formData.select_role || "customer"} onChange={onChange} required>
      <option value="customer">Khách hàng</option>
      <option value="admin">Quản trị viên</option>
    </select>
    <button type="submit" className="action-button">Đăng ký</button>
    <button type="button" onClick={() => onSwitch("login")} className="action-button cancel">Đã có tài khoản? Đăng nhập</button>
    <button type="button" onClick={onGoogleLogin} className="action-button google">Đăng ký với Google</button>
  </>
);

export default RegisterForm;
