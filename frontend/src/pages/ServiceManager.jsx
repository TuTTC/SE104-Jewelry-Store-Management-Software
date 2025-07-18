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


/*
// src/pages/ServiceManager.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialServices } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';

const ServiceManager = () => {
  const [services, setServices] = useState(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    // Placeholder for backend API call
    // fetchServices().then(data => setServices(data));
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setFormData(item || {});
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
    setError('');
  };

  const openSearchModal = () => setShowSearchModal(true);
  const openFilterModal = () => setShowFilterModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  const closeFilterModal = () => setShowFilterModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFormData({ ...searchFormData, [name]: value });
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({ ...filterFormData, [name]: value });
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedData = [...services].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setServices(sortedData);
  };

  const exportToCSV = () => {
    const headers = Object.keys(services[0]).join(',');
    const rows = services.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.code || !formData.name || !formData.price || !formData.description || formData.status === undefined) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError('Giá phải là số dương.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = { ...formData, id: Date.now() };
    if (modalType === 'add') {
      setServices([...services, newItem]);
    } else if (modalType === 'edit' && currentItem) {
      setServices(services.map(item => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      setServices(services.filter(item => item.id !== id));
    }
  };

  const handleSearchSubmit = () => {
    // Placeholder for backend API call
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Placeholder for backend API call
    closeFilterModal();
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý dịch vụ</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal('add')} className="action-button">Thêm dịch vụ</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('code')}>Mã dịch vụ <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('name')}>Tên dịch vụ <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('price')}>Giá <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('description')}>Mô tả <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('status')}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.code}</td>
                <td>{s.name}</td>
                <td>${s.price.toFixed(2)}</td>
                <td>{s.description}</td>
                <td>
                  <span className={s.status ? 'status-instock' : 'status-inactive'}>
                    {s.status ? 'Kích hoạt' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal('edit', s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="services"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="services"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="services"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default ServiceManager;


/*
import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh path nếu cần

const initialServices = [
  { id: 1, code: "DV001", name: "Thiết kế theo yêu cầu", price: 500.00, description: "Thiết kế trang sức tùy chỉnh", status: true },
  { id: 2, code: "DV002", name: "Sửa chữa trang sức", price: 300.00, description: "Sửa chữa và đánh bóng", status: true },
];

function ServiceManager() {
  const [services, setServices] = useState(initialServices);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedService, setSelectedService] = useState(null);

  // Mở modal
  const openModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  // Gửi form
  const handleSubmit = (data) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      status: data.status === "true", // Chuyển thành boolean
    };

    if (modalMode === "add") {
      const newService = { ...formattedData, id: Date.now() };
      setServices([...services, newService]);
    } else if (modalMode === "edit" && selectedService) {
      const updated = services.map((s) =>
        s.id === selectedService.id ? { ...s, ...formattedData } : s
      );
      setServices(updated);
    }

    closeModal();
  };

  // Xoá dịch vụ
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịch vụ này?")) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  // Hành động riêng
  const handleSearchService = () => {
    alert("Tính năng tra cứu dịch vụ đang được phát triển.");
  };

  const handleCreateServiceTicket = () => {
    alert("Tạo phiếu dịch vụ thành công.");
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
              <th>Mã</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.price.toLocaleString()}₫</td>
                <td>{s.description}</td>
                <td>
                  <span className={s.status ? "status-instock" : "status-inactive"}>
                    {s.status ? "Kích hoạt" : "Không hoạt động"}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal("edit", s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="service-actions">
        <button onClick={handleSearchService} className="action-button">Tra cứu dịch vụ</button>
        <button onClick={handleCreateServiceTicket} className="action-button">Phiếu dịch vụ</button>
      </div>

      {modalVisible && (
        <GeneralModalForm
          section="services"
          mode={modalMode}
          initialData={selectedService}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default ServiceManager;
*/
*/