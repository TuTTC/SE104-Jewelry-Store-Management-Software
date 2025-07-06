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

// Xuất PDF phiếu dịch vụ
export async function xuatPDFPhieuDichVu(id) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}/export-pdf`, {
    method: "GET",
  });

  // Lấy dữ liệu PDF từ response blob
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  // Tự động mở/tải PDF
  const link = document.createElement("a");
  link.href = url;
  link.download = `phieu_dich_vu_${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
