const API_BASE = "http://localhost:5000/api/parameter";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
  return data;
};

const parameterApi = {
  // Lấy tất cả tham số
  getAll: async () => {
    const res = await fetch(API_BASE);
    return handleResponse(res);
  },

  // Lấy tham số theo tên
  getByName: async (ten) => {
    const res = await fetch(`${API_BASE}/thamso/${ten}`);
    return handleResponse(res);
  },

  // Cập nhật tham số
  update: async (ten, data) => {
    const res = await fetch(`${API_BASE}/thamso/${ten}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export default parameterApi;
