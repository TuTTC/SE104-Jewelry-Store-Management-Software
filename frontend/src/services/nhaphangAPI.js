const API_BASE = "http://localhost:5000/api";

// Nhà cung cấp
export async function getAllNhaCungCap() {
  const res = await fetch(`${API_BASE}/nhacungcap`);
  return await res.json();
}

export async function getNhaCungCapById(id) {
  const res = await fetch(`${API_BASE}/nhacungcap/${id}`);
  return await res.json();
}

export async function createNhaCungCap(nccData) {
  const res = await fetch(`${API_BASE}/nhacungcap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nccData),
  });
  return await res.json();
}

// Tồn kho
export async function getAllTonKho() {
  const res = await fetch(`${API_BASE}/tonkho`);
  return await res.json();
}

export async function getTonKhoBySanPhamId(id) {
  const res = await fetch(`${API_BASE}/tonkho/${id}`);
  return await res.json();
}

// Cập nhật sản phẩm (giá + tồn kho)
export async function updateSanPham(id, data) {
  const res = await fetch(`${API_BASE}/sanpham/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}
