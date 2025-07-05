// const API_URL = "http://localhost:5000/api/baocao";

// // Hàm lấy header gồm Content-Type và Authorization nếu có token
// const getAuthHeader = () => {
//   const token = localStorage.getItem("token");
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// // Hàm xử lý response, trả về data hoặc ném lỗi kèm status
// const handleResponse = async (res) => {
//   const data = await res.json();
//   if (!res.ok) {
//     const error = new Error(data.error || "Có lỗi xảy ra");
//     error.status = res.status;
//     throw error;
//   }
//   return data;
// };

// // Thêm báo cáo mới
// export async function themBaoCao(baoCao) {
//   const res = await fetch(API_URL, {
//     method: "POST",
//     headers: getAuthHeader(),
//     body: JSON.stringify(baoCao),
//   });
//   return handleResponse(res);
// }

// // Cập nhật báo cáo
// export async function suaBaoCao(id, baoCao) {
//   const res = await fetch(`${API_URL}/${id}`, {
//     method: "PUT",
//     headers: getAuthHeader(),
//     body: JSON.stringify(baoCao),
//   });
//   return handleResponse(res);
// }

// // Xóa báo cáo
// export async function xoaBaoCao(id) {
//   const res = await fetch(`${API_URL}/${id}`, {
//     method: "DELETE",
//     headers: getAuthHeader(),
//   });
//   return handleResponse(res);
// }

// // Lấy danh sách toàn bộ báo cáo
// export async function layDanhSachBaoCao() {
//   const res = await fetch(API_URL, {
//     headers: getAuthHeader(),
//   });
//   return handleResponse(res);
// }

// // In báo cáo PDF (trả về Blob)
// export async function inBaoCaoPDF(id) {
//   const token = localStorage.getItem("token");
//   const headers = token
//     ? { Authorization: `Bearer ${token}` }
//     : {};

//   const res = await fetch(`${API_URL}/${id}/print`, {
//     headers,
//   });

//   if (!res.ok) {
//     throw new Error(`HTTP ${res.status}`);
//   }
//   return res.blob();
// }

const API_URL = "http://localhost:5000/api/baocao";

// Thêm báo cáo mới
export async function themBaoCao(baoCao) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(baoCao),
  });
  return await res.json();
}

// Cập nhật báo cáo
export async function suaBaoCao(id, baoCao) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(baoCao),
  });
  return await res.json();
}

// Xóa báo cáo
export async function xoaBaoCao(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
  return await res.json();
}

// Lấy danh sách toàn bộ báo cáo
export async function layDanhSachBaoCao() {
  const res = await fetch(API_URL);
  return await res.json();
}

// Corrected: accept an ID
export async function inBaoCaoPDF(id) {
  const res = await fetch(`${API_URL}/${id}/print`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}
