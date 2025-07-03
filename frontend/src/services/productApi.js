const BASE_URL = "http://localhost:5000/api/product";

// Hàm lấy header chuẩn có Authorization nếu có token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Hàm xử lý response chung
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || "Có lỗi xảy ra");
    error.status = res.status;
    throw error;
  }
  return data;
};
export const getAllProducts = async () => {
  const res = await fetch(`${BASE_URL}/`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};

export const getProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res, "Sản phẩm không tồn tại");
};

export const addProduct = async (productData) => {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(productData),
  });
  return handleResponse(res, "Lỗi khi thêm sản phẩm");
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(productData),
  });
  return handleResponse(res, "Lỗi khi cập nhật sản phẩm");
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse(res, "Lỗi khi xóa sản phẩm");
};

export const getProductsByCategory = async (maDM) => {
  const res = await fetch(`${BASE_URL}/danhmuc/${maDM}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res, "Lỗi khi lấy sản phẩm theo danh mục");
};

export const updateAllProductPrices = async () => {
  const res = await fetch(`${BASE_URL}/capnhat_giaban`, {
    method: "PUT",
    headers: getAuthHeader(),
  });
  return handleResponse(res, "Lỗi khi cập nhật giá bán toàn bộ sản phẩm");
};
