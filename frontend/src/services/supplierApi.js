const BASE_URL = "http://localhost:5000/api/suppliers"; // Điều chỉnh nếu port khác

// Hàm tiện ích xử lý response
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  let data = {};
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error("Server trả về HTML hoặc dữ liệu không hợp lệ:\n" + text);
  }

  if (!response.ok) {
    throw new Error(data.error || "Có lỗi xảy ra");
  }

  return data;
};


// Lấy tất cả nhà cung cấp
export const getAllSuppliers = async () => {
  const response = await fetch(`${BASE_URL}/`);
  return handleResponse(response);
};

// Thêm nhà cung cấp
export const addSupplier = async (data) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Sửa nhà cung cấp
export const updateSupplier = async (maNCC, data) => {
  const response = await fetch(`${BASE_URL}/${maNCC}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Xóa nhà cung cấp
export const deleteSupplier = async (maNCC) => {
  const response = await fetch(`${BASE_URL}/${maNCC}`, {
    method: "DELETE",
  });
  return handleResponse(response);
};
