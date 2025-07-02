const API_URL = "http://localhost:5000/api/baocao";

// Thêm báo cáo mới
export async function themBaoCao(baoCao) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(baoCao),
  });
  return await res.json();
}

// Cập nhật báo cáo
export async function suaBaoCao(id, baoCao) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(baoCao),
  });
  return await res.json();
}

// Xóa báo cáo
export async function xoaBaoCao(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  return await res.json();
}

// Lấy danh sách toàn bộ báo cáo
export async function layDanhSachBaoCao() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Corrected: accept an ID
export async function inBaoCaoPDF(id) {
  const res = await fetch(`${API_URL}/${id}/print`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}