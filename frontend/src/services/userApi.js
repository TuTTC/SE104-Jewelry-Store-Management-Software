// src/api/userApi.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const userApi = {
  // 1. Lấy thông tin tài khoản hiện tại
  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 2. Cập nhật thông tin tài khoản hiện tại
  updateCurrentUser: async (data) => {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 3. Lấy danh sách tất cả người dùng (admin)
  getAllUsers: async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 4. Lấy thông tin người dùng theo ID
  getUserById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 5. Cập nhật người dùng theo ID
  updateUserById: async (id, data) => {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 6. Xóa người dùng
  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 7. Gán vai trò mới cho người dùng
  changeUserRole: async (id, role) => {
    const res = await fetch(`${BASE_URL}/api/users/${id}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ VaiTro: role }),
    });
    return res.json();
  },
};

export default userApi;
