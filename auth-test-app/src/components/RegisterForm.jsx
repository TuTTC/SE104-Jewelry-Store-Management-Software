import { useState } from 'react';
import { register } from '../../frontend/auth-test-app/src/api/auth';

export default function RegisterForm() {
  const [form, setForm] = useState({ TenDangNhap: '', Email: '', MatKhau: '' });

  const handleSubmit = async () => {
    try {
      const res = await register({ ...form, VaiTro: 'khachhang' });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đăng ký');
    }
  };

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-bold">Đăng ký</h2>
      <input className="input" placeholder="Tên đăng nhập" onChange={e => setForm({ ...form, TenDangNhap: e.target.value })} />
      <input className="input" placeholder="Email" onChange={e => setForm({ ...form, Email: e.target.value })} />
      <input className="input" type="password" placeholder="Mật khẩu" onChange={e => setForm({ ...form, MatKhau: e.target.value })} />
      <button className="btn" onClick={handleSubmit}>Đăng ký</button>
    </div>
  );
}
