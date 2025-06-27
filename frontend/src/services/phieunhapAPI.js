const API_URL = "http://localhost:5000/api/phieunhap";

// Tạo phiếu nhập mới
export async function taoPhieuNhap(phieu) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(phieu),
  });
  return await res.json();
}

// Lấy danh sách phiếu nhập
export async function danhSachPhieuNhap() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Lấy chi tiết 1 phiếu nhập
export async function chiTietPhieuNhap(maPN) {
  const res = await fetch(`${API_URL}/${maPN}`);
  return await res.json();
}

// Sửa 1 dòng chi tiết phiếu nhập
export async function suaChiTietPhieuNhap(maCTPN, data) {
  const res = await fetch(`${API_URL}/chitiet/${maCTPN}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// Xóa 1 dòng chi tiết phiếu nhập
export async function xoaChiTietPhieuNhap(maCTPN) {
  const res = await fetch(`${API_URL}/chitiet/${maCTPN}`, {
    method: "DELETE",
  });
  return await res.json();
}
