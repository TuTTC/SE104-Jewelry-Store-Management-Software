import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { FiEye } from "react-icons/fi";
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import * as productApi from "../services/productApi";
import { uploadImage } from "../services/upload_imgApi";
import Pagination from '../components/Pagination';
const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showSupplierFilter, setShowSupplierFilter] = useState(false);
  const [showNameFilter, setShowNameFilter] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [categories, setCategories] = useState([]);

  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);
 
  const fetchProducts = () => {
    try {
      productApi.getAllProducts()
        .then(data => {
          console.log(data)
          setProducts(data.data);
          setCategories(data.categories);
          applyFilterAndSort(data.data, selectedCategory, selectedSupplier, selectedName, sortConfig);

        })
    } catch (err) { 
      if (err.status === 403) {
      alert("Bạn không có quyền xem!");
    } else if (err.status === 401) {
      alert("Vui lòng đăng nhập!");
    } else {
      console.error("Lỗi khi lấy dữ liệu:", err);
    }
  }
  };

  const applyFilterAndSort = (data, category, supplier, name, sortCfg) => {
    let result = [...data];

    if (category) {
      result = result.filter(p => p.TenDM === category);
    }
    if (supplier) {
      result = result.filter(p => p.TenNCC === supplier);
    }
    if (name) {
    result = result.filter(p => p.TenSP === name);
    }
    if (sortCfg.key) {
      result.sort((a, b) => {
        if (a[sortCfg.key] < b[sortCfg.key]) return sortCfg.direction === "asc" ? -1 : 1;
        if (a[sortCfg.key] > b[sortCfg.key]) return sortCfg.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(result);
  };

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    applyFilterAndSort(products, selectedCategory, selectedSupplier, selectedName, newSortConfig);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    applyFilterAndSort(products, value, selectedSupplier, selectedName, sortConfig);
    setShowCategoryFilter(false);
  };

  const handleSupplierChange = (e) => {
    const value = e.target.value;
    setSelectedSupplier(value);
    applyFilterAndSort(products, selectedCategory, value, selectedName, sortConfig);
    setShowSupplierFilter(false);
  };
  const handleNameChange = (e) => {
  const value = e.target.value;
  setSelectedName(value);
  applyFilterAndSort(products, selectedCategory, selectedSupplier, value, sortConfig);
  setShowNameFilter(false);
};

  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setFormData(item || {});
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (
      !formData.TenSP ||
      !formData.GiaBan ||
      !formData.MaDM ||
      !formData.SoLuongTon ||
      !formData.MaNCC ||
      !formData.HinhAnh
    ) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return false;
    }

    if (isNaN(parseFloat(formData.GiaBan)) || parseFloat(formData.GiaBan) <= 0) {
      setError("Giá phải là số dương.");
      return false;
    }

    if (parseInt(formData.SoLuongTon) < 0) {
      setError("Số lượng tồn không được âm.");
      return false;
    }

    setError(""); // Reset lỗi nếu hợp lệ
    return true;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalType === "add") {
      productApi.addProduct(formData)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => setError(err.message));
    } else if (modalType === "edit" && currentItem) {
      productApi.updateProduct(currentItem.MaSP, formData)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => setError(err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      productApi.deleteProduct(id)
        .then(() => fetchProducts())
        .catch(err => alert(err.message));
    }
  };
  
  const exportToCSV = () => {
    if (products.length === 0) return;
    const headers = Object.keys(products[0]).join(',');
    const rows = products.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "products.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpdateAllPrices = async () => {
    try {
      const result = await productApi.updateAllProductPrices();
      alert(result.message);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file); // Gọi API upload
        setFormData((prev) => ({ ...prev, HinhAnh: imageUrl }));
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
      }
    }
};


  
  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý sản phẩm</h2>

        <button onClick={() => openModal("add")} className="action-button">Thêm sản phẩm</button>
        {/* <button onClick={handleUpdateAllPrices} className="action-button">Cập nhật giá</button> */}
        <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData("MaSP")}>ID <ArrowUpDown className="sort-icon" /></th>
              {/* <th className="relative">
                Tên
              <Filter className="sort-icon" onClick={() => setShowNameFilter(!showNameFilter)} style={{ cursor: "pointer" }} />
              
              {showNameFilter && (
                <div className="filter-popup">
                  <select value={selectedName} onChange={handleNameChange}>
                    <option value="">Tất cả</option>
                    {Array.from(new Set(products.map(p => p.TenSP))).map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </th> */}
               <th onClick={() => sortData("TenSP")}>Tên <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData("GiaBan")}>Giá <ArrowUpDown className="sort-icon" /></th>
              
              <th className="relative">
                Danh mục 
                <Filter className="sort-icon" onClick={() => setShowCategoryFilter(!showCategoryFilter)} style={{ cursor: "pointer" }} />
                {showCategoryFilter && (
                  <div className="filter-popup">
                    <select value={selectedCategory} onChange={handleCategoryChange}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(products.map(p => p.TenDM))).map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </th>

              <th onClick={() => sortData("SoLuongTon")}>Số lượng <ArrowUpDown className="sort-icon" /></th>

              <th className="relative">
                Nhà cung cấp 
                <Filter className="sort-icon" onClick={() => setShowSupplierFilter(!showSupplierFilter)} style={{ cursor: "pointer" }} />
                {showSupplierFilter && (
                  <div className="filter-popup">
                    <select value={selectedSupplier} onChange={handleSupplierChange}>
                      <option value="">Tất cả</option>
                      {Array.from(new Set(products.map(p => p.TenNCC))).map((sup, index) => (
                        <option key={index} value={sup}>{sup}</option>
                      ))}
                    </select>
                  </div>
                )}
              </th>

              <th>Hình ảnh</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.MaSP}>
                <td>{p.MaSP}</td>
                <td>{p.TenSP}</td>
                <td>{formatCurrency(p.GiaBan)}</td>
                <td>{p.TenDM}</td>
                <td>{p.SoLuongTon}</td>
                <td>{p.TenNCC}</td>
                <td>
                  <img
                    src={p.HinhAnh}
                    alt={p.TenSP}
                    className="product-image"
                    style={{ width: "50px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => {
                      setCurrentImage(p.HinhAnh);
                      setShowImageModal(true);
                    }}
                  />
                </td>

                <td>{p.MoTa}</td>
                <td>
                  <button onClick={() => openModal("edit", p)} className="action-icon edit"><Edit className="icon" /></button>
                  <button onClick={() => handleDelete(p.MaSP)} className="action-icon delete"><Trash className="icon" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>
      {showImageModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000
            }}
            onClick={() => setShowImageModal(false)} // Click ngoài tắt modal
          >
            <div
              style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "8px",
                position: "relative",
                maxWidth: "80%",
                maxHeight: "80%"
              }}
              onClick={(e) => e.stopPropagation()} // Ngăn click trong ảnh bị tắt
            >
              <img
                src={currentImage}
                alt="Ảnh sản phẩm"
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
            </div>
          </div>
        )}

      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="products"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
        handleImageUpload={handleImageUpload}
        categories={categories}
      />
    </div>
    
  );
  // Hàm format tiền
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);}
};



export default ProductManager;
