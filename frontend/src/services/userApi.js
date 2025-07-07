const BASE_URL = "http://localhost:5000/api/user";

// Hàm header có token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
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

const userApi = {
  // 1. Lấy thông tin tài khoản hiện tại
  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  updateCurrentUser: async (data) => {
    const res = await fetch(`${BASE_URL}/me`, {
      method: "PUT",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json", // ⚠️ Rất quan trọng
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // 3. Lấy danh sách tất cả người dùng (admin)
  getAllUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // 4. Lấy thông tin chi tiết người dùng theo ID (kèm quyền)
  getUserDetails: async (userId) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/details`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // 5. Cập nhật người dùng theo ID
  updateUser: async (id, data) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // 6. Xóa người dùng
  deleteUser: async (id) => {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // 7. Đổi vai trò người dùng
  changeUserRole: async (id, roleId) => {
    const res = await fetch(`${BASE_URL}/users/${id}/role`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify({ VaiTroID: roleId }),
    });
    return handleResponse(res);
  },

  // 8. Cập nhật quyền riêng của người dùng
  updateUserPermissions: async (userId, permissions) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/permissions`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify({ permissions }),
    });
    return handleResponse(res);
  },

  // 9. Tạo người dùng mới
  createUser: async (userData) => {
    const res = await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
};

export default userApi;
