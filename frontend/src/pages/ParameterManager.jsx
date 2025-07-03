import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit } from 'lucide-react';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import parameterApi from 'services/parameterApi';
import Pagination from '../components/Pagination';

const ParameterManager = () => {
  const [parameters, setParameters] = useState([]);
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
    loadParameters();
  }, []);

  const loadParameters = async () => {
    try {
      const res = await parameterApi.getAll();
      console.log("DATA TRẢ VỀ TỪ API:", res);
      setParameters(res.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách tham số.');
    }
  };

  const openModal = (type, item = null) => {
  setModalType(type);
  setCurrentItem(item);

  if (item) {
    setFormData({
      TenThamSo: item.TenThamSo || "",
      GiaTri: item.GiaTri || "",
      MoTa: item.MoTa || "",
      KichHoat: item.KichHoat ?? true,  // Mặc định true nếu chưa có
    });
  } else {
    setFormData({
      TenThamSo: "",
      GiaTri: "",
      MoTa: "",
      KichHoat: true,
    });
  }

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
    const sortedData = [...parameters].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setParameters(sortedData);
  };

  const exportToCSV = () => {
    if (parameters.length === 0) return;
    const headers = Object.keys(parameters[0]).join(',');
    const rows = parameters.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parameters.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.GiaTri) {
      setError('Giá trị không được để trống.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (modalType === 'edit' && currentItem) {
        await parameterApi.update(currentItem.TenThamSo, {
          GiaTri: formData.GiaTri,
          MoTa: formData.MoTa,
          KichHoat: formData.KichHoat,
        });
        loadParameters();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Cập nhật thất bại.');
    }
  };

  const handleSearchSubmit = () => {
    // Optionally call API filter here
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Optionally call API filter here
    closeFilterModal();
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý tham số</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('MaThamSo')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('TenThamSo')}>Tên tham số <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('GiaTri')}>Giá trị <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('MoTa')}>Mô tả <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('KichHoat')}>Kích hoạt <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((i) => (
              <tr key={i.MaThamSo}>
                <td>{i.MaThamSo}</td>
                <td>{i.TenThamSo}</td>
                <td>{i.GiaTri}</td>
                <td>{i.MoTa}</td>
                <td>{i.KichHoat ? 'Có' : 'Không'}</td>
                <td>
                  <button onClick={() => openModal('edit', i)} className="action-icon edit">
                    <Edit className="icon" />
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
        currentSection="parameter"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="parameter"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="parameter"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default ParameterManager;
