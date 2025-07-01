const API_BASE = "http://localhost:5000/api/inventory";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
  return data;
};

const inventoryApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/`);
    return handleResponse(res);
  },

  addOrUpdate: async (data) => {
    const res = await fetch(`${API_BASE}/${data.MaSP}/capnhat`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ SoLuongTon: data.SoLuongTon }),
    });
    return handleResponse(res);
  },
  // Cập nhật toàn bộ bảng tồn kho một lần
  updateAll: async (dataList) => {
    const res = await fetch(`${API_BASE}/capnhat_all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataList),
    });
    return handleResponse(res);
  },
};

export default inventoryApi;
