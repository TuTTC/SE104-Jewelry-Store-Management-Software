const API_BASE = 'http://localhost:5000/api/auth';

export const sendOtpRegister = async (data) => {
  const res = await fetch(`${API_BASE}/send-otp-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const confirmOtpRegister = async (email, otp) => {
  const res = await fetch(`${API_BASE}/confirm-otp-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, otp }),
  });
  return await res.json();
};

export const login = async (data) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
};
