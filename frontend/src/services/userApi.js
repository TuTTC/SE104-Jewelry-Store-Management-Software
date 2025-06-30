const BASE_URL = "http://localhost:5000/api/user";

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
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 2. Cập nhật thông tin tài khoản hiện tại
  updateCurrentUser: async (data) => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 3. Lấy danh sách tất cả người dùng (admin)
  getAllUsers: async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách người dùng");
  return res.json();
  },


  // 4. Lấy thông tin chi tiết người dùng theo ID (kèm quyền)
  getUserDetails: async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/details`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 5. Cập nhật người dùng theo ID
  updateUserById: async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 6. Xóa người dùng
  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // 7. Đổi vai trò người dùng
  changeUserRole: async (id, roleId) => {
    const res = await fetch(`${BASE_URL}/users/${id}/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ VaiTroID: roleId }),
    });
    return res.json();
  },

  // 8. Cập nhật quyền riêng của người dùng
  updateUserPermissions: async (userId, permissions) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/permissions`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });
    return res.json();
  },
};

export default userApi;
