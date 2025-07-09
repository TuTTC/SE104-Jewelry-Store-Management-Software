const API_BASE = "http://localhost:5000/api";

// Lấy danh sách tất cả phiếu dịch vụ
export async function getPhieuDichVuList() {
  const res = await fetch(`${API_BASE}/phieudichvu`);
  return await res.json();
}

// Lấy chi tiết phiếu dịch vụ theo ID
export async function getPhieuDichVuById(id) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`);
  return await res.json();
}

// Thêm phiếu dịch vụ mới
export async function themPhieuDichVu(data) {
  const res = await fetch(`${API_BASE}/phieudichvu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// Cập nhật phiếu dịch vụ
export async function capNhatPhieuDichVu(id, data) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// Xoá phiếu dịch vụ
export async function xoaPhieuDichVu(id) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

// In toàn bộ danh sách phiếu dịch vụ (PDF blob)
export async function printDanhSachPhieuDichVu() {
  const res = await fetch(`${API_BASE}/phieudichvu/print-danhsach`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Không thể lấy PDF danh sách phiếu dịch vụ");
  return await res.blob();
}

// In chi tiết phiếu dịch vụ theo mã
export function printChiTietPhieuDichVu(maPDV) {
  const url = `${API_BASE}/phieudichvu/${maPDV}/print`;
  window.open(url, "_blank"); // Mở tab mới luôn
}

export async function searchPhieuDichVu(keyword) {
  const res = await fetch(`${API_BASE}/phieudichvu/search?keyword=${encodeURIComponent(keyword)}`);
  return await res.json();
}