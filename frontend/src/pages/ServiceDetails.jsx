// src/pages/ServiceDetails.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialServiceDetails } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';

const ServiceDetails = () => {
  const [details, setDetails] = useState(initialServiceDetails);
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
    // fetchServiceDetails().then(data => setDetails(data));
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
    a.download = 'serviceDetails.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.maPDV || !formData.maDV || !formData.donGiaDichVu || !formData.donGiaDuocTinh || !formData.tienTraTruoc) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (parseFloat(formData.donGiaDichVu) <= 0 || parseFloat(formData.donGiaDuocTinh) <= 0 || parseFloat(formData.tienTraTruoc) < 0) {
      setError('Giá và số tiền phải hợp lệ.');
      return false;
    }
    if (parseInt(formData.soLuong) <= 0) {
      setError('Số lượng phải lớn hơn 0.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const thanhTien = (parseFloat(formData.donGiaDuocTinh) * parseInt(formData.soLuong || 1)).toFixed(2);
    const tienConLai = (thanhTien - parseFloat(formData.tienTraTruoc)).toFixed(2);
    const newItem = { ...formData, id: Date.now(), thanhTien, tienConLai };
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
        <h2 className="table-title">Chi tiết phiếu dịch vụ</h2>
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
              <th onClick={() => sortData('maCT')}>Mã CT <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('maPDV')}>Mã phiếu DV <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('maDV')}>Mã dịch vụ <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('donGiaDichVu')}>Đơn giá DV <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('donGiaDuocTinh')}>Đơn giá tính <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('soLuong')}>Số lượng <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('thanhTien')}>Thành tiền <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('tienTraTruoc')}>Tiền trả trước <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('tienConLai')}>Tiền còn lại <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('ngayGiao')}>Ngày giao <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('tinhTrang')}>Tình trạng <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {details.map((sd) => (
              <tr key={sd.id}>
                <td>{sd.id}</td>
                <td>{sd.maCT}</td>
                <td>{sd.maPDV}</td>
                <td>{sd.maDV}</td>
                <td>${sd.donGiaDichVu.toFixed(2)}</td>
                <td>${sd.donGiaDuocTinh.toFixed(2)}</td>
                <td>{sd.soLuong}</td>
                <td>${sd.thanhTien}</td>
                <td>${sd.tienTraTruoc.toFixed(2)}</td>
                <td>${sd.tienConLai}</td>
                <td>{sd.ngayGiao || 'Chưa xác định'}</td>
                <td>
                  <span className={sd.tinhTrang === 'Đã giao' ? 'status-instock' : 'status-lowstock'}>
                    {sd.tinhTrang}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal('edit', sd)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(sd.id)} className="action-icon delete">
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
        currentSection="serviceDetails"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="serviceDetails"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="serviceDetails"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default ServiceDetails;