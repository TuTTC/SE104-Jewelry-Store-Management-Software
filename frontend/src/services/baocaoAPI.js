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
    method: "DELETE" });
  return await res.json();
}

// Lấy danh sách toàn bộ báo cáo
export async function layDanhSachBaoCao() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Báo cáo theo ngày
export async function baoCaoTheoNgay(date) {
  const res = await fetch(`${API_URL}/theongay?date=${encodeURIComponent(date)}`);
  return await res.json();
}

// Báo cáo theo tháng
export async function baoCaoTheoThang(month, year) {
  const res = await fetch(`${API_URL}/theothang?month=${month}&year=${year}`);
  return await res.json();
}

// Báo cáo theo năm
export async function baoCaoTheoNam(year) {
  const res = await fetch(`${API_URL}/theonam?year=${year}`);
  return await res.json();
}

// Báo cáo tồn kho
export async function baoCaoTonKho() {
  const res = await fetch(`${API_URL}/tonkho`);
  return await res.json();
}
