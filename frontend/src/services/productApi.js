const BASE_URL = "http://localhost:5000/api/product";

export const getAllProducts = async () => {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách sản phẩm");
  return res.json();
};

export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Sản phẩm không tồn tại");
  return res.json();
};

export const addProduct = async (productData) => {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Lỗi khi thêm sản phẩm");
  return res.json();
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error("Lỗi khi cập nhật sản phẩm");
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Lỗi khi xóa sản phẩm");
  return res.json();
};

export const getProductsByCategory = async (maDM) => {
  const res = await fetch(`${BASE_URL}/danhmuc/${maDM}`);
  if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm theo danh mục");
  return res.json();
};

export const updateAllProductPrices = async () => {
  const res = await fetch(`${BASE_URL}/capnhat_giaban`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${yourAccessToken}` // Bỏ comment nếu bạn bật JWT
    },
  });
  
  if (!res.ok) throw new Error("Lỗi khi cập nhật giá bán toàn bộ sản phẩm");
  return res.json();
};
