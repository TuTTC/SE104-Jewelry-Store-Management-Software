const BASE_URL = "http://localhost:5000/api/permissions";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const permissionApi = {
  // 1. Lấy tất cả quyền
  getAllPermissions: async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi lấy danh sách quyền");
    return res.json();
  },

  // 2. Lấy quyền riêng của người dùng + tất cả quyền
  getUserPermissions: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi lấy quyền người dùng");
    return res.json();
  },

  // 3. Cập nhật quyền riêng của người dùng
  updateUserPermissions: async (userId, permissions) => {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật quyền người dùng");
    return res.json();
  },
};

export default permissionApi;
