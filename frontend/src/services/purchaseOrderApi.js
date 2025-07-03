const BASE_URL = "http://localhost:5000/api/phieunhap"; // Đặt đúng route backend của bạn

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || "Có lỗi xảy ra");
      error.status = res.status;
      throw error;
    }
    return data;
  } else {
    // Trường hợp khác, có thể trả file hay text
    if (!res.ok) {
      throw new Error("Có lỗi xảy ra");
    }
    return res;
  }
};

// Lấy tất cả phiếu nhập
export const getAllOrders = async () => {
  const res = await fetch(BASE_URL, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};

// Lấy phiếu nhập theo ID
export const getOrderById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};

// Thêm mới phiếu nhập
export const addOrder = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Cập nhật phiếu nhập
export const updateOrder = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// Xoá phiếu nhập
export const deleteOrder = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
};

// Xuất file PDF (mở tab mới)
export const exportOrderPDF = (id) => {
  const token = localStorage.getItem("token");
  const headers = token ? `?token=${token}` : "";
  const url = `${BASE_URL}/${id}/export${headers}`;
  window.open(url, "_blank");
};
