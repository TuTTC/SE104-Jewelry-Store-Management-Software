const BASE_URL = "http://localhost:5000/api/permissions";

// Hàm header có token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Hàm tiện ích xử lý response, ném thêm status code
const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type");

  let data = {};
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    const error = new Error("Server trả về dữ liệu không hợp lệ:\n" + text);
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(data.message || "Có lỗi xảy ra");
    error.status = res.status;
    throw error;
  }

  return data;
};

const permissionApi = {
  // 1. Lấy tất cả quyền hệ thống
  getAllPermissions: async () => {
    const res = await fetch(`${BASE_URL}/`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // 2. Lấy quyền riêng + tất cả quyền của người dùng
  getUserPermissionsDetail: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/permissions-detail`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // 3. Lấy quyền mặc định theo vai trò của người dùng
  getRolePermissions: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/role-permissions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // 4. Cập nhật quyền riêng của người dùng (granted, denied)
  updateUserPermissions: async (userId, { granted, denied }) => {
    const res = await fetch(`${BASE_URL}/user/${userId}/permissions`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ granted, denied }),
    });
    return handleResponse(res);
  },
};

export default permissionApi;
