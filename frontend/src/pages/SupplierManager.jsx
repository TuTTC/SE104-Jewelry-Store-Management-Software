// import React, { useState } from "react";
// import { Edit, Trash } from "lucide-react";
// import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh lại đường dẫn nếu cần
// import * as supplierApi from "../services/supplierApi";
// import SearchModal from '../components/SearchModal';
// import FilterModal from '../components/FilterModal';

// const SupplierManager = () => {
//   const [suppliers, setSuppliers] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMode, setModalMode] = useState("add");
//   const [selectedSupplier, setSelectedSupplier] = useState(null);

//   const openModal = (mode, supplier = null) => {
//     setModalMode(mode);
//     setSelectedSupplier(supplier);
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedSupplier(null);
//   };

//   const handleSubmit = (data) => {
//     if (modalMode === "add") {
//       const newSupplier = { ...data, id: Date.now() };
//       setSuppliers([...suppliers, newSupplier]);
//     } else if (modalMode === "edit" && selectedSupplier) {
//       const updated = suppliers.map((s) =>
//         s.id === selectedSupplier.id ? { ...s, ...data } : s
//       );
//       setSuppliers(updated);
//     }
//     closeModal();
//   };

//   const handleDelete = (id) => {
//     if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
//       setSuppliers(suppliers.filter((s) => s.id !== id));
//     }
//   };

//   const handleSearchSubmit = () => {
//     // Placeholder cho API call
//     closeSearchModal();
//   };

//   const handleFilterSubmit = () => {
//     // Placeholder cho API call
//     closeFilterModal();
//   };

//   return (
//     <div className="table-card">
//       <div className="table-header">
//         <h2 className="table-title">Quản lý nhà cung cấp</h2>
//         <div>
//           <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
//           <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
//           <button onClick={() => openModal('add')} className="action-button">Thêm nhà cung cấp</button>
//           <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
//         </div>
//       </div>

//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Tên</th>
//               <th>Điện thoại</th>
//               <th>Email</th>
//               <th>Địa chỉ</th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {suppliers.map((s) => (
//               <tr key={s.id}>
//                 <td>{s.id}</td>
//                 <td>{s.name}</td>
//                 <td>{s.phone}</td>
//                 <td>{s.email}</td>
//                 <td>{s.address}</td>
//                 <td>
//                   <button onClick={() => openModal('edit', supplier)} className="action-icon edit">
//                     <Edit className="icon" />
//                   </button>
//                   <button onClick={() => handleDelete(s.id)} className="action-icon delete">
//                     <Trash className="icon" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {modalVisible && (
//         <GeneralModalForm
//           section="suppliers"
//           mode={modalMode}
//           initialData={selectedSupplier}
//           onClose={closeModal}
//           onSubmit={handleSubmit}
//         />
//       )}
//     </div>
//   );
// };

// export default SupplierManager;

import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import * as supplierApi from "../services/supplierApi";

const SupplierManager = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: ""
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    supplierApi.getAllSuppliers()
      .then(data => setSuppliers(data))
      .catch(err => alert(err.message));
  };

  const openModal = (mode, supplier = null) => {
    setModalMode(mode);
    setModalVisible(true);

    if (mode === "edit" && supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.TenNCC || "",
        phone: supplier.SoDienThoai || "",
        email: supplier.Email || "",
        address: supplier.DiaChi || "",
        note: supplier.GhiChu || ""
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        note: ""
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSupplier(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      note: ""
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
    const payload = {
      TenNCC: formData.name,
      SoDienThoai: formData.phone,
      Email: formData.email,
      DiaChi: formData.address,
      GhiChu: formData.note
    };

    if (modalMode === "add") {
      supplierApi.addSupplier(payload)
        .then(() => {
          fetchSuppliers();
          closeModal();
        })
        .catch(err => setError(err.message));
    } else if (modalMode === "edit" && selectedSupplier) {
      supplierApi.updateSupplier(selectedSupplier.MaNCC, payload)
        .then(() => {
          fetchSuppliers();
          closeModal();
        })
        .catch(err => setError(err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
      supplierApi.deleteSupplier(id)
        .then(() => fetchSuppliers())
        .catch(err => alert(err.message));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý nhà cung cấp</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Ngày hợp tác</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.MaNCC}>
                <td>{s.MaNCC}</td>
                <td>{s.TenNCC}</td>
                <td>{s.SoDienThoai}</td>
                <td>{s.Email}</td>
                <td>{s.DiaChi}</td>
                <td>{s.NgayHopTac || "Chưa cập nhật"}</td>
                <td>{s.GhiChu}</td>
                <td>
                  <button onClick={() => openModal("edit", s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.MaNCC)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <GeneralModalForm
          showModal={modalVisible}
          closeModal={closeModal}
          currentSection="suppliers"
          modalType={modalMode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          error={null}
        />
      )}
    </div>
  );
};

export default SupplierManager;

// import React, { useState, useEffect } from 'react';
// import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
// import { initialSuppliers } from '../data/initialData';
// import GeneralModalForm from '../components/GeneralModalForm';
// import SearchModal from '../components/SearchModal';
// import FilterModal from '../components/FilterModal';

// const SupplierManager = () => {
//   const [suppliers, setSuppliers] = useState(initialSuppliers);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [currentItem, setCurrentItem] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [error, setError] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const [searchFormData, setSearchFormData] = useState({});
//   const [filterFormData, setFilterFormData] = useState({});
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   useEffect(() => {
//     // Placeholder cho API call
//     // fetchSuppliers().then(data => setSuppliers(data));
//   }, []);

//   const openModal = (type, item = null) => {
//     setModalType(type);
//     setCurrentItem(item);
//     setFormData(item || {});
//     setShowModal(true);
//     setError('');
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({});
//     setCurrentItem(null);
//     setError('');
//   };

//   const openSearchModal = () => setShowSearchModal(true);
//   const openFilterModal = () => setShowFilterModal(true);
//   const closeSearchModal = () => setShowSearchModal(false);
//   const closeFilterModal = () => setShowFilterModal(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSearchInputChange = (e) => {
//     const { name, value } = e.target;
//     setSearchFormData({ ...searchFormData, [name]: value });
//   };

//   const handleFilterInputChange = (e) => {
//     const { name, value } = e.target;
//     setFilterFormData({ ...filterFormData, [name]: value });
//   };

//   const sortData = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//     const sortedData = [...suppliers].sort((a, b) => {
//       if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
//       if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
//       return 0;
//     });
//     setSuppliers(sortedData);
//   };

//   const exportToCSV = () => {
//     const headers = Object.keys(suppliers[0]).join(',');
//     const rows = suppliers.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
//     const csv = `${headers}\n${rows}`;
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'suppliers.csv';
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const validateForm = () => {
//     if (!formData.name || !formData.phone || !formData.email || !formData.address) {
//       setError('Vui lòng điền đầy đủ các trường bắt buộc.');
//       return false;
//     }
//     if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//       setError('Email không hợp lệ.');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     const newItem = { ...formData, id: Date.now() };
//     if (modalType === 'add') {
//       setSuppliers([...suppliers, newItem]);
//     } else if (modalType === 'edit' && currentItem) {
//       setSuppliers(suppliers.map(item => (item.id === currentItem.id ? { ...newItem, id: item.id } : item)));
//     }
//     closeModal();
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
//       setSuppliers(suppliers.filter(item => item.id !== id));
//     }
//   };

//   const handleSearchSubmit = () => {
//     // Placeholder cho API call
//     closeSearchModal();
//   };

//   const handleFilterSubmit = () => {
//     // Placeholder cho API call
//     closeFilterModal();
//   };

//   return (
//     <div className="table-card">
//       <div className="table-header">
//         <h2 className="table-title">Quản lý nhà cung cấp</h2>
//         <div>
//           <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
//           <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
//           <button onClick={() => openModal('add')} className="action-button">Thêm nhà cung cấp</button>
//           <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
//         </div>
//       </div>
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('name')}>Tên <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('phone')}>Điện thoại <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('email')}>Email <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('address')}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {suppliers.map((supplier) => (
//               <tr key={supplier.id}>
//                 <td>{supplier.id}</td>
//                 <td>{supplier.name}</td>
//                 <td>{supplier.phone}</td>
//                 <td>{supplier.email}</td>
//                 <td>{supplier.address}</td>
//                 <td>
//                   <button onClick={() => openModal('edit', supplier)} className="action-icon edit">
//                     <Edit className="icon" />
//                   </button>
//                   <button onClick={() => handleDelete(supplier.id)} className="action-icon delete">
//                     <Trash className="icon" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <GeneralModalForm
//         showModal={showModal}
//         closeModal={closeModal}
//         modalType={modalType}
//         currentSection="suppliers"
//         formData={formData}
//         handleInputChange={handleInputChange}
//         handleSubmit={handleSubmit}
//         error={error}
//       />
//       <SearchModal
//         showSearchModal={showSearchModal}
//         closeSearchModal={closeSearchModal}
//         currentSection="suppliers"
//         searchFormData={searchFormData}
//         handleSearchInputChange={handleSearchInputChange}
//         handleSearchSubmit={handleSearchSubmit}
//       />
//       <FilterModal
//         showFilterModal={showFilterModal}
//         closeFilterModal={closeFilterModal}
//         currentSection="suppliers"
//         filterFormData={filterFormData}
//         handleFilterInputChange={handleFilterInputChange}
//         handleFilterSubmit={handleFilterSubmit}
//       />
//     </div>
//   );
// };

// export default SupplierManager;