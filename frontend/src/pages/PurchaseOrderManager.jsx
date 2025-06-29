import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialPurchaseOrders, initialSuppliers } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import Pagination from '../components/Pagination';

const PurchaseOrderManager = () => {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
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
    // Placeholder cho API call
    // fetchPurchaseOrders().then(data => setPurchaseOrders(data));
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
    const sortedData = [...purchaseOrders].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setPurchaseOrders(sortedData);
  };

  const exportToCSV = () => {
    const headers = ['ID,Mã phiếu nhập,Tên nhà cung cấp,Ngày nhập,Tổng tiền,Trạng thái'];
    const rows = purchaseOrders.map(item => {
      const supplier = initialSuppliers.find(s => s.id === item.supplierId);
      return [
        item.id,
        `"${item.orderCode}"`,
        `"${supplier ? supplier.name : 'Không xác định'}"`,
        `"${item.date}"`,
        item.total.toFixed(2),
        `"${item.status}"`
      ].join(',');
    });
    const csv = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchaseOrders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.orderCode || !formData.supplierId || !formData.date || !formData.total || !formData.status) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (parseFloat(formData.total) <= 0) {
      setError('Tổng tiền phải lớn hơn 0.');
      return false;
    }
    if (!initialSuppliers.find(s => s.id === parseInt(formData.supplierId))) {
      setError('ID nhà cung cấp không hợp lệ.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = { ...formData, id: Date.now(), total: parseFloat(formData.total), supplierId: parseInt(formData.supplierId) };
    if (modalType === 'add') {
      setPurchaseOrders([...purchaseOrders, newItem]);
    } else if (modalType === 'edit' && currentItem) {
      setPurchaseOrders(purchaseOrders.map(item => (item.id === currentItem.id ? { ...newItem, id: item.id } : item)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?')) {
      setPurchaseOrders(purchaseOrders.filter(item => item.id !== id));
    }
  };

  const handleSearchSubmit = () => {
    // Placeholder cho API call
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Placeholder cho API call
    closeFilterModal();
  };

  const getSupplierName = (supplierId) => {
    const supplier = initialSuppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Không xác định';
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý phiếu nhập</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal('add')} className="action-button">Thêm phiếu nhập</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('orderCode')}>Mã phiếu nhập <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('supplierId')}>Nhà cung cấp <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('date')}>Ngày nhập <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('total')}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('status')}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.orderCode}</td>
                <td>{getSupplierName(po.supplierId)}</td>
                <td>{po.date}</td>
                <td>${po.total.toFixed(2)}</td>
                <td>
                  <span className={po.status === 'Đã xử lý' ? 'status-instock' : 'status-lowstock'}>
                    {po.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal('edit', po)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(po.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="purchaseOrders"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
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
};

export default PurchaseOrderManager;



/*
import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh path nếu cần

const initialPurchaseOrders = [
  { id: 1, code: "PN001", supplier: "Supplier A", date: "2024-05-01", total: 10000.00, status: "Đã nhập" },
  { id: 2, code: "PN002", supplier: "Supplier B", date: "2024-05-02", total: 5000.00, status: "Đang xử lý" },
];


function PurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mở modal
  function openModal(mode, order = null) {
    setModalMode(mode);
    setSelectedOrder(order);
    setModalVisible(true);
  }

  // Đóng modal
  function closeModal() {
    setModalVisible(false);
    setSelectedOrder(null);
  }

  // Gửi form
  function handleSubmit(data) {
    if (modalMode === "add") {
      const newOrder = { ...data, id: Date.now() };
      setPurchaseOrders([...purchaseOrders, newOrder]);
    } else if (modalMode === "edit" && selectedOrder) {
      const updatedOrders = purchaseOrders.map((po) =>
        po.id === selectedOrder.id ? { ...po, ...data } : po
      );
      setPurchaseOrders(updatedOrders);
    }
    closeModal();
  }

  // Xoá
  function handleDelete(id) {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá phiếu nhập này?");
    if (confirmDelete) {
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
    }
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý nhập hàng</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm phiếu nhập
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã phiếu</th>
              <th>Nhà cung cấp</th>
              <th>Ngày nhập</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.code}</td>
                <td>{po.supplier}</td>
                <td>{po.date}</td>
                <td>${Number(po.total).toFixed(2)}</td>
                <td>{po.status}</td>
                <td>
                  <button onClick={() => openModal("edit", po)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(po.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <GeneralModalForm
          section="purchaseOrders"
          mode={modalMode}
          initialData={selectedOrder}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default PurchaseOrderManager;
*/