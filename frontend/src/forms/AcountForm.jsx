// src/forms/AccountForm.jsx
import React, { useState, useEffect } from "react";

function AccountForm({ data, type, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    position: "",
    accountCode: "",
    email: "",
    phone: "",
    address: "",
    status: "Active",
    role: "User"
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input name="name" value={form.name} onChange={handleChange} placeholder="Tên" required />
      <input name="position" value={form.position} onChange={handleChange} placeholder="Chức vụ" required />
      <input name="accountCode" value={form.accountCode} onChange={handleChange} placeholder="Mã tài khoản" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Điện thoại" required />
      <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" required />
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Active">Kích hoạt</option>
        <option value="Inactive">Vô hiệu hóa</option>
      </select>
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="Admin">Admin</option>
        <option value="User">User</option>
      </select>
      <div className="form-buttons">
        <button type="submit">{type === "add" ? "Thêm" : "Lưu"}</button>
        <button type="button" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}

export default AccountForm;
