// src/api/productApi.js
const BASE_URL = "http://localhost:5000/api/products"; // Cập nhật URL nếu cần

// Lấy danh sách tất cả sản phẩm (nếu có)
export const fetchAllProducts = async () => {
  const response = await fetch(`${BASE_URL}`);
  if (!response.ok) {
    throw new Error("Không thể lấy danh sách sản phẩm");
  }
  return await response.json();
};

// Lấy thông tin chi tiết 1 sản phẩm
export const fetchProductById = async (productId) => {
  const response = await fetch(`${BASE_URL}/${productId}`);
  if (!response.ok) {
    throw new Error("Không thể lấy thông tin sản phẩm");
  }
  return await response.json();
};

// Thêm mới sản phẩm
export const addProduct = async (productData) => {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Lỗi khi thêm sản phẩm");
  }

  return await response.json();
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  const response = await fetch(`${BASE_URL}/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Lỗi khi cập nhật sản phẩm");
  }

  return await response.json();
};

// Xóa sản phẩm
export const deleteProduct = async (productId) => {
  const response = await fetch(`${BASE_URL}/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Lỗi khi xóa sản phẩm");
  }

  return await response.json();
};
