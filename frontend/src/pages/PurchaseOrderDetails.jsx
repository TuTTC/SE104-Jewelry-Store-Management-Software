// src/pages/PurchaseOrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialPurchaseOrderDetails } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import Pagination from '../components/Pagination';

const PurchaseOrderDetails = () => {
  const [details, setDetails] = useState(initialPurchaseOrderDetails);
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
    // fetchPurchaseOrderDetails().then(data => setDetails(data));
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
    const sortedData = [...details].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setDetails(sortedData);
  };

  const exportToCSV = () => {
    const headers = Object.keys(details[0]).join(',');
    const rows = details.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchaseOrderDetails.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.maPN || !formData.maSP || !formData.soLuong || !formData.donGiaNhap) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (parseInt(formData.soLuong) <= 0 || parseFloat(formData.donGiaNhap) <= 0) {
      setError('Số lượng và đơn giá phải lớn hơn 0.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const thanhTien = (parseFloat(formData.soLuong) * parseFloat(formData.donGiaNhap)).toFixed(2);
    const newItem = { ...formData, id: Date.now(), thanhTien };
    if (modalType === 'add') {
      setDetails([...details, newItem]);
    } else if (modalType === 'edit' && currentItem) {
      setDetails(details.map(item => (item.id === currentItem.id ? { ...newItem, id: item.id } : item)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      setDetails(details.filter(item => item.id !== id));
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
        <h2 className="table-title">Chi tiết phiếu nhập</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal('add')} className="action-button">Thêm chi tiết</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('maCTPN')}>Mã CTPN <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('maPN')}>Mã phiếu nhập <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('maSP')}>Mã sản phẩm <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('soLuong')}>Số lượng <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('donGiaNhap')}>Đơn giá nhập <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('thanhTien')}>Thành tiền <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {details.map((pod) => (
              <tr key={pod.id}>
                <td>{pod.id}</td>
                <td>{pod.maCTPN}</td>
                <td>{pod.maPN}</td>
                <td>{pod.maSP}</td>
                <td>{pod.soLuong}</td>
                <td>${pod.donGiaNhap.toFixed(2)}</td>
                <td>${pod.thanhTien}</td>
                <td>
                  <button onClick={() => openModal('edit', pod)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(pod.id)} className="action-icon delete">
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
        currentSection="purchaseOrderDetails"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="purchaseOrderDetails"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="purchaseOrderDetails"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default PurchaseOrderDetails;