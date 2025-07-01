const API_URL = "http://localhost:5000/api/dichvu";

// Thêm dịch vụ mới
export async function themDichVu(dichVu) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dichVu),
  });
  return await res.json();
}

// Xóa dịch vụ theo ID
export async function xoaDichVu(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

// Cập nhật dịch vụ
export async function suaDichVu(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// Tra cứu dịch vụ theo từ khóa
export async function traCuuDichVu(keyword) {
  const res = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
  return await res.json();
}

// Lấy danh sách dịch vụ
export async function danhSachDichVu() {
  const res = await fetch(API_URL);
  return await res.json();
}

export async function inPhieuDichVu() {
  const res = await fetch("http://localhost:5000/api/dichvu/pdf", {
    method: "GET",
  });
  if (!res.ok) throw new Error("Lỗi khi lấy PDF");
  return await res.blob(); // trả file PDF
}