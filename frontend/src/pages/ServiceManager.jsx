import React, { useEffect, useState } from "react";
import { Edit, Trash, Eye, Printer } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm-2.jsx";
import PhieuDichVuForm from "./PhieuDichVuForm";
import {
  danhSachDichVu,
  themDichVu,
  suaDichVu,
  xoaDichVu,
  traCuuDichVu
} from "../services/dichvuApi";
import Pagination from '../components/Pagination';

const mapTenDVHienThi = (ma) => {
  const mapping = {
    CanThuVang: "Cân thử vàng",
    ThayDaQuy: "Thay đá quý",
    DanhBongVang: "Đánh bóng vàng",
    ChamKhacTheoYeuCau: "Khắc theo yêu cầu",
    GiaCongNuTrang: "Gia công nữ trang",
    GiaCongNhan: "Gia công nhẫn",
    GanDaKimCuong: "Gắn đá kim cương",
    ThuVang: "Thử vàng",
    SuaNuTrang: "Sửa nữ trang",
    ThayMoiNuTrang: "Thay mới nữ trang",
    // thêm nếu còn các mã khác
  };
  return mapping[ma] || ma;  // nếu không có thì trả lại chính mã
};

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTab, setSelectedTab] = useState("list-dichvu");
  const [phieuDichVuList, setPhieuDichVuList] = useState([]);
  const [modalPhieuVisible, setModalPhieuVisible] = useState(false);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [modePhieu, setModePhieu] = useState("add");

  useEffect(() => {
    fetchDichVu();
    fetchPhieuDichVu();
  }, []);

    const fetchDichVu = async () => {
    const res = await danhSachDichVu();
    console.log("Dịch vụ nhận từ API:", res);
    if (res.status === "success") {
        console.log("Dữ liệu hiển thị:", res.data);
        console.log("Mẫu dữ liệu 1:", res.data[0]);
        setServices(res.data);
    } else {
        alert("Lỗi khi lấy danh sách dịch vụ");
    }
    };

    const fetchPhieuDichVu = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/phieudichvu");
      const json = await res.json();
      if (json.status === "success") {
        setPhieuDichVuList(json.data);
      } else {
        alert("Lỗi khi lấy danh sách phiếu dịch vụ");
      }
    } catch (err) {
      alert("Lỗi kết nối khi lấy phiếu dịch vụ: " + err.message);
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

  const handleFormSubmit = async (data) => {
    console.log("Giá trị trạng thái:", data.status, typeof data.status);
    const payload = {
      TenDV: data.name,
      DonGia: parseFloat(data.price),
      MoTa: data.description,
      TrangThai: data.status === true,
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

  const handleFormSubmitPhieuDichVu = async ({ maKH, ghiChu, rows }) => {
  console.log("Lưu phiếu dịch vụ với:", { maKH, ghiChu, rows });
  // TODO: Gọi API lưu vào backend tại đây
};

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịch vụ này?")) {
      const res = await xoaDichVu(id);
      if (res.status === "success") fetchDichVu();
      else alert("Lỗi xoá dịch vụ: " + res.message);
    }
  };
  
  const handleXoaPhieu = async (maPDV) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu dịch vụ này?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/phieudichvu/${maPDV}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.status === "success") {
          setPhieuDichVuList((prev) => prev.filter((p) => p.MaPDV !== maPDV));
        } else {
          alert("Lỗi xoá phiếu dịch vụ: " + json.message);
        }
      } catch (err) {
        alert("Lỗi kết nối: " + err.message);
      }
    }
  };

  const handleThemPhieuDichVu = () => {
    setSelectedPhieu(null);
    setModePhieu("add");
    setModalPhieuVisible(true);
  };

  const handleXemChiTiet = async (maPDV) => {
  try {
    const res = await fetch(`http://localhost:5000/api/phieudichvu/${maPDV}`);
    const json = await res.json();

    if (json.status === "success") {
      setSelectedPhieu(json.data);
      setModePhieu("view");
      setModalPhieuVisible(true);
    } else {
      alert("Không tìm thấy chi tiết phiếu dịch vụ #" + maPDV);
    }
  } catch (err) {
    alert("Lỗi khi lấy chi tiết phiếu dịch vụ: " + err.message);
  }
  };

  

const handleLuuPhieuDichVu = async (payload) => {
  try {
    console.log("Payload gửi API:", payload);  // giữ log kiểm tra
    const res = await fetch("http://localhost:5000/api/phieudichvu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.status === "success") {
      alert("Lưu phiếu thành công");
      setModalPhieuVisible(false);
      fetchPhieuDichVu();
    } else {
      alert("Lỗi khi lưu phiếu: " + json.message);
    }
  } catch (err) {
    alert("Kết nối thất bại: " + err.message);
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


  const handleInChiTiet = (maPDV) => {
  const printUrl = `http://localhost:5000/api/phieudichvu/${maPDV}/print`;
  window.open(printUrl, "_blank");
  };
  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm dịch vụ
        </button>
      </div>

    <div className="tabs">
      {[
        { key: "list-dichvu", label: "Danh sách dịch vụ hiện có" },
        { key: "list-phieudichvu", label: "Danh sách các phiếu dịch vụ" },
      ].map((tab) => (
        <button
          key={tab.key}
          className={selectedTab === tab.key ? "tab active" : "tab"}
          onClick={() => setSelectedTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
    { selectedTab === "list-dichvu" && (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Giá dịch vụ</th>
              <th>Giá thực tế</th>
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
                  {/* Hiển thị giá thực đã bao gồm phụ thu */}
                  <td>{Number(s.DonGiaThuc ?? s.DonGia).toLocaleString()}₫</td>   
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
              ))
            )}
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
    )}
    {selectedTab === "list-phieudichvu" && (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Mã KH</th>
              <th>Ngày lập</th>
              <th>Tổng tiền</th>
              <th>Trả trước</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {phieuDichVuList.length === 0 ? (
              <tr><td colSpan="8">Không có phiếu dịch vụ nào.</td></tr>
            ) : (
              phieuDichVuList.map((p) => (
                <tr key={p.MaPDV}>
                  <td>{p.MaPDV}</td>
                  <td>{p.MaKH}</td>
                  <td>{p.NgayLap}</td>
                  <td>{Number(p.TongTien).toLocaleString()}₫</td>
                  <td>{Number(p.TraTruoc).toLocaleString()}₫</td>
                  <td>{p.GhiChu}</td>
                  <td>{p.TrangThai}</td>
                  <td>
                    <button onClick={() => handleXemChiTiet(p.MaPDV)} className="action-icon view">
                      <Eye className="icon" />
                    </button>
                    <button onClick={() => handleXoaPhieu(p.MaPDV)} className="action-icon delete">
                      <Trash className="icon" />
                    </button>
                    <button onClick={() => handleInChiTiet(p.MaPDV)} className="action-icon print">
                      <Printer className="icon" />
                     </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="service-actions">
        <button onClick={handleThemPhieuDichVu} className="action-button">
          Thêm phiếu dịch vụ
          </button>
        </div>
        <Pagination />
      </div>
    )}

      {modalVisible && (
        <GeneralModalForm
          section="services"
          mode={modalMode}
          initialData={selectedService}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          showModal={modalVisible}
        />
      )}
      <PhieuDichVuForm
        visible={modalPhieuVisible}
        onClose={() => setModalPhieuVisible(false)}
        onSave={handleLuuPhieuDichVu}
        initialData={selectedPhieu}
        mode={modePhieu}
      />
    </div>
  );
}

export default ServiceManager;