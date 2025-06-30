import React, { useState, useEffect } from "react";
import "../App.css";

function PermissionModal({
  isOpen,
  onClose,
  permissionAccount,
  allPermissions = [],
  userPermissions = [],
  onSubmit,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPermissions(userPermissions || []);
    }
  }, [isOpen, userPermissions]);

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (!isOpen || !permissionAccount) return null;

  // Gom quyền theo module và loại quyền (view, edit, delete, create)
  const groupedPermissions = {};

  allPermissions.forEach((p) => {
    const [module, action] = p.TenQuyen.split(":");
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = {};
    }
    groupedPermissions[module][action] = p;
  });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            Phân quyền cho:{" "}
            <span className="highlight">{permissionAccount.TenDangNhap}</span>
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <table className="permission-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Xem</th>
                <th>Sửa</th>
                <th>Xóa</th>
                <th>Thêm</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([module, actions]) => (
                <tr key={module}>
                  <td>{module.toUpperCase()}</td>
                  {["view", "edit", "delete", "create"].map((actionKey) => {
                    const permission = actions[actionKey];
                    return (
                      <td key={actionKey} style={{ textAlign: "center" }}>
                        {permission ? (
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.PermissionID)}
                            onChange={() => handleCheckboxChange(permission.PermissionID)}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="action-button secondary">
            Hủy
          </button>
          <button onClick={() => onSubmit(selectedPermissions)} className="action-button">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionModal;
