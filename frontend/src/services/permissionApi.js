const BASE_URL = "http://localhost:5000/api/permissions"; // Chuẩn lại đúng endpoint Flask

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const permissionApi = {
  // 1. Lấy tất cả quyền hệ thống
  getAllPermissions: async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi lấy danh sách quyền");
    return res.json();
  },

  // 2. Lấy quyền riêng + tất cả quyền của người dùng (API chuẩn nên dùng)
  getUserPermissionsDetail: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/permissions-detail`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi lấy quyền người dùng");
    return res.json();
  },

  // 3. Lấy quyền mặc định theo vai trò của người dùng
  getRolePermissions: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/role-permissions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi lấy quyền theo vai trò");
    return res.json();
  },

  // 4. Cập nhật quyền riêng của người dùng (granted, denied)
  updateUserPermissions: async (userId, { granted, denied }) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/permissions`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ granted, denied }),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật quyền người dùng");
    return res.json();
  },
};

export default permissionApi;
