const API_URL = "http://localhost:5000/api/donhang";

// Hàm lấy header Authorization (ví dụ lấy token từ localStorage)
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

const handleResponse = async (res) => {
  // Trường hợp trả về blob (file PDF) thì không parse JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || "Có lỗi xảy ra");
      error.status = res.status;
      throw error;
    }
    return data;
  } else if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
    if (!res.ok) {
      throw new Error("Không thể tải file");
    }
    return res.blob();
  } else {
    // Các loại khác, trả về raw text
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || "Có lỗi xảy ra");
    }
    return text;
  }
};

// Tạo đơn hàng mới
export async function taoDonHang(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Lấy danh sách đơn hàng
export async function danhSachDonHang() {
  const res = await fetch(API_URL, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xóa đơn hàng
export async function xoaDonHang(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xác nhận thanh toán
export async function xacNhanThanhToan(id) {
  const res = await fetch(`${API_URL}/${id}/thanhtoan`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Đóng gói & giao hàng
export async function dongGoiGiaoHang(id) {
  const res = await fetch(`${API_URL}/${id}/giaohang`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Cập nhật trạng thái đơn hàng
export async function capNhatTrangThaiDonHang(id, trangThai) {
  const res = await fetch(`${API_URL}/${id}/trangthai`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ TrangThai: trangThai }),
  });
  return handleResponse(res);
}

// Gửi yêu cầu trả/đổi hàng
export async function xuLyTraDoi(id) {
  const res = await fetch(`${API_URL}/${id}/doitra`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// In danh sách đơn hàng (file PDF)
export async function inDanhSachDonHang() {
  const res = await fetch(`${API_URL}/print`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Sửa thông tin đơn hàng
export async function suaDonHang(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// Cập nhật chi tiết đơn hàng
export async function capNhatChiTietDonHang(id, items) {
  const res = await fetch(`${API_URL}/${id}/chitiet`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(items),
  });
  return handleResponse(res);
}

// Lấy chi tiết đơn hàng
export async function getChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xuất chi tiết đơn hàng ra PDF
export async function inChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet/pdf`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}
