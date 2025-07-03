import React, { useState, useEffect } from "react";
import { ArrowUpDown, Download, Search, Filter, Edit, Trash, Plus  } from "lucide-react";
import { LuEye, LuPrinter } from "react-icons/lu";
import { FiEye } from "react-icons/fi";
import GeneralModalForm from "../components/GeneralModalForm"; // Điều chỉnh path nếu cần
import * as orderApi from "../services/purchaseOrderApi";
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import PurchaseOrderForm from "forms/AddPurchaseOrderForm";
import Pagination from '../components/Pagination';
function PurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    supplier: "",
    user:"",
    date: "",
    total: "",
    status: "",
    ChiTiet: [],
  });

  const modalType = modalMode;
  const showModal = modalVisible;

  const openSearchModal = () => setShowSearchModal(true);
  const openFilterModal = () => setShowFilterModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  const closeFilterModal = () => setShowFilterModal(false);
  // Fetch danh sách phiếu nhập từ backend
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
     
      if (res.status === "success") {
         console.log(res.data)
        setPurchaseOrders(res.data);
      } else {
        alert("Lỗi khi tải dữ liệu!");
      }
    } catch (error) {
      if (error.status === 403) {
          alert("Bạn không có quyền xem!");
      } else if (error.status === 401) {
          alert("Vui lòng đăng nhập!");
      } else {
          console.error("Lỗi khi lấy dữ liệu:", error);
          console.error("Error:", error);
          alert(error.message);
      }
      
    }
  };
  const handleEdit = async (maPN) => {
  try {
    const res = await orderApi.getOrderById(maPN);
    if (res.status === "success") {
      openModal("edit", res.data);
    } else {
      alert("Lấy chi tiết phiếu nhập thất bại!");
    }
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết phiếu nhập:", err);
    alert(err.message);
  }
};


  // Xử lý mở modal
  function openModal(mode, order = null) {
    console.log("Mở modal:", mode, order);

    setModalMode(mode);
    setSelectedOrder(order);
    setModalVisible(true);

    const statusMap = {
      "Đã nhập": "da_nhap",
      "Đang xử lý": "dang_xu_ly",
      "Hủy": "huy",
    };
    if (order) {
      setFormData({
        code: order.MaPN,
        supplier: order.MaNCC,
        user: order.UserID,
        date: order.NgayNhap?.slice(0, 10),
        total: order.TongTien,
        status: statusMap[order.TrangThai] || "",
        ChiTiet: order.ChiTiet || [],
      });
    } else {
      setFormData({
        code: "",
        supplier: "",
        user: "",
        date: "",
        total: "",
        status: "",
        ChiTiet: [],
      });
    }

  }

  // Đóng modal
  function closeModal() {
    setModalVisible(false);
    setSelectedOrder(null);
  }

  // Sau khi form thêm/sửa thành công
  function handleSuccess() {
    closeModal();
    fetchPurchaseOrders();
  }

  // Xử lý input form
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

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

  const sortedData = [...purchaseOrders].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // So sánh số
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }

    // So sánh ngày
    if (key === 'NgayNhap' && valA && valB) {
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // So sánh chuỗi (coi null/undefined là rỗng)
    valA = valA ? valA.toString().toLowerCase() : '';
    valB = valB ? valB.toString().toLowerCase() : '';
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  setPurchaseOrders(sortedData);
};


  const exportToCSV = () => {
    const headers = ['Mã Phiếu Nhập,Mã NCC,Người lập,Ngày nhập,Tổng tiền,Trạng thái'];
    const rows = purchaseOrders.map(item => [
      item.MaPN,
      item.TenNCC || item.MaNCC,
      item.UserID,
      item.NgayNhap,
      item.TongTien?.toFixed(2),
      item.TrangThai
    ].join(','));
    const csv = `${headers}\n${rows.join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchaseOrders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };


  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = {
          MaNCC: formData.supplier,
          UserID: formData.user,
          NgayNhap: formData.date,
          TrangThai: formData.status,
          ChiTiet: formData.ChiTiet.map(item => ({
            MaSP: item.MaSP,
            SoLuong: parseInt(item.SoLuong, 10),
            DonGiaNhap: parseFloat(item.DonGiaNhap)
          }))
        };

      if (modalMode === "add") {
        const res = await orderApi.addOrder(data);
        if (res.status === "success") {
          alert("Thêm phiếu nhập thành công!");
          handleSuccess();
        } else {
          alert("Thêm thất bại: " + res.message);
        }
      } else if (modalMode === "edit") {
        const res = await orderApi.updateOrder(formData.code, data);
        if (res.status === "success") {
          alert("Cập nhật phiếu nhập thành công!"); 
          handleSuccess();
        } else {
          alert("Cập nhật thất bại: " + res.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  }

  // Xoá phiếu nhập
  async function handleDelete(maPN) {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá phiếu nhập này?");
    if (confirmDelete) {
      try {
        const res = await orderApi.deleteOrder(maPN);
        if (res.status === "success") {
          alert("Xoá thành công!");
          fetchPurchaseOrders();
        } else {
          alert("Xoá thất bại: " + res.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Không kết nối được server!");
      }
    }
  }

  // Xuất PDF
  function exportPDF(maPN) {
    orderApi.exportOrderPDF(maPN);
  }
  const handleSearchSubmit = () => {
    // Placeholder cho API call
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Placeholder cho API call
    closeFilterModal();
  };

  // const getSupplierName = (supplierId) => {
  //   const supplier = initialSuppliers.find(s => s.id === supplierId);
  //   return supplier ? supplier.name : 'Không xác định';
  // };
  const filteredPurchaseOrders = purchaseOrders.filter(po => {
  const matchDate = selectedDate ? po.NgayNhap === selectedDate : true;
  const matchStatus = selectedStatus ? po.TrangThai === selectedStatus : true;
  return matchDate && matchStatus;
  });

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        {/* <button onClick={() => openModal("add")} className="action-button">
          <Plus className="icon" /> Thêm phiếu nhập
        </button> */}
        {/* <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
        <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button> */}
    <div className="action-buttons">
      <button onClick={() => openModal('add')} className="action-button">Thêm phiếu nhập</button>
      <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
    </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('MaPN')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('MaNCC')}>Nhà cung cấp <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('TenNguoiNhap')}>Người lập <ArrowUpDown className="sort-icon" /></th>
              <th className="relative">
                Ngày nhập
                <Filter className="sort-icon" onClick={() => setShowDateFilter(!showDateFilter)} style={{ cursor: "pointer" }} />
                {showDateFilter && (
                  <div className="filter-popup">
                    <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(purchaseOrders.map(p => p.NgayNhap))).map((date, index) => (
                        <option key={index} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                )}
              </th>
             <th onClick={() => sortData('TongTien')}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
              <th className="relative">
                Trạng thái 
                <Filter className="sort-icon" onClick={() => setShowStatusFilter(!showStatusFilter)} style={{ cursor: "pointer" }} />
                {showStatusFilter && (
                  <div className="filter-popup">
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(purchaseOrders.map(p => p.TrangThai))).map((status, index) => (
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
            {purchaseOrders.map((po) => (
              <tr key={po.MaPN}>
                <td>{po.MaPN}</td>
                <td>{po.TenNCC || po.MaNCC}</td>
                <td>{po.TenNguoiNhap}</td>
                <td>{po.NgayNhap}</td>
                <td>{formatCurrency(po.TongTien)}</td>
                <td>{po.TrangThai}</td>
                <td>
                  <button onClick={() => handleEdit(po.MaPN)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(po.MaPN)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                  <button onClick={() => exportPDF(po.MaPN)} className="action-icon export">
                    <LuPrinter className="icon"/>
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      {/* {modalVisible && (
        <GeneralModalForm
          showModal={showModal}
          closeModal={closeModal}
          modalType={modalType}
          currentSection="purchaseOrders"
          formData={formData}
          initialData={selectedOrder}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )} */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>

            <PurchaseOrderForm
              showModal={modalVisible}
              closeModal={closeModal}
              modalType={modalMode}
              formData={formData}
              initialData={selectedOrder}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}




      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="purchaseOrders"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="purchaseOrders"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
}

// Hàm format tiền
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export default PurchaseOrderManager;

