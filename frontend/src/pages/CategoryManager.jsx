import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import categoryApi from '../services/categoryApi';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res || []);
    } catch (error) {
      alert(error.message);
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
    if (!formData.TenDM || !formData.MoTa) {
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
      setError(error.message);
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

    if (nameFilter.trim() !== '') {
      filteredData = filteredData.filter(item =>
        item.TenDM.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
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
        <h2 className="table-title">Quản lý danh mục</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Lọc theo tên danh mục..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="input-filter"
          />
          <button onClick={() => setShowSearchModal(true)} className="action-button">
            <Search className="icon" /> Tìm kiếm
          </button>
          {/* <button onClick={() => setShowFilterModal(true)} className="action-button">
            <Filter className="icon" /> Lọc
          </button> */}
          <button onClick={() => openModal('add')} className="action-button">Thêm danh mục</button>
          <button onClick={exportToCSV} className="action-button">
            <Download className="icon" /> Xuất CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('MaDM')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('TenDM')}>Tên <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('MoTa')}>Mô tả <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applyFilterAndSort().map((category) => (
              <tr key={category.MaDM}>
                <td>{category.MaDM}</td>
                <td>{category.TenDM}</td>
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


/*
import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import Modal from "../components/GeneralModalForm";
import categoryApi from "../services/categoryApi";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      const formattedData = data.map((item) => ({
        id: item.MaDM,
        name: item.TenDM,
        description: item.MoTa,
      }));
      setCategories(formattedData);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err.message);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item ? { name: item.name, description: item.description } : {});
    setEditingId(item?.id || null);
    setShowModal(true);
    console.log(showModal);

    
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const payload = {
      TenDM: formData.name,
      MoTa: formData.description || "",
    };

    try {
      if (modalType === "add") {
        const res = await categoryApi.add(payload);
        setCategories((prev) => [
          ...prev,
          {
            id: res.MaDM,
            name: formData.name,
            description: formData.description || "",
          },
        ]);
      } else if (modalType === "edit" && editingId != null) {
        await categoryApi.update(editingId, payload);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId
              ? { ...cat, name: formData.name, description: formData.description }
              : cat
          )
        );
      }
      closeModal();
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.delete(id);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err.message);
      }
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý danh mục sản phẩm</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm danh mục
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>
                  <button
                    onClick={() => openModal("edit", c)}
                    className="action-icon edit"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="action-icon delete"
                  >
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {showModal && (
          <Modal
            showModal={showModal} // truyền đầy đủ
            closeModal={closeModal}
            modalType={modalType}
            currentSection="categories"
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            error={null} // hoặc có biến error thì truyền vào
          />
        )}

    </div>
  );
}

export default CategoryManager;
*/