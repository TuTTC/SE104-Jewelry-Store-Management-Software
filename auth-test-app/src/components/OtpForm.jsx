import { useState } from 'react';
import { sendOtp } from '../../frontend/auth-test-app/src/api/auth';

export default function OtpForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await sendOtp(email);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Không gửi được OTP');
    }
  };

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-bold">Gửi OTP</h2>
      <input className="input" placeholder="Email nhận OTP" onChange={e => setEmail(e.target.value)} />
      <button className="btn" onClick={handleSubmit}>Gửi OTP</button>
    </div>
  );
}