
// src/pages/AccountManager.jsx
// import React, { useState, useEffect } from 'react';
// import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
// import { initialAccounts } from '../data/initialData'; // Updated import
// import GeneralModalForm from '../components/GeneralModalForm';
// import SearchModal from '../components/SearchModal';
// import FilterModal from '../components/FilterModal';

// const AccountManager = () => {
//   const [accounts, setAccounts] = useState(initialAccounts);
//   const [showModal, setShowModal] = useState(false);
//   const [modalType, setModalType] = useState('');
//   const [formData, setFormData] = useState({});
//   const [error, setError] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const [searchFormData, setSearchFormData] = useState({});
//   const [filterFormData, setFilterFormData] = useState({});

//   // Add missing state variables
//   const [currentItem, setCurrentItem] = useState(null);
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [showFilterModal, setShowFilterModal] = useState(false);

//   useEffect(() => {
//     // Placeholder for backend API call
//     // fetchAccounts().then(data => setAccounts(data));
//   }, []);

//   const openModal = (type, item = null) => {
//     setModalType(type);
//     setCurrentItem(item);
//     setFormData(item || {});
//     setShowModal(true);
//     setError("");
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setFormData({});
//     setCurrentItem(null);
//     setError("");
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

//     const sortedData = [...accounts].sort((a, b) => {
//       if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
//       if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
//       return 0;
//     });
//     setAccounts(sortedData);
//   };

//   const exportToCSV = () => {
//     const headers = Object.keys(accounts[0]).join(',');
//     const rows = accounts.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
//     const csv = `${headers}\n${rows}`;
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = "accounts.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const validateForm = () => {
//     if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.status || !formData.role) {
//       setError("Vui lòng điền đầy đủ các trường bắt buộc.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     const newItem = { ...formData, id: Date.now() };
//     if (modalType === "add") {
//       const newAccount = { ...newItem, status: "Active", role: formData.role || "customer" };
//       setAccounts([...accounts, newAccount]);
//       // Placeholder for backend API call
//       // postAccount(newAccount);
//     } else if (modalType === "edit" && currentItem) {
//       setAccounts(accounts.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
//       // Placeholder for backend API call
//       // updateAccount(currentItem.id, formData);
//     }
//     closeModal();
//   };

//   const handleDelete = (id) => {
//     if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
//       setAccounts(accounts.filter((item) => item.id !== id));
//       // Placeholder for backend API call
//       // deleteAccount(id);
//     }
//   };

//   const handleSearchSubmit = () => {
//     // Placeholder for backend API call with search params
//     // fetchAccounts(searchFormData).then(data => setAccounts(data));
//     closeSearchModal();
//   };

//   const handleFilterSubmit = () => {
//     // Placeholder for backend API call with filter params
//     // fetchAccounts(filterFormData).then(data => setAccounts(data));
//     closeFilterModal();
//   };

//   return (
//     <div className="table-card">
//       <div className="table-header">
//         <h2 className="table-title">Quản lý tài khoản</h2>
//         <div>
//           <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
//           <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
//           <button onClick={() => openModal("add")} className="action-button">Thêm tài khoản</button>
//           <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
//         </div>
//       </div>
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("name")}>Tên <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("position")}>Chức vụ <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("accountCode")}>Mã tài khoản <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("email")}>Email <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("phone")}>Điện thoại <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("address")}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("status")}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData("role")}>Vai trò <ArrowUpDown className="sort-icon" /></th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {accounts.map((a) => (
//               <tr key={a.id}>
//                 <td>{a.id}</td>
//                 <td>{a.name}</td>
//                 <td>{a.position}</td>
//                 <td>{a.accountCode}</td>
//                 <td>{a.email}</td>
//                 <td>{a.phone}</td>
//                 <td>{a.address}</td>
//                 <td>
//                   <span className={a.status === "Active" ? "status-instock" : "status-inactive"}>
//                     {a.status}
//                   </span>
//                 </td>
//                 <td>{a.role}</td>
//                 <td>
//                   <button onClick={() => openModal("edit", a)} className="action-icon edit">
//                     <Edit className="icon" />
//                   </button>
//                   <button onClick={() => handleDelete(a.id)} className="action-icon delete">
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
//         currentSection="accounts"
//         formData={formData}
//         handleInputChange={handleInputChange}
//         handleSubmit={handleSubmit}
//         error={error}
//       />
//       <SearchModal
//         showSearchModal={showSearchModal}
//         closeSearchModal={closeSearchModal}
//         currentSection="accounts"
//         searchFormData={searchFormData}
//         handleSearchInputChange={handleSearchInputChange}
//         handleSearchSubmit={handleSearchSubmit}
//       />
//       <FilterModal
//         showFilterModal={showFilterModal}
//         closeFilterModal={closeFilterModal}
//         currentSection="accounts"
//         filterFormData={filterFormData}
//         handleFilterInputChange={handleFilterInputChange}
//         handleFilterSubmit={handleFilterSubmit}
//       />
//     </div>
//   );
// };

// export default AccountManager;



import React, { useState, useEffect } from "react";
import { Edit, Trash, ShieldCheck } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import PermissionModal from "../components/PermissionModal";
import userApi from "../services/userApi";
import permissionApi from "../services/permissionApi";

function AccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTab, setSelectedTab] = useState("userlists");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionAccount, setPermissionAccount] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  // Load tài khoản
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await userApi.getAllUsers();
      console.log("DATA FROM API:", data);
      setAccounts(data);  // Hoặc lưu state gì đó
    } catch (error) {
      console.error(error);
    }
  };


  // Modal tài khoản
  const openModal = (mode, data = null) => {
    setModalMode(mode);
    setSelectedAccount(data);
    if (mode === "edit" && data) {
      setFormData({
        name: data.TenDangNhap || "",
        accountCode: data.MaTaiKhoan || "",
        email: data.Email || "",
        phone: data.DienThoai || "",
        address: data.DiaChi || "",
        position: data.ChucVu || "",
        role: data.VaiTro || "",
      });
    } else {
      setFormData({});
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
    setFormData({});
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitForm = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }
    try {
      if (modalMode === "add") {
        await userApi.createUser(formData);
      } else if (modalMode === "edit" && selectedAccount) {
        await userApi.updateUser(selectedAccount.UserID, formData);
      }
      fetchAccounts();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi lưu dữ liệu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      try {
        await userApi.deleteUser(id);
        fetchAccounts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Modal phân quyền
  const openPermissionModal = async (account) => {
  try {
    console.log("Mở modal phân quyền cho:", account);

    const res = await permissionApi.getUserPermissions(account.UserID);

    console.log("Kết quả API getUserPermissions:", res);

    setPermissionAccount(account);
    setAllPermissions(res.TatCaQuyen);  // Mảng tất cả quyền
    setUserPermissions(res.QuyenRiengIDs); // Danh sách ID quyền riêng
    setIsPermissionModalOpen(true);

    console.log("Danh sách tất cả quyền:", res.data.TatCaQuyen);
    console.log("Danh sách quyền riêng:", res.data.QuyenRiengIDs);
  } catch (err) {
    console.error("Lỗi khi lấy quyền người dùng:", err);
  }
};

  const closePermissionModal = () => {
    setPermissionAccount(null);
    setAllPermissions([]);
    setUserPermissions([]);
    setIsPermissionModalOpen(false);
  };

  const handleUpdatePermissions = async (selectedPermissionIDs) => {
    try {
      await userApi.updateUserPermissions(permissionAccount.UserID, selectedPermissionIDs);
      closePermissionModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý tài khoản</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm tài khoản
        </button>
      </div>

      <div className="tabs">
        {[
          { key: "userlists", label: "Danh sách tài khoản" },
          { key: "userpermissions", label: "Phân quyền" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={selectedTab === tab.key ? "tab active" : "tab"}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {selectedTab === "userlists" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.UserID}>
                  <td>{a.UserID}</td>
                  <td>{a.TenDangNhap}</td>
                  <td>{a.Email}</td>
                  <td>{a.VaiTro}</td>
                  <td>{new Date(a.TaoNgay).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => openModal("edit", a)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                    <button onClick={() => handleDelete(a.UserID)} className="action-icon delete">
                      <Trash className="icon" />
                    </button>
                    {/* <button onClick={() => openPermissionModal(a)} className="action-icon">
                      <ShieldCheck className="icon" />
                      
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedTab === "userpermissions" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.UserID}>
                  <td>{a.UserID}</td>
                  <td>{a.TenDangNhap}</td>
                  <td>{a.Email}</td>
                  <td>{a.VaiTro}</td>
                  <td>{new Date(a.TaoNgay).toLocaleDateString()}</td>
                  <td>
                    {/* <button onClick={() => openModal("edit", a)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                    <button onClick={() => handleDelete(a.UserID)} className="action-icon delete">
                      <Trash className="icon" />
                    </button> */}
                    <button onClick={() => openPermissionModal(a)} className="action-icon">
                      <ShieldCheck className="icon" />
                      
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === "add" ? "Thêm tài khoản" : "Chỉnh sửa tài khoản"}</h3>
            <GeneralModalForm
              showModal={isModalOpen}
              closeModal={closeModal}
              modalType="accounts"
              currentSection="accounts"
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={submitForm}
              error={error}
            />
            <div className="modal-actions">
              <button onClick={submitForm} className="action-button">
                Lưu
              </button>
              <button onClick={closeModal} className="action-button cancel">
                Hủy
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      )}

      <PermissionModal
      isOpen={isPermissionModalOpen}
      onClose={closePermissionModal}
      permissionAccount={permissionAccount}
      allPermissions={allPermissions}
      userPermissions={userPermissions}
      onSubmit={handleUpdatePermissions}
    />

    </div>
  );
}

export default AccountManager;
