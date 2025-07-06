import React, { useState, useEffect } from "react";
import { Edit, Trash, ShieldCheck, Filter, ArrowUpDown } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import PermissionModal from "../components/PermissionModal";
import userApi from "../services/userApi";
import permissionApi from "../services/permissionApi";
import Pagination from '../components/Pagination';

function AccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTab, setSelectedTab] = useState("userlists");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionAccount, setPermissionAccount] = useState(null);
  
  const [allPermissions, setAllPermissions] = useState([]);  // Toàn bộ quyền hệ thống
  const [rolePermissions, setRolePermissions] = useState([]); // Quyền mặc định theo vai trò
  const [userGrantedPermissions, setUserGrantedPermissions] = useState([]); // Quyền riêng được cấp thêm
  const [userDeniedPermissions, setUserDeniedPermissions] = useState([]);  // Quyền riêng bị từ chối
  const [data, setData] = useState([]); // State lưu dữ liệu hiển thị
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // State để lưu cột đang sắp xếp và chiều sắp xếp
  const [showRoleFilter, setShowRoleFilter] = useState(false);  // State để hiện/ẩn filter vai trò
  const [selectedRole, setSelectedRole] = useState("");  // State để lưu vai trò đang chọn để lọc
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load tài khoản
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    setData(accounts);
  }, [accounts]);

  const fetchAccounts = async () => {
    try {
      const fetchedData = await userApi.getAllUsers();
      console.log("DATA FROM API:", fetchedData);
      setAccounts(fetchedData);
      setData(fetchedData);
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
// Phân trang 
// Định nghĩa bộ lọc cho từng tab (nếu có)
const tabFilters = {
  list: null, // Không lọc
  active: (item) => item.status === "Active", // Ví dụ: Lọc tài khoản đang hoạt động
  inactive: (item) => item.status === "Inactive", // Ví dụ: Lọc tài khoản không hoạt động
  // Thêm các tab khác nếu cần
};

// Lấy bộ lọc cho tab hiện tại
const filterFn = tabFilters[selectedTab] || null;
const filteredData = filterFn ? data.filter(filterFn) : data;

// Tính toán phân trang
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

useEffect(() => {
  setCurrentPage(1); // Đặt lại về trang 1 khi tab thay đổi
  }, [selectedTab]);

const convertRoleNameToValue = (name) => {
  if (name === "Admin") return "admin";
  if (name === "Nhân viên") return "employee";
  if (name === "Khách hàng") return "customer";
  return "";
};

// Modal tài khoản
const openModal = (mode, data = null) => {
  setModalMode(mode);
  setSelectedAccount(data);

  if (mode === "add" || mode === "edit") {
    setFormData({
      username: data?.TenDangNhap || "",
      password: "",
      email: data?.Email || "",
      fullName: data?.HoTen || "",
      phone: data?.SoDienThoai || "",
      address: data?.DiaChi || "",
      createdAt: data?.TaoNgay ? data.TaoNgay.slice(0, 10) : "",
      role: convertRoleNameToValue(data?.VaiTro) || "",
      status: data?.TrangThai === "Kích hoạt" ? "true" : "false"
    });

  } else {
    setFormData({
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      address: "",
      createdAt: "",
      role: "",
      status: ""
    });
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

  const submitForm = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.role || (modalMode === "add" && !formData.password)) {
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
      const [detailRes, roleRes] = await Promise.all([
        permissionApi.getUserPermissionsDetail(account.UserID),
        permissionApi.getRolePermissions(account.UserID),
      ]);
      setPermissionAccount(account);
      setAllPermissions(detailRes.AllPermissions);
      setUserGrantedPermissions(detailRes.GrantedPermissionIDs);
      setUserDeniedPermissions(detailRes.DeniedPermissionIDs);
      setRolePermissions(roleRes.RolePermissionIDs);
      setIsPermissionModalOpen(true);
      console.log("Tất cả quyền:", detailRes.AllPermissions);
      console.log("Quyền riêng được cấp:", detailRes.GrantedPermissionIDs);
      console.log("Quyền riêng bị từ chối:", detailRes.DeniedPermissionIDs);
      console.log("Quyền mặc định theo vai trò:", roleRes.RolePermissionIDs);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu phân quyền:", err);
    }
  };

  const closePermissionModal = () => {
    setPermissionAccount(null);
    setAllPermissions([]);
    setUserGrantedPermissions([]);
    setUserDeniedPermissions([]);
    setRolePermissions([]);
    setIsPermissionModalOpen(false);
  };

  const handleSavePermissions = async ({ granted, denied }) => {
    try {
      await permissionApi.updateUserPermissions(permissionAccount.UserID, { granted, denied });
      alert("Cập nhật quyền thành công!");
      setIsPermissionModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật quyền.");
    }
  };

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === null && b[key] === null) return 0;
      if (typeof a[key] === "string") {
        const nameA = a[key].toLowerCase();
        const nameB = b[key].toLowerCase();
        return direction === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setData(sortedData);
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setSelectedRole(value);
    if (value === "") {
      setData(accounts);
    } else {
      const filteredData = accounts.filter((item) => item.VaiTro === value);
      setData(filteredData);
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        {selectedTab === "userlists" && (
        <button onClick={() => openModal("add")} className="action-button">
          Thêm tài khoản
        </button>
        )}
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
                <th onClick={() => sortData("UserID")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("TenDangNhap")}>Tên đăng nhập <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("Email")}>Email <ArrowUpDown className="sort-icon" /></th>
                <th className="relative">
                  Vai Trò 
                  <Filter className="sort-icon" onClick={() => setShowRoleFilter(!showRoleFilter)} style={{ cursor: "pointer" }} />
                  {showRoleFilter && (
                    <div className="filter-popup">
                      <select value={selectedRole} onChange={handleRoleChange}>
                        <option value="">Tất cả</option>
                        {Array.from(new Set(accounts.map(p => p.VaiTro))).map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </th>
                <th onClick={() => sortData("TaoNgay")}>Ngày tạo <ArrowUpDown className="sort-icon" /></th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((a, index) => (
                <tr key={a.UserID}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{a.TenDangNhap}</td>
                  <td>{a.Email}</td>
                  <td>{a.VaiTro}</td>
                  <td>{new Date(a.TaoNgay).toLocaleDateString()}</td>
                  <td>
                    {a.TrangThai === "Kích hoạt" ? (
                      <span className="status-instock">Kích hoạt</span>
                    ) : (
                      <span className="status-inactive">Khóa</span>
                    )}
                  </td>

                  <td>
                    <button onClick={() => openModal("edit", a)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                    <button onClick={() => handleDelete(a.UserID)} className="action-icon delete">
                      <Trash className="icon" />
                    </button>
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
                <th onClick={() => sortData("UserID")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("TenDangNhap")}>Tên đăng nhập <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("Email")}>Email <ArrowUpDown className="sort-icon" /></th>
                <th className="relative">
                  Vai Trò 
                  <Filter className="sort-icon" onClick={() => setShowRoleFilter(!showRoleFilter)} style={{ cursor: "pointer" }} />
                  {showRoleFilter && (
                    <div className="filter-popup">
                      <select value={selectedRole} onChange={handleRoleChange}>
                        <option value="">Tất cả</option>
                        {Array.from(new Set(accounts.map(p => p.VaiTro))).map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </th>
                <th onClick={() => sortData("TaoNgay")}>Ngày tạo <ArrowUpDown className="sort-icon" /></th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((a, index) => (
                <tr key={a.UserID}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{a.TenDangNhap}</td>
                  <td>{a.Email}</td>
                  <td>{a.VaiTro}</td>
                  
                  <td>{new Date(a.TaoNgay).toLocaleDateString()}</td>
                  <td>{a.TrangThai}</td>
                  <td>
                    <button onClick={() => openPermissionModal(a)} className="action-icon">
                      <ShieldCheck className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        />
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
              modalMode={modalMode}
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
        onClose={() => setIsPermissionModalOpen(false)}
        permissionAccount={permissionAccount}
        allPermissions={allPermissions}
        rolePermissionIDs={rolePermissions}
        grantedPermissionIDs={userGrantedPermissions}
        deniedPermissionIDs={userDeniedPermissions}
        onSubmit={handleSavePermissions}
      />
    </div>
  );
}

export default AccountManager;
