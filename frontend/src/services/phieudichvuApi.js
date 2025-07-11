const API_BASE = "http://localhost:5000/api";

// Hàm lấy header chứa token xác thực
export function getAuthHeader(extraHeaders = {}) {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

// Hàm xử lý response, trả kèm status
const handleResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    let message = "Có lỗi xảy ra";

    if (res.status === 403) {
      message = "Bạn không có quyền thực hiện chức năng này";
    } else if (res.status === 401) {
      message = "Vui lòng đăng nhập";
    } else if (data?.error) {
      message = data.error;
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
};


// Lấy danh sách tất cả phiếu dịch vụ
export async function getPhieuDichVuList() {
  const res = await fetch(`${API_BASE}/phieudichvu`, {
    headers: getAuthHeader(),
  });
  return await handleResponse(res);
}

// Lấy chi tiết phiếu dịch vụ theo ID
export async function getPhieuDichVuById(id) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`, {
    headers: getAuthHeader(),
  });
  return await handleResponse(res);
}

// Thêm phiếu dịch vụ mới
export async function themPhieuDichVu(data) {
  const res = await fetch(`${API_BASE}/phieudichvu`, {
    method: "POST",
    headers: getAuthHeader({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
}

// Cập nhật phiếu dịch vụ
export async function capNhatPhieuDichVu(id, data) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`, {
    method: "PUT",
    headers: getAuthHeader({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
}

// Xoá phiếu dịch vụ
export async function xoaPhieuDichVu(id) {
  const res = await fetch(`${API_BASE}/phieudichvu/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return await handleResponse(res);
}

// In toàn bộ danh sách phiếu dịch vụ (PDF blob)
export async function printDanhSachPhieuDichVu() {
  const res = await fetch(`${API_BASE}/phieudichvu/print-danhsach`, {
    method: "GET",
    headers: getAuthHeader(),
  });

  if (!res.ok) throw new Error("Không thể lấy PDF danh sách phiếu dịch vụ");
  return await res.blob();
}

// In chi tiết phiếu dịch vụ theo mã (Mở tab mới, không cần fetch)
export function printChiTietPhieuDichVu(maPDV) {
  const token = localStorage.getItem("token");
  const url = `${API_BASE}/phieudichvu/${maPDV}/print?token=${encodeURIComponent(token)}`;
  window.open(url, "_blank");
}

// Tìm kiếm phiếu dịch vụ
export async function searchPhieuDichVu(keyword) {
  const res = await fetch(`${API_BASE}/phieudichvu/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: getAuthHeader(),
  });
  return await handleResponse(res);
}