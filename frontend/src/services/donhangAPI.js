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

// Cập nhật trạng thái đơn hàng
export async function capNhatTrangThaiDonHang(id, trangThai) {
  const res = await fetch(`${API_URL}/${id}/trangthai`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ TrangThai: trangThai }),
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

// Đóng gói và giao hàng
export async function dongGoiGiaoHang(id) {
  const res = await fetch(`${API_URL}/${id}/giaohang`, {
    method: "POST",
  });
  return await res.json();
}

// Tạo yêu cầu trả/đổi hàng
export async function xuLyTraDoi(id) {
  const res = await fetch(`${API_URL}/${id}/doitra`, {
    method: "POST",
  });
  return await res.json();
}

// Xóa đơn hàng
export async function xoaDonHang(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}
