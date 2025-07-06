const API_URL = "http://localhost:5000/api/sanpham";

// Lấy sanpham theo ID
export async function getSanPhamById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm");
    return await res.json();
  } catch (error) {
    throw new Error(`Lỗi khi lấy sản phẩm: ${error.message}`);
  }
}
