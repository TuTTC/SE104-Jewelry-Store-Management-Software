const BASE_URL = "http://localhost:5000/api/suppliers"; // Điều chỉnh nếu port khác

// Hàm tiện ích lấy header Authorization
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// Hàm tiện ích xử lý response có ném thêm status
const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type");
  
  let data = {};
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    const error = new Error("Server trả về dữ liệu không hợp lệ:\n" + text);
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
      const error = new Error(data.message || "Có lỗi xảy ra");
      error.status = res.status;
      throw error;
  }



  return data;
};

// Lấy tất cả nhà cung cấp
export const getAllSuppliers = async () => {
  const res = await fetch(`${BASE_URL}/`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};

// Thêm nhà cung cấp
export const addSupplier = async (data) => {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Sửa nhà cung cấp
export const updateSupplier = async (maNCC, data) => {
  const res = await fetch(`${BASE_URL}/${maNCC}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Xóa nhà cung cấp
export const deleteSupplier = async (maNCC) => {
  const res = await fetch(`${BASE_URL}/${maNCC}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};
