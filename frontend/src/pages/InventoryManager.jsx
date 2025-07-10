import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Edit, Trash, X, Filter, Eye } from 'lucide-react'; // Added Filter icon
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import inventoryApi from "../services/inventoryApi";
import Pagination from '../components/Pagination';

// Tạo FilterModal để chứa form lọc tháng và năm
const FilterModal = ({ showFilterModal, closeFilterModal, filterFormData, handleFilterInputChange, handleFilterSubmit }) => {
  if (!showFilterModal) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}>
      <div style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "8px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Lọc theo tháng và năm</h2>
          <button onClick={closeFilterModal} style={{
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleFilterSubmit(); }}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="filter-month" style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Tháng</label>
            <select
              id="filter-month"
              name="month"
              value={filterFormData.month}
              onChange={handleFilterInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              <option value="">-- Chọn tháng --</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="filter-year" style={{ display: "block", marginBottom: "6px", fontWeight: 500 }}>Năm</label>
            <select
              id="filter-year"
              name="year"
              value={filterFormData.year}
              onChange={handleFilterInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              <option value="">-- Chọn năm --</option>
              {Array.from({ length: 10 }, (_, i) => 2025 - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}>
            <button type="submit" className="action-button">
              <Filter className="icon" size={16} /> Áp dụng
            </button>
            <button type="button" onClick={closeFilterModal} style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#6c757d",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500
            }}>
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({ month: '', year: '' });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false); // Thêm state cho modal lọc

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.getAll();
      setInventory(
        data.map((item) => ({
          productName: item.TenSP,
          tonDau: item.TonDau,
          soLuongMuaVao: item.SoLuongMuaVao,
          soLuongBanRa: item.SoLuongBanRa,
          tonCuoi: item.TonCuoi,
          donViTinh: item.DonViTinh,
          lastUpdated: item.NgayCapNhat,
          warning: item.MucCanhBao
        }))
      );
    } catch (err) {
      if (err.status === 403) alert("Bạn không có quyền xem!");
      else if (err.status === 401) alert("Vui lòng đăng nhập!");
      else console.error("Lỗi khi lấy dữ liệu tồn kho:", err);
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
  const closeSearchModal = () => setShowSearchModal(false);

  const openFilterModal = () => setShowFilterModal(true);
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

  const handleFilterSubmit = async () => {
    if (!filterFormData.month || !filterFormData.year) {
      alert("Vui lòng chọn đầy đủ tháng và năm!");
      return;
    }
    try {
      const data = await inventoryApi.filterByMonth(filterFormData.month, filterFormData.year);
      setInventory(
        data.map((item) => ({
          productName: item.TenSP,
          tonDau: item.TonDau,
          soLuongMuaVao: item.SoLuongMuaVao,
          soLuongBanRa: item.SoLuongBanRa,
          tonCuoi: item.TonCuoi,
          donViTinh: item.DonViTinh,
          lastUpdated: item.NgayCapNhat,
          warning: item.MucCanhBao
        }))
      );
      closeFilterModal(); // Đóng modal sau khi áp dụng lọc
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi lọc dữ liệu!");
    }
  };

  const handleExportByMonth = async () => {
    if (!filterFormData.month || !filterFormData.year) {
      alert("Vui lòng chọn tháng và năm trước khi xuất báo cáo!");
      return;
    }
    try {
      const blob = await inventoryApi.exportByMonth(filterFormData.month, filterFormData.year);
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi xuất báo cáo!");
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = await inventoryApi.exportAll();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BaoCaoTonKho_ToanBo.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi xuất báo cáo!");
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
        const addedItem = await inventoryApi.add(formData);
        setInventory([...inventory, {
          id: addedItem.MaTK,
          productId: addedItem.MaSP,
          quantity: addedItem.SoLuongTon,
          productName: addedItem.TenSP,
          lastUpdated: addedItem.NgayCapNhat,
          warning: addedItem.MucCanhBao
        }]);
      } else if (modalType === 'edit' && currentItem) {
        const updatedItem = await inventoryApi.update(formData);
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
    closeSearchModal();
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        <div className="action-buttons">
          <button onClick={openFilterModal} className="action-button">
            <Filter className="icon" size={16} /> Lọc
          </button>
          <button onClick={handleExportByMonth} className="action-button">
            <Download className="icon" /> Xuất PDF theo tháng
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('stt')}>STT <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('productName')}>Sản phẩm <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('tonDau')}>Tồn đầu <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('soLuongMuaVao')}>Nhập vào <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('soLuongBanRa')}>Bán ra <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('tonCuoi')}>Tồn cuối <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('donViTinh')}>Đơn vị <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('lastUpdated')}>Cập nhật <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('warning')}>Cảnh báo <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i, index) => (
              <tr key={index} className={i.tonCuoi < 10 ? "low-stock" : ""}>
                <td>{index + 1}</td>
                <td>{i.productName}</td>
                <td>{i.tonDau}</td>
                <td>{i.soLuongMuaVao}</td>
                <td>{i.soLuongBanRa}</td>
                <td>{i.tonCuoi}</td>
                <td>{i.donViTinh}</td>
                <td>{new Date(i.lastUpdated).toLocaleString()}</td>
                <td>{i.warning}</td>
                <td>
                  <button onClick={() => openModal('edit', i)} className="action-icon edit">
                    <Eye className="icon" />
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
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default InventoryManager;