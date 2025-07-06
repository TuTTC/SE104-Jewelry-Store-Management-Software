const API_BASE = "http://localhost:5000/api/inventory";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || data.message || "Có lỗi xảy ra");
    error.status = res.status;
    throw error;
  }
  return data;
};

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

const inventoryApi = {

  // Lấy toàn bộ tồn kho
  getAll: async () => {
    const res = await fetch(`${API_BASE}/`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Cập nhật số lượng tồn & mức cảnh báo của 1 sản phẩm
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

  // Cập nhật toàn bộ tồn kho (gọi khi cần)
  updateAll: async () => {
    const res = await fetch(`${API_BASE}/capnhat_all`, {
      method: "PUT",
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Lọc tồn kho theo tháng, năm
  filterByMonth: async (month, year) => {
    const res = await fetch(`${API_BASE}/filter-by-month?month=${month}&year=${year}`, {
      headers: getAuthHeader()
    });
    return handleResponse(res);
  },

  // Export PDF báo cáo tồn kho theo tháng
  exportByMonth: async (month, year) => {
    const res = await fetch(`${API_BASE}/export-by-month?month=${month}&year=${year}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Xuất báo cáo thất bại");
    return res.blob();  // Trả về blob để tải file
  },

  // Export toàn bộ báo cáo tồn kho PDF
  exportAll: async () => {
    const res = await fetch(`${API_BASE}/export`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Xuất báo cáo thất bại");
    return res.blob();
  }
};

export default inventoryApi;
