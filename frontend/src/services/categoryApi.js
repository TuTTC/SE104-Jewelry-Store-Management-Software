const API_BASE = "http://localhost:5000/api/categories/";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
};

const categoryApi = {
  getAll: async () => {
    const res = await fetch(API_BASE);
    return handleResponse(res);
  },

  add: async (data) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },
};

export default categoryApi;
