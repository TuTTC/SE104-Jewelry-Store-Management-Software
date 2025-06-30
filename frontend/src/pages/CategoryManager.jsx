import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialCategories } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';

const CategoryManager = () => {
  const [categories, setCategories] = useState(initialCategories);
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
    // fetchCategories().then(data => setCategories(data));
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
    const sortedData = [...categories].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setCategories(sortedData);
  };

  const exportToCSV = () => {
    const headers = ['ID,Tên,Mô tả,Trạng thái'];
    const rows = categories.map(item => [
      item.id,
      `"${item.name}"`,
      `"${item.description}"`,
      `"${item.status}"`
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

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.status) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (formData.name.length < 2) {
      setError('Tên danh mục phải có ít nhất 2 ký tự.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = { ...formData, id: Date.now() };
    if (modalType === 'add') {
      setCategories([...categories, newItem]);
    } else if (modalType === 'edit' && currentItem) {
      setCategories(categories.map(item => (item.id === currentItem.id ? { ...newItem, id: item.id } : item)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setCategories(categories.filter(item => item.id !== id));
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

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý danh mục</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal('add')} className="action-button">Thêm danh mục</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('name')}>Tên <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('description')}>Mô tả <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('status')}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <span className={category.status === 'Kích hoạt' ? 'status-instock' : 'status-inactive'}>
                    {category.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal('edit', category)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="action-icon delete">
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
        closeSearchModal={closeSearchModal}
        currentSection="categories"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="categories"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
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