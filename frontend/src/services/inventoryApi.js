const API_BASE = "http://localhost:5000/api/inventory";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || "Có lỗi xảy ra");
    error.status = res.status;  // Gắn thêm status vào đối tượng lỗi
    throw error;
  }
  return data;
};


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  console.log(token)
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

const inventoryApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  addOrUpdate: async (data) => {
    const res = await fetch(`${API_BASE}/${data.MaSP}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify({
        SoLuongTon: data.SoLuongTon,
        MucCanhBao: data.MucCanhBao
      }),
    });
    return handleResponse(res);
  },

  updateAll: async () => {
    const res = await fetch(`${API_BASE}/capnhat_all`, {
      method: "PUT",
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },
};

export default inventoryApi;