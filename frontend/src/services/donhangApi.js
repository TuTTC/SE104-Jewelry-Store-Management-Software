const API_URL = "http://localhost:5000/api/donhang";

// Hàm lấy header Authorization (ví dụ lấy token từ localStorage)
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

const handleResponse = async (res) => {
  // Trường hợp trả về blob (file PDF) thì không parse JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.error || "Có lỗi xảy ra");
      error.status = res.status;
      throw error;
    }
    return data;
  } else if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) {
    if (!res.ok) {
      throw new Error("Không thể tải file");
    }
    return res.blob();
  } else {
    // Các loại khác, trả về raw text
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || "Có lỗi xảy ra");
    }
    return text;
  }
};

// Tạo đơn hàng mới
export async function taoDonHang(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Lấy danh sách đơn hàng
export async function danhSachDonHang() {
  const res = await fetch(API_URL, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xóa đơn hàng
export async function xoaDonHang(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xác nhận thanh toán
export async function xacNhanThanhToan(id) {
  const res = await fetch(`${API_URL}/${id}/thanhtoan`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Đóng gói & giao hàng
export async function dongGoiGiaoHang(id) {
  const res = await fetch(`${API_URL}/${id}/giaohang`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Cập nhật trạng thái đơn hàng
export async function capNhatTrangThaiDonHang(id, trangThai) {
  const res = await fetch(`${API_URL}/${id}/trangthai`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify({ TrangThai: trangThai }),
  });
  return handleResponse(res);
}

// Gửi yêu cầu trả/đổi hàng
export async function xuLyTraDoi(id) {
  const res = await fetch(`${API_URL}/${id}/doitra`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// In danh sách đơn hàng (file PDF)
export async function inDanhSachDonHang() {
  const res = await fetch(`${API_URL}/print`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Sửa thông tin đơn hàng
export async function suaDonHang(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// Cập nhật chi tiết đơn hàng
export async function capNhatChiTietDonHang(id, items) {
  const res = await fetch(`${API_URL}/${id}/chitiet`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(items),
  });
  return handleResponse(res);
}

// Lấy chi tiết đơn hàng
export async function getChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Xuất chi tiết đơn hàng ra PDF
export async function inChiTietDonHang(id) {
  const res = await fetch(`${API_URL}/${id}/chitiet/pdf`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// const API_URL = "http://localhost:5000/api/donhang";

// // Tạo đơn hàng mới
// export async function taoDonHang(data) {
//   const res = await fetch(API_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });
//   return await res.json();
// }


// // Lấy danh sách đơn hàng
// export async function danhSachDonHang() {
//   const res = await fetch(API_URL);
//   return await res.json();
// }

// // Xóa đơn hàng
// export async function xoaDonHang(id) {
//   const res = await fetch(`${API_URL}/${id}`, {
//     method: "DELETE",
//   });
//   return await res.json();
// }

// // Xác nhận thanh toán
// export async function xacNhanThanhToan(id) {
//   const res = await fetch(`${API_URL}/${id}/thanhtoan`, {
//     method: "POST",
//   });
//   return await res.json();
// }

// // Đóng gói & giao hàng
// export async function dongGoiGiaoHang(id) {
//   const res = await fetch(`${API_URL}/${id}/giaohang`, {
//     method: "POST",
//   });
//   return await res.json();
// }

// // Cập nhật trạng thái đơn hàng
// export async function capNhatTrangThaiDonHang(id, trangThai) {
//   const res = await fetch(`${API_URL}/${id}/trangthai`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ TrangThai: trangThai }),
//   });
//   return await res.json();
// }

// // Gửi yêu cầu trả/đổi hàng
// export async function xuLyTraDoi(id) {
//   const res = await fetch(`${API_URL}/${id}/doitra`, {
//     method: "POST",
//   });
//   return await res.json();
// }

// // In đơn hàng (trả về PDF)
// export async function inDanhSachDonHang() {
//   const res = await fetch(`${API_URL}/print`);
//   return await res.blob(); // nếu trả về file PDF
// }

// // Sửa thông tin đơn hàng
// // Lưu ý: Hàm này có thể được sử dụng để cập nhật thông tin đơn
// export async function suaDonHang(id, payload) {
//   try {
//     const res = await fetch(`${API_URL}/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     return await res.json();
//   } catch (err) {
//     return { status: "error", message: err.message };
//   }
// }

// // Cập nhật chi tiết đơn hàng
// export async function capNhatChiTietDonHang(id, items) {
//   try {
//   const res = await fetch(`${API_URL}/${id}/chitiet`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(items),
//   });
//   return res.json();
//   } catch (err) {
//     return { status: "error", message: err.message };
//   }
// }
// export async function getChiTietDonHang(id) {
//   const res = await fetch(`${API_URL}/${id}/chitiet`);
//   return res.json();
// }


// /** Xuất chi tiết đơn hàng ra PDF */
// export async function inChiTietDonHang(id) {
//   const res = await fetch(`${API_URL}/${id}/chitiet/pdf`);

//   if (!res.ok) {
//     const errorText = await res.text(); // đọc nội dung trả về nếu lỗi
//     throw new Error(errorText || "Không thể tạo PDF");
//   }

//   const blob = await res.blob();

//   // Kiểm tra chắc chắn blob là file PDF
//   if (blob.type !== "application/pdf") {
//     throw new Error("Dữ liệu trả về không phải file PDF hợp lệ.");
//   }

//   return blob;
// }
