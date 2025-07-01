import React, { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import {
  danhSachDichVu,
  themDichVu,
  suaDichVu,
  xoaDichVu,
  traCuuDichVu
} from "../services/dichvuAPI"; // đường dẫn cần chỉnh nếu sai

const mapTenDVHienThi = (ma) => {
  const mapping = {
    CanThuVang: "Cân thử vàng",
    ThayDaQuy: "Thay đá quý",
    DanhBongVang: "Đánh bóng vàng",
    ChamKhacTheoYeuCau: "Khắc theo yêu cầu",
    GiaCongNuTrang: "Gia công nữ trang",
    // thêm nếu còn các mã khác
  };
  return mapping[ma] || ma;  // nếu không có thì trả lại chính mã
};

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchDichVu();
  }, []);

    const fetchDichVu = async () => {
    const res = await danhSachDichVu();
    console.log("📦 Dịch vụ nhận từ API:", res);
    if (res.status === "success") {
        console.log("✅ Dữ liệu hiển thị:", res.data);
        console.log("🧪 Mẫu dữ liệu 1:", res.data[0]);
        setServices(res.data);
    } else {
        alert("Lỗi khi lấy danh sách dịch vụ");
    }
    };

  const openModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  const handleSubmit = async (data) => {
    const payload = {
      TenDV: data.name,
      DonGia: parseFloat(data.price),
      MoTa: data.description,
      TrangThai: data.status === "true" || data.status === true,
    };

    if (modalMode === "add") {
      const res = await themDichVu(payload);
      if (res.status === "success") {
        fetchDichVu();
        closeModal();
      } else alert("Lỗi thêm dịch vụ: " + res.message);
    } else if (modalMode === "edit" && selectedService) {
      const res = await suaDichVu(selectedService.MaDV, payload);
      if (res.status === "success") {
        fetchDichVu();
        closeModal();
      } else alert("Lỗi cập nhật dịch vụ: " + res.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịch vụ này?")) {
      const res = await xoaDichVu(id);
      if (res.status === "success") fetchDichVu();
      else alert("Lỗi xoá dịch vụ: " + res.message);
    }
  };
  
  const handleSearchService = async () => {
    const keyword = prompt("Nhập từ khóa để tra cứu dịch vụ:");
    if (keyword) {
        const res = await traCuuDichVu(keyword);
        if (res.status === "success") {
        setServices(res.data);
        } else {
        alert("Không tìm thấy dịch vụ.");
        }
    }
    };
    const handleReloadServices = async () => {
        fetchDichVu(); // Hoặc gọi lại danhSachDichVu nếu muốn
    };
    const handlePrintServicePDF = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/dichvu/pdf", {
        method: "GET",
        });

        if (!res.ok) throw new Error("Lỗi khi lấy PDF");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url); // hoặc dùng để tải về: window.location.href = url;
    } catch (err) {
        alert("Lỗi khi in phiếu dịch vụ: " + err.message);
    }
    };
  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý dịch vụ</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm dịch vụ
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
                <tr><td colSpan={6}>Không có dịch vụ nào.</td></tr>
            ) : (
            services.map((s) => (
              <tr key={s.MaDV}>
                <td>{s.MaDV}</td>
                <td>{mapTenDVHienThi(s.TenDV)}</td>
                <td>{Number(s.DonGia || 0).toLocaleString()}₫</td>
                <td>{s.MoTa}</td>
                <td>
                  <span className={s.TrangThai ? "status-instock" : "status-inactive"}>
                    {s.TrangThai ? "Kích hoạt" : "Không hoạt động"}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal("edit", s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.MaDV)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        <div className="service-actions">
        <button onClick={handleSearchService} className="action-button">
            Tra cứu dịch vụ
        </button>
         <button onClick={handleReloadServices} className="action-button">
            Reload danh sách
        </button>
        <button onClick={handlePrintServicePDF} className="action-button">
            In phiếu dịch vụ
        </button>
        </div>
      </div>
    
      {modalVisible && (
        <GeneralModalForm
          section="services"
          mode={modalMode}
          initialData={selectedService}
          onClose={closeModal}
          onSubmit={handleSubmit}
          showModal={modalVisible}
        />
      )}
    </div>
  );
}

export default ServiceManager;
