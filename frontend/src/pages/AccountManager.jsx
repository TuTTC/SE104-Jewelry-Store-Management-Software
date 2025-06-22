import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";

function AccountManager({ initialAccounts = [] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedAccount, setSelectedAccount] = useState(null);

  const openModal = (mode, data = null) => {
    setModalMode(mode);
    setSelectedAccount(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tài khoản này?")) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (modalMode === "add") {
      const newAccount = {
        id: Date.now(),
        ...formData,
      };
      setAccounts((prev) => [...prev, newAccount]);
    } else if (modalMode === "edit") {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === selectedAccount.id ? { ...acc, ...formData } : acc))
      );
    }
    closeModal();
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
              <th>Tên</th>
              <th>Chức vụ</th>
              <th>Mã tài khoản</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.position}</td>
                <td>{a.accountCode}</td>
                <td>{a.email}</td>
                <td>{a.phone}</td>
                <td>{a.address}</td>
                <td>
                  <span className={a.status === "Active" ? "status-instock" : "status-inactive"}>
                    {a.status}
                  </span>
                </td>
                <td>{a.role}</td>
                <td>
                  <button
                    onClick={() => openModal("edit", a)}
                    className="action-icon edit"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
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

      <GeneralModalForm
        isOpen={isModalOpen}
        onClose={closeModal}
        section="accounts"
        mode={modalMode}
        data={selectedAccount}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AccountManager;
