// const API_BASE = "http://localhost:5000/api/parameter";

// const handleResponse = async (res) => {
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || "Có lỗi xảy ra");
//   return data;
// };

// export async function fetchPhuThuByTen(tenThamSo) {
//   const res = await fetch(`${API_BASE}/thamso/${tenThamSo}`);
//   if (!res.ok) {
//     // bạn có thể ném lỗi hoặc trả về giá trị mặc định
//     throw new Error(`Không tìm thấy tham số ${tenThamSo}`);
//   }
//   return res.json();
// }

// const parameterApi = {
//   // Lấy tất cả tham số
//   getAll: async () => {
//     const res = await fetch(API_BASE);
//     return handleResponse(res);
//   },

//   // Lấy tham số theo tên
//   getByName: async (ten) => {
//     const res = await fetch(`${API_BASE}/thamso/${ten}`);
//     return handleResponse(res);
//   },

//   // Cập nhật tham số
//   update: async (ten, data) => {
//     const res = await fetch(`${API_BASE}/thamso/${ten}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     return handleResponse(res);
//   },
// };

// export default parameterApi;

const API_BASE = "http://localhost:5000/api/parameter";

// Xử lý phản hồi từ server
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || data.message || "Có lỗi xảy ra");
    error.status = res.status;
    throw error;
  }
  return data;
};

// Hàm lấy header có token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export async function fetchPhuThuByTen(tenThamSo) {
  const res = await fetch(`${API_BASE}/thamso/${tenThamSo}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

const parameterApi = {
  // Lấy tất cả tham số
  getAll: async () => {
    const res = await fetch(`${API_BASE}/all`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Lấy tham số theo tên
  getByName: async (ten) => {
    const res = await fetch(`${API_BASE}/thamso/${ten}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(res);
  },

  // Cập nhật tham số
  update: async (ten, data) => {
    const res = await fetch(`${API_BASE}/thamso/${ten}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};

export default parameterApi;
