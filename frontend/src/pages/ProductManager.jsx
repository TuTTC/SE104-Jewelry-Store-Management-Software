import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import * as productApi from "../services/productApi";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    fetchProducts();
  }, []);

const fetchProducts = () => {
  productApi.getAllProducts()
    .then(data => {
      console.log("DATA TRẢ VỀ TỪ API:", data);
      setProducts(data.data);
    })
    .catch(err => alert(err.message));
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

    const sortedData = [...products].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setProducts(sortedData);
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

  const validateForm = () => {
    if (!formData.code || !formData.name || !formData.price || !formData.quantity || !formData.category || !formData.status || !formData.image) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return false;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setError("Giá phải là số dương.");
      return false;
    }
    if (parseInt(formData.quantity) < 0) {
      setError("Số lượng không được âm.");
      return false;
    }
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
      productApi.updateProduct(currentItem.id, formData)
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

  const handleSearchSubmit = () => {
    // Nếu backend có hỗ trợ params tìm kiếm thì truyền vào đây
    fetchProducts();
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Nếu backend có hỗ trợ params lọc thì truyền vào đây
    fetchProducts();
    closeFilterModal();
  };
  const handleUpdateAllPrices = async () => {
  try {
    const result = await productApi.updateAllProductPrices();
    alert(result.message);
    fetchProducts();  // Hàm load lại danh sách sản phẩm nếu cần
  } catch (err) {
    alert(err.message);
  }
};
  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal("add")} className="action-button">Thêm sản phẩm</button>
           <button onClick={() => handleUpdateAllPrices} className="action-button">Cập nhật giá</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
              {/* <th onClick={() => sortData("code")}>Mã <ArrowUpDown className="sort-icon" /></th> */}
              <th onClick={() => sortData("name")}>Tên <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData("price")}>Giá <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData("category")}>Danh mục <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData("quantity")}>Số lượng <ArrowUpDown className="sort-icon" /></th>
              {/* <th onClick={() => sortData("status")}>Trạng thái <ArrowUpDown className="sort-icon" /></th> */}
              <th>Nhà cung cấp</th>
              <th>Hình ảnh</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.MaSP}>
                <td>{p.MaSP}</td>
                <td>{p.TenSP}</td>
                <td>{p.GiaBan.toLocaleString()} VND</td>
                <td>{p.TenDM}</td>
                <td>{p.SoLuongTon}</td>
                <td>{p.TenNCC}</td>
                <td>
                  <img src={p.HinhAnh} alt={p.TenSP} className="product-image" />
                </td>
                <td>{p.MoTa}</td>
                <td>
                  <button onClick={() => openModal("edit", p)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(p.MaSP)} className="action-icon delete">
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
        currentSection="products"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="products"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="products"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default ProductManager;


// import React, { useEffect, useState } from "react";
// import { Edit, Trash } from "lucide-react";
// import GeneralModalForm from "../components/GeneralModalForm";
// import * as productAPI from "../services/productApi";

// const ProductManager = () => {
//   const [products, setProducts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [formMode, setFormMode] = useState("add");
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = () => {
//     productAPI.getAllProducts()
//       .then(data => setProducts(data))
//       .catch(err => alert(err.message));

//   };

//   const openModal = (mode, product = null) => {
//     setFormMode(mode);
//     setSelectedProduct(product);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedProduct(null);
//   };

//   const handleSubmit = (data) => {
//     if (formMode === "add") {
//       productAPI.addProduct(data)
//         .then(() => {
//           fetchProducts();
//           closeModal();
//         })
//         .catch(err => alert(err.message));
//     } else if (formMode === "edit" && selectedProduct) {
//       productAPI.updateProduct(selectedProduct.MaSP, data)
//         .then(() => {
//           fetchProducts();
//           closeModal();
//         })
//         .catch(err => alert(err.message));
//     }
//   };

//   const handleDelete = (id) => {
//     if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
//       productAPI.deleteProduct(id)
//         .then(() => fetchProducts())
//         .catch(err => alert(err.message));
//     }
//   };

//   return (
//     <div className="table-card">
//       <div className="table-header">
//         <h2 className="table-title">Quản lý sản phẩm</h2>
//         <button onClick={() => openModal("add")} className="action-button">Thêm sản phẩm</button>
//       </div>

//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Tên</th>
//               <th>Danh mục</th>
//               <th>Nhà cung cấp</th>
//               <th>Giá</th>
//               <th>Số lượng</th>
//               <th>Hình ảnh</th>
//               <th>Ghi chú</th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((p) => (
//               <tr key={p.MaSP}>
//                 <td>{p.MaSP}</td>
//                 <td>{p.TenSP}</td>
//                 <td>{p.MaDM}</td>
//                 <td>{p.MaNCC}</td>
//                 <td>{Number(p.GiaBan).toLocaleString()}₫</td>
//                 <td>{p.SoLuongTon}</td>
//                 <td>
//                   <img src={p.HinhAnh || "/images/default.jpg"} alt={p.TenSP} className="product-image" />
//                 </td>
//                 <td>{p.MoTa}</td>
//                 <td>
//                   <button onClick={() => openModal("edit", p)} className="action-icon edit">
//                     <Edit className="icon" />
//                   </button>
//                   <button onClick={() => handleDelete(p.MaSP)} className="action-icon delete">
//                     <Trash className="icon" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {showModal && (
//         <GeneralModalForm
//           section="products"
//           mode={formMode}
//           data={selectedProduct}
//           onClose={closeModal}
//           onSubmit={handleSubmit}
//         />
//       )}
//     </div>
//   );
// };

// export default ProductManager;

/*
import React, { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import * as productAPI from "../services/productApi";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    price: "",
    category: "",
    quantity: "",
    status: "",
    image: "",
    note: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // const fetchProducts = () => {
  //   productAPI.getAllProducts()
  //     .then(data => setProducts(data))
  //     .catch(err => alert(err.message));
  // };
  const fetchProducts = () => {
  productAPI.getAllProducts()
    .then(data => {
      console.log("DATA FROM API:", data);
      setProducts(data.data);
    })
    .catch(err => alert(err.message));
};

  const openModal = (mode, product = null) => {
    setFormMode(mode);
    setShowModal(true);

    if (mode === "edit" && product) {
      setFormData({
        code: product.MaSP || "",
        name: product.TenSP || "",
        price: product.GiaBan || "",
        category: product.MaDM || "",
        quantity: product.SoLuongTon || "",
        status: product.TrangThai || "",
        image: product.HinhAnh || "",
        note: product.MoTa || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        price: "",
        category: "",
        quantity: "",
        status: "",
        image: "",
        note: "",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      code: "",
      name: "",
      price: "",
      category: "",
      quantity: "",
      status: "",
      image: "",
      note: "",
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      MaSP: formData.code,
      TenSP: formData.name,
      GiaBan: formData.price,
      MaDM: formData.category,
      SoLuongTon: formData.quantity,
      TrangThai: formData.status,
      HinhAnh: formData.image,
      MoTa: formData.note,
    };

    if (formMode === "add") {
      productAPI.addProduct(data)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => setError(err.message));
    } else if (formMode === "edit") {
      productAPI.updateProduct(formData.code, data)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => setError(err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      productAPI.deleteProduct(id)
        .then(() => fetchProducts())
        .catch(err => alert(err.message));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý sản phẩm</h2>
        <button onClick={() => openModal("add")} className="action-button">Thêm sản phẩm</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Nhà cung cấp</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Hình ảnh</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.MaSP}>
                <td>{p.MaSP}</td>
                <td>{p.TenSP}</td>
                <td>{p.MaDM}</td>
                <td>{p.MaNCC}</td>
                <td>{Number(p.GiaBan).toLocaleString()}₫</td>
                <td>{p.SoLuongTon}</td>
                <td>
                  <img src={p.HinhAnh || "/images/default.jpg"} alt={p.TenSP} className="product-image" />
                </td>
                <td>{p.MoTa}</td>
                <td>
                  <button onClick={() => openModal("edit", p)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(p.MaSP)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <GeneralModalForm
          showModal={showModal}
          closeModal={closeModal}
          modalType={formMode}
          currentSection="products"
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          error={error}
        />
      )}
    </div>
  );
};

export default ProductManager;
*/