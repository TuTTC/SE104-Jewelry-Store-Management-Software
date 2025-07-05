const API_BASE = "http://localhost:5000/api/categories/";

// Hàm lấy toàn bộ header gồm Content-Type và Authorization
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Hàm xử lý response, trả kèm status
const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    let message = "Có lỗi xảy ra";

    if (res.status === 403) {
      message = "Bạn không có quyền thực hiện chức năng này";
    } else if (res.status === 401) {
      message = "Vui lòng đăng nhập";
    } else if (data.error) {
      message = data.error;
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
};


const categoryApi = {
  getAll: async () => {
    const res = await fetch(API_BASE, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  add: async (data) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export default categoryApi;
