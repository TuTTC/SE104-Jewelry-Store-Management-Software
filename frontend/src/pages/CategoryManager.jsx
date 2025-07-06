import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import categoryApi from '../services/categoryApi';
import Pagination from '../components/Pagination';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [nameFilter, setNameFilter] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [selectedName, setSelectedName] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showUnitFilter, setShowUnitFilter] = useState(false);

  useEffect(() => { 
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res || []);
    } catch (error) {
      if (error.status === 403) {
      alert("Bạn không có quyền xem!");
    } else if (error.status === 401) {
      alert("Vui lòng đăng nhập!");
    } else {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  }
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.TenDM || !formData.MoTa || !formData.DonViTinh || !formData.PhanTramLoiNhuan) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }

    if (formData.TenDM.length < 2) {
      setError('Tên danh mục phải có ít nhất 2 ký tự.');
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    if (modalType === 'add') {
      await categoryApi.add(formData);
    } else if (modalType === 'edit' && currentItem) {
      await categoryApi.update(currentItem.MaDM, formData);
    }
    fetchCategories();
    closeModal();
  } catch (error) {
    if (error.status === 403) {
      alert("Bạn không có quyền thực hiện thao tác này!");
    } else {
      console.error(error);
      alert(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  }
};



  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await categoryApi.delete(id);
        fetchCategories();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

const applyFilterAndSort = () => {
  let filteredData = [...categories];

  // Lọc theo tên nếu có chọn
  if (selectedName.trim() !== '') {
    filteredData = filteredData.filter(item => item.TenDM === selectedName);
  }
  if (selectedUnit.trim() !== '') {
  filteredData = filteredData.filter(item => item.DonViTinh === selectedUnit);
  }

  // Sắp xếp nếu có key
  if (sortConfig.key) {
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  return filteredData;
};

  const exportToCSV = () => {
    const headers = ['ID,Tên,Mô tả'];
    const rows = categories.map(item => [
      item.MaDM,
      `"${item.TenDM}"`,
      `"${item.MoTa}"`
    ].join(','));
    const csv = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>
          Danh mục sản phẩm: {applyFilterAndSort().length}
        </h3>
        <div className="flex items-center gap-2">
          
          {/* <button onClick={() => setShowSearchModal(true)} className="action-button">
            <Search className="icon" /> Tìm kiếm
          </button> */}
          {/* <button onClick={() => setShowFilterModal(true)} className="action-button">
            <Filter className="icon" /> Lọc
          </button> */}
         
        <div className="action-buttons">
           {/* <input
            type="text"
            placeholder="Lọc theo tên danh mục..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="input-filter"
          /> */}
          <button onClick={() => openModal('add')} className="action-button">Thêm danh mục</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('MaDM')}>ID <ArrowUpDown className="sort-icon" /></th>
             <th className="relative">
                Tên
                <Filter className="sort-icon" onClick={() => setShowNameFilter(!showNameFilter)} style={{ cursor: "pointer" }} />
                {showNameFilter && (
                  <div className="filter-popup">
                    <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(categories.map(c => c.TenDM))).map((name, index) => (
                        <option key={index} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </th>
              <th className="relative">
                Đơn vị tính
                <Filter className="sort-icon" onClick={() => setShowUnitFilter(!showUnitFilter)} style={{ cursor: "pointer" }}/>
                {showUnitFilter && (
                  <div className="filter-popup">
                    <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(categories.map(c => c.DonViTinh))).map((unit, index) => (
                        <option key={index} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}

              </th>
              <th onClick={() => sortData('PhanTramLoiNhuan')}> Phần trăm lợi nhuận <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('MoTa')}>Mô tả <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applyFilterAndSort().map((category) => (
              <tr key={category.MaDM}>
                <td>{category.MaDM}</td>
                <td>{category.TenDM}</td>
                <td>{category.DonViTinh}</td>
                <td>{category.PhanTramLoiNhuan}</td>
                <td>{category.MoTa}</td>
                <td>
                  <button onClick={() => openModal('edit', category)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(category.MaDM)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <Pagination /> */}
      </div>

      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="categories"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />

      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={() => setShowSearchModal(false)}
        currentSection="categories"
      />

      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={() => setShowFilterModal(false)}
        currentSection="categories"
      />
    </div>
  );
};

export default CategoryManager;
