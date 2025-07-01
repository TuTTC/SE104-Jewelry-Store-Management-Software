const API_URL = "http://localhost:5000/api/donhang";

// Tạo đơn hàng mới
export async function taoDonHang(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}


// Lấy danh sách đơn hàng
export async function danhSachDonHang() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Xóa đơn hàng
export async function xoaDonHang(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

// Xác nhận thanh toán
export async function xacNhanThanhToan(id) {
  const res = await fetch(`${API_URL}/${id}/thanhtoan`, {
    method: "POST",
  });
  return await res.json();
}

// Đóng gói & giao hàng
export async function dongGoiGiaoHang(id) {
  const res = await fetch(`${API_URL}/${id}/giaohang`, {
    method: "POST",
  });
  return await res.json();
}

// Cập nhật trạng thái đơn hàng
export async function capNhatTrangThaiDonHang(id, trangThai) {
  const res = await fetch(`${API_URL}/${id}/trangthai`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ TrangThai: trangThai }),
  });
  return await res.json();
}

// Gửi yêu cầu trả/đổi hàng
export async function xuLyTraDoi(id) {
  const res = await fetch(`${API_URL}/${id}/doitra`, {
    method: "POST",
  });
  return await res.json();
}

// In đơn hàng (trả về PDF)
export async function inDanhSachDonHang() {
  const res = await fetch(`${API_URL}/print`);
  return await res.blob(); // nếu trả về file PDF
}

// Sửa thông tin đơn hàng
// Lưu ý: Hàm này có thể được sử dụng để cập nhật thông tin đơn
export async function suaDonHang(id, payload) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

// Cập nhật chi tiết đơn hàng
export async function capNhatChiTietDonHang(id, items) {
  try {
  const res = await fetch(`${API_URL}/${id}/chitiet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  return res.json();
  } catch (err) {
    return { status: "error", message: err.message };
  }
}
export async function getChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet`);
  return res.json();
}


/** Xuất chi tiết đơn hàng ra PDF */
export async function inChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet/pdf`);
  if (!res.ok) throw new Error("Không thể tạo PDF");
  return res.blob();
}