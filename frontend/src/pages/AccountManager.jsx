import React, { useState, useEffect } from "react";
import { Edit, Trash, ShieldCheck } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import PermissionModal from "../components/PermissionModal";
import userApi from "../services/userApi";

function AccountManager() {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionAccount, setPermissionAccount] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  // Load tài khoản
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await userApi.getAllUsers();
      setAccounts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Modal tài khoản
  const openModal = (mode, data = null) => {
    setModalMode(mode);
    setSelectedAccount(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      await userApi.deleteUser(id);
      fetchAccounts();
    }
  };

  const handleSubmit = async (formData) => {
    if (modalMode === "add") {
      await userApi.createUser(formData);
    } else if (modalMode === "edit") {
      await userApi.updateUser(selectedAccount.UserID, formData);
    }
    fetchAccounts();
    closeModal();
  };

  // Modal phân quyền
  const openPermissionModal = async (account) => {
    try {
      const res = await userApi.getUserDetails(account.UserID);
      setPermissionAccount(account);
      setAllPermissions(res.data.TatCaQuyen);
      setUserPermissions(res.data.QuyenRiengIDs);
      setIsPermissionModalOpen(true);
    } catch (error) {
      console.error(error);
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

      <div className="table-container">
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
                  <button onClick={() => openPermissionModal(a)} className="action-icon">
                    <ShieldCheck className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GeneralModalForm
        isOpen={isModalOpen}
        onClose={closeModal}
        section="accounts"
        mode={modalMode}
        data={selectedAccount}
        onSubmit={handleSubmit}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={closePermissionModal}
        allPermissions={allPermissions}
        userPermissions={userPermissions}
        onSubmit={handleUpdatePermissions}
      />
    </div>
  );
}

export default AccountManager;
