import React, { useEffect, useState } from "react";
import { Edit, Trash, Printer, Filter, ArrowUpDown, Eye } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm-2.jsx";
import PhieuDichVuForm from "./PhieuDichVuForm";
import {
  danhSachDichVu,
  themDichVu,
  suaDichVu,
  xoaDichVu
} from "../services/dichvuApi";

import { 
  getPhieuDichVuList, 
  getPhieuDichVuById,
  themPhieuDichVu,
  xoaPhieuDichVu,
  capNhatPhieuDichVu,
  printDanhSachPhieuDichVu,
  printChiTietPhieuDichVu,
  searchPhieuDichVu
  } from "../services/phieudichvuApi";
import userApi from "../services/userApi";
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
  };
  return mapping[ma] || ma;
};

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [phieuDichVuList, setPhieuDichVuList] = useState([]);
  const [dataServices, setDataServices] = useState([]);
  const [dataPhieuDichVu, setDataPhieuDichVu] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showServiceStatusFilter, setShowServiceStatusFilter] = useState(false); // Filter for service status
  const [selectedServiceStatus, setSelectedServiceStatus] = useState(""); // Selected service status
  const [showPhieuStatusFilter, setShowPhieuStatusFilter] = useState(false); // Filter for phieu status
  const [selectedPhieuStatus, setSelectedPhieuStatus] = useState(""); // Selected phieu status
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTab, setSelectedTab] = useState("list-dichvu");
  const [modalPhieuVisible, setModalPhieuVisible] = useState(false);
  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [modePhieu, setModePhieu] = useState("add");
  const [role, setRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Thêm state cho phân trang
  const itemsPerPage = 10; // Số mục mỗi trang
  useEffect(() => {
    fetchDichVu();
    fetchPhieuDichVu();
  }, []);

  useEffect(() => {
    let filteredServices = services;
    if (selectedServiceStatus) {
      filteredServices = services.filter((s) => 
        (s.TrangThai ? "Kích hoạt" : "Không hoạt động") === selectedServiceStatus
      );
    }
    setDataServices(filteredServices);

    let filteredPhieu = phieuDichVuList;
    if (selectedPhieuStatus) {
      filteredPhieu = phieuDichVuList.filter((p) => p.TrangThai === selectedPhieuStatus);
    }
    setDataPhieuDichVu(filteredPhieu);
    setCurrentPage(1); // Đặt lại trang khi bộ lọc thay đổi
  }, [services, phieuDichVuList, selectedServiceStatus, selectedPhieuStatus]);

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
      const json = await getPhieuDichVuList();
      console.log("Dữ liệu phiếu:", json);
      if (json.status === "success") {
        setPhieuDichVuList(json.data);
      } else {
        alert("Lỗi khi lấy danh sách phiếu dịch vụ: " + (json.message || "Không rõ"));
      }
    } catch (err) {
      alert("Lỗi kết nối khi lấy phiếu dịch vụ: " + err.message);
    }
  };
  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const currentUser = await userApi.getCurrentUser();
      setRole(currentUser?.VaiTro || "");
    } catch (err) {
      console.error("Lỗi lấy người dùng hiện tại:", err);
    }
  };

  fetchCurrentUser();
}, []);

    
  const sortData = (key, isServiceTab = true) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortArray = (data) => {
      return [...data].sort((a, b) => {
        if (a[key] === null || a[key] === undefined) return 1;
        if (b[key] === null || b[key] === undefined) return -1;
        if (a[key] === null && b[key] === null) return 0;

        if (key === "NgayLap") {
          const dateA = new Date(a[key]).getTime();
          const dateB = new Date(b[key]).getTime();
          return direction === "asc" ? dateA - dateB : dateB - dateA;
        } else if (typeof a[key] === "string") {
          const valueA = a[key].toLowerCase();
          const valueB = b[key].toLowerCase();
          return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else {
          return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
        }
      });
    };

    if (isServiceTab) {
      setDataServices(sortArray(dataServices));
    } else {
      setDataPhieuDichVu(sortArray(dataPhieuDichVu));
    }
  };

  const handleServiceStatusFilterChange = (e) => {
    const value = e.target.value;
    setSelectedServiceStatus(value);
    if (value === "") {
      setDataServices(services);
    } else {
      const filteredData = services.filter((s) => 
        (s.TrangThai ? "Kích hoạt" : "Không hoạt động") === value
      );
      setDataServices(filteredData);
    }
  };

  const handlePhieuStatusFilterChange = (e) => {
    const value = e.target.value;
    setSelectedPhieuStatus(value);
    if (value === "") {
      setDataPhieuDichVu(phieuDichVuList);
    } else {
      const filteredData = phieuDichVuList.filter((p) => p.TrangThai === value);
      setDataPhieuDichVu(filteredData);
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

  const handleServiceSave = async (formDataFromModal) => {
    console.log("Giá trị trạng thái:", formDataFromModal.status, typeof formDataFromModal.status);
    const payload = {
      TenDV: formDataFromModal.name,
      DonGia: parseFloat(formDataFromModal.price),
      MoTa: formDataFromModal.description,
      TrangThai: formDataFromModal.status === "true",
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
      if (res.status === "success") {
        fetchDichVu();
      } else alert("Lỗi xoá dịch vụ: " + res.message);
    }
  };

const handleXoaPhieu = async (maPDV) => {
  if (window.confirm("Bạn có chắc chắn muốn xóa phiếu dịch vụ này?")) {
    try {
      const json = await xoaPhieuDichVu(maPDV);

      if (json.status === "success") {
        // Cập nhật lại danh sách phiếu dịch vụ sau khi xoá
        setPhieuDichVuList((prev) => prev.filter((p) => p.MaPDV !== maPDV));
        setDataPhieuDichVu((prev) => prev.filter((p) => p.MaPDV !== maPDV));
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

const handleXemPhieuDichVu = async (maPDV) => {
  try {
    const json = await getPhieuDichVuById(maPDV);

    if (json.status === "success") {
      setSelectedPhieu(json.data);
      setModePhieu("view"); // chuyển sang chế độ xem
      setModalPhieuVisible(true);
    } else {
      alert("Không tìm thấy phiếu dịch vụ #" + maPDV);
    }
  } catch (err) {
    alert("Lỗi khi tải phiếu dịch vụ: " + err.message);
  }
};


const handleSuaPhieuDichVu = async (maPDV) => {
  try {
    const json = await getPhieuDichVuById(maPDV);

    if (json.status === "success") {
      setSelectedPhieu(json.data);
      setModePhieu("edit");
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
      console.log("Payload gửi API:", payload);

      let json;
      if (modePhieu === "add") {
        json = await themPhieuDichVu(payload);
      } else if (modePhieu === "edit" && selectedPhieu) {
        json = await capNhatPhieuDichVu(selectedPhieu.MaPDV, payload);
      }

      if (json?.status === "success") {
        alert(modePhieu === "add" ? "Lưu phiếu thành công" : "Cập nhật phiếu thành công");
        setModalPhieuVisible(false);
        fetchPhieuDichVu();
      } else {
        alert("Lỗi khi lưu phiếu: " + (json?.message || "Không rõ"));
      }
    } catch (err) {
      alert("Kết nối thất bại: " + err.message);
    }
  };

   const handleSearchServiceForm = async () => {
    const keyword = prompt("Nhập từ khóa để tra cứu dịch vụ:");
    if (keyword) {
      const res = await searchPhieuDichVu(keyword);
      if (res.status === "success") {
        setPhieuDichVuList(res.data);
        setDataPhieuDichVu(res.data);
      } else {
        alert("Không tìm thấy dịch vụ.");
      }
    }
  };

  const handlePrintAllPDF = async () => {
    try {
      const blob = await printDanhSachPhieuDichVu();
      const url = window.URL.createObjectURL(blob);
      window.open(url); // Mở tab xem PDF
    } catch (err) {
      alert("Lỗi khi in danh sách: " + err.message);
    }
  };

  const handleInChiTiet = (maPDV) => {
    printChiTietPhieuDichVu(maPDV); // Mở tab chi tiết
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        {selectedTab === "list-dichvu" && ["Admin", "Nhân viên"].includes(role) && (
          <button onClick={() => openModal("add")} className="action-button">
            Thêm dịch vụ
          </button>
        )}
          {selectedTab === "list-phieudichvu" && (
        <div>
          {role !== "Khách hàng" && (
            <>
              <button onClick={handleThemPhieuDichVu} className="action-button">
                Thêm phiếu dịch vụ
              </button>
              <button onClick={handlePrintAllPDF} className="action-button">
                Xuất danh sách phiếu dịch vụ
              </button>
              <button onClick={handleSearchServiceForm} className="action-button">
            Tra cứu phiếu dịch vụ
          </button>
            </>
          )}

          
        </div>
      )}


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

 {selectedTab === "list-dichvu" && (
  
  <div className="table-container">
    
    
    <table className="data-table">
      <thead>
        <tr>
          <th onClick={() => sortData("MaDV")}>ID <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("TenDV")}>Tên <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("DonGia")}>Giá dịch vụ <ArrowUpDown className="sort-icon" /></th>
          {/* Nếu không có DonGiaThuc thì xóa dòng này */}
          {/* <th onClick={() => sortData("DonGiaThuc")}>Giá thực tế <ArrowUpDown className="sort-icon" /></th> */}
          <th onClick={() => sortData("MoTa")}>Mô tả <ArrowUpDown className="sort-icon" /></th>
          <th className="relative">
            Trạng thái
            <Filter className="sort-icon" onClick={() => setShowServiceStatusFilter(!showServiceStatusFilter)} style={{ cursor: "pointer" }} />
            {showServiceStatusFilter && (
              <div className="filter-popup">
                <select value={selectedServiceStatus} onChange={handleServiceStatusFilterChange}>
                  <option value="">Tất cả</option>
                  <option value="true">Kích hoạt</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            )}
          </th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {dataServices.length === 0 ? (
          <tr><td colSpan={7}>Không có dịch vụ nào.</td></tr>
        ) : (
          dataServices
            .filter(s => {
              if (selectedServiceStatus === "") return true;
              return String(s.TrangThai) === selectedServiceStatus;
            })
            .map((s) => (
              <tr key={s.MaDV}>
                <td>{s.MaDV}</td>
                <td>{mapTenDVHienThi(s.TenDV)}</td>
                <td>{Number(s.DonGia || 0).toLocaleString()}₫</td>
                {/* Nếu muốn giữ DonGiaThuc tạm thời, có thể dùng lại DonGia */}
                {/* <td>{Number(s.DonGiaThuc ?? s.DonGia).toLocaleString()}₫</td> */}
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
    {/* <div className="service-actions">
      <button onClick={handleSearchService} className="action-button">
        Tra cứu dịch vụ
      </button>
      <button onClick={handleReloadServices} className="action-button">
        Reload danh sách
      </button>
      <button onClick={handlePrintServicePDF} className="action-button">
        In phiếu dịch vụ
      </button>
    </div> */}
  </div>
)}

{selectedTab === "list-phieudichvu" && (
  <div>
    <table className="data-table">
      <thead>
        <tr>
          <th onClick={() => sortData("MaPDV", false)}>Mã phiếu <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("HoTen", false)}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("NgayLap", false)}>Ngày lập <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("TongTien", false)}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("TraTruoc", false)}>Trả trước <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => sortData("TienConLai", false)}>Còn lại <ArrowUpDown className="sort-icon" /></th>
          <th className="relative">
            Trạng thái
            <Filter className="sort-icon" onClick={() => setShowPhieuStatusFilter(!showPhieuStatusFilter)} style={{ cursor: "pointer" }} />
            {showPhieuStatusFilter && (
              <div className="filter-popup">
                <select value={selectedPhieuStatus} onChange={handlePhieuStatusFilterChange}>
                  <option value="">Tất cả</option>
                  {Array.from(new Set(phieuDichVuList.map(p => p.TrangThai))).map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}
          </th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {dataPhieuDichVu.length === 0 ? (
          <tr><td colSpan="8">Không có phiếu dịch vụ nào.</td></tr>
        ) : (
          dataPhieuDichVu.map((p) => (
            <tr key={p.MaPDV}>
              <td>{p.MaPDV}</td>
              <td>{p.HoTen}</td>
              <td>{p.NgayLap}</td>
              <td>{Number(p.TongTien).toLocaleString()}₫</td>
              <td>{Number(p.TraTruoc).toLocaleString()}₫</td>
              <td>{Number(p.TienConLai).toLocaleString()}₫</td>
              <td>{p.TrangThai}</td>
              <td>
                {role !== "Khách hàng" ? (
                  <>
                    <button
                      onClick={() => handleSuaPhieuDichVu(p.MaPDV)}
                      className="action-icon edit"
                    >
                      <Edit className="icon" />
                    </button>

                    <button
                      onClick={() => handleXoaPhieu(p.MaPDV)}
                      className="action-icon delete"
                    >
                      <Trash className="icon" />
                    </button>

                    <button
                      onClick={() => handleInChiTiet(p.MaPDV)}
                      className="action-icon print"
                    >
                      <Printer className="icon" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleXemPhieuDichVu(p.MaPDV)}
                      className="action-icon edit"
                    >
                      <Eye className="icon" />
                    </button>
                  <button
                    onClick={() => handleInChiTiet(p.MaPDV)}
                    className="action-icon print"
                  >
                    <Printer className="icon" />
                  </button>
                  </>
                )}
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
      {/* <div className="service-actions">
        <button onClick={handleThemPhieuDichVu} className="action-button">
          Thêm phiếu dịch vụ
        </button>
          <button onClick={handlePrintAllPDF} className="action-button">
          Xuất danh sách phiếu dịch vụ
        </button>
      </div> */}
    <Pagination />
  </div>
)}


      {modalVisible && (
        <GeneralModalForm
          section="services"
          mode={modalMode}
          initialData={selectedService}
          onClose={closeModal}
          onSubmit={handleServiceSave}
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