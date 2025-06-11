import { useState } from 'react';
import { checkToken } from '../../../frontend/auth-test-app/src/api/auth';

export default function TokenCheck() {
  const [result, setResult] = useState('');

  const handleCheck = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await checkToken(token);
      setResult(res.data.message + ' - ID: ' + res.data.user_id);
    } catch {
      setResult('Token không hợp lệ');
    }
  };

  return (
    <div className="p-4 border rounded space-y-2">
      <h2 className="font-bold">Kiểm tra Token</h2>
      <button className="btn" onClick={handleCheck}>Kiểm tra</button>
      <p className="text-sm text-gray-700 mt-2">{result}</p>
    </div>
  );
}