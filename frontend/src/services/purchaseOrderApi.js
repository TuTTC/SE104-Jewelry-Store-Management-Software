const BASE_URL = "http://localhost:5000/api/phieunhap"; // Đặt đúng route backend của bạn

// Lấy tất cả phiếu nhập
export const getAllOrders = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách phiếu nhập");
  return res.json();
};

// Lấy phiếu nhập theo ID
export const getOrderById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Phiếu nhập không tồn tại");
  return res.json();
};

// Thêm mới phiếu nhập
export const addOrder = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi tạo phiếu nhập");
  return res.json();
};

// Cập nhật phiếu nhập
export const updateOrder = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật phiếu nhập");
  return res.json();
};

// Xoá phiếu nhập
export const deleteOrder = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi khi xoá phiếu nhập");
  return res.json();
};

// Xuất file PDF
export const exportOrderPDF = (id) => {
  const url = `${BASE_URL}/${id}/export`;
  window.open(url, "_blank");
};
