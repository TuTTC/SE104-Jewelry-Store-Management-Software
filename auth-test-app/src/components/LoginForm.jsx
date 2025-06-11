import { useState } from 'react';
import { login } from '../../../frontend/auth-test-app/src/api/auth';

export default function LoginForm() {
  const [form, setForm] = useState({ TenDangNhap: '', MatKhau: '' });

  const handleSubmit = async () => {
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      alert('Đăng nhập thành công');
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi đăng nhập');
    }
  };

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-bold">Đăng nhập</h2>
      <input className="input" placeholder="Tên đăng nhập" onChange={e => setForm({ ...form, TenDangNhap: e.target.value })} />
      <input className="input" type="password" placeholder="Mật khẩu" onChange={e => setForm({ ...form, MatKhau: e.target.value })} />
      <button className="btn" onClick={handleSubmit}>Đăng nhập</button>
    </div>
  );
}
