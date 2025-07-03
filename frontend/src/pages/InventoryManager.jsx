// src/pages/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';

import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import inventoryApi from "../services/inventoryApi";
import Pagination from '../components/Pagination';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
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
     fetchInventory();
    // fetchInventory().then(data => setInventory(data));
  }, []);


  const fetchInventory = async () => {
  try {
    const data = await inventoryApi.getAll();
    console.log("DATA TRẢ VỀ TỪ API:", data);
    setInventory(
      data.map((item) => ({
        id: item.MaTK, // Dùng khóa chính thực tế làm key
        productId: item.MaSP,
        quantity: item.SoLuongTon,
        lastUpdated: item.NgayCapNhat,
        warning: item.MucCanhBao,
        productName: item.TenSP
      }))
    );
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu tồn kho:", err);
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
  
const handleUpdateAll = async () => {
  try {
    const dataList = inventory.map((item) => ({
      MaSP: item.productId,
      SoLuongTon: parseInt(item.quantity),
    }));

    await inventoryApi.updateAll(dataList);
    alert("Cập nhật toàn bộ tồn kho thành công!");

    // Gọi lại getAll tự động sau khi cập nhật thành công
    fetchInventory();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedData = [...inventory].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setInventory(sortedData);
  };

  const exportToCSV = () => {
    const headers = Object.keys(inventory[0]).join(',');
    const rows = inventory.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.productId || !formData.quantity || !formData.lastUpdated) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (parseInt(formData.quantity) < 0) {
      setError('Số lượng không được âm.');
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    if (modalType === 'add') {
      const addedItem = await inventoryApi.add(formData); // giả sử API trả về item mới kèm MaTK
      setInventory([...inventory, {
        id: addedItem.MaTK,
        productId: addedItem.MaSP,
        quantity: addedItem.SoLuongTon,
        productName: addedItem.TenSP,
        lastUpdated: addedItem.NgayCapNhat,
        warning: addedItem.MucCanhBao
      }]);
    } else if (modalType === 'edit' && currentItem) {
      const updatedItem = await inventoryApi.update(formData); // giả sử API update trả về bản ghi mới
      setInventory(inventory.map(item =>
        item.id === currentItem.id ? {
          ...item,
          quantity: updatedItem.SoLuongTon,
          warning: updatedItem.MucCanhBao
        } : item
      ));
    }
    closeModal();

  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra khi thêm/cập nhật tồn kho!");
  }
};


  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      setInventory(inventory.filter(item => item.id !== id));
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
        <h2 className="table-title">Quản lý tồn kho</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          {/* <button onClick={handleUpdateAll} className="action-button">Cập nhật tồn kho</button> */}
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('productId')}>Sản phẩm <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('quantity')}>Số lượng <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('lastUpdated')}>Cập nhật lần cuối <ArrowUpDown className="sort-icon" /></th>
               <th onClick={() => sortData('warning')}>Mức cảnh báo <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.productName}</td>
                <td>{i.quantity}</td>
                <td>{i.lastUpdated}</td>
                <td>{i.warning}</td>
                <td>
                  <button onClick={() => openModal('edit', i)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(i.id)} className="action-icon delete">
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
        currentSection="inventory"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="inventory"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="inventory"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default InventoryManager;