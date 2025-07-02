import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../App.css";

function PermissionModal({
  isOpen,
  onClose,
  permissionAccount,
  allPermissions = [],
  rolePermissionIDs = [],
  grantedPermissionIDs = [],
  deniedPermissionIDs = [],
  onSubmit,
}) {
  const [grantedPermissions, setGrantedPermissions] = useState([]);
  const [deniedPermissions, setDeniedPermissions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setGrantedPermissions(grantedPermissionIDs || []);
      setDeniedPermissions(deniedPermissionIDs || []);
    }
  }, [isOpen, grantedPermissionIDs, deniedPermissionIDs]);

  if (!isOpen || !permissionAccount) return null;

  const isChecked = (permissionId) => {
    if (grantedPermissions.includes(permissionId)) return true;
    if (rolePermissionIDs.includes(permissionId) && !deniedPermissions.includes(permissionId)) return true;
    return false;
  };

  const handleCheckboxChange = (permissionId) => {
    if (isChecked(permissionId)) {
      // Bỏ tick
      if (grantedPermissions.includes(permissionId)) {
        setGrantedPermissions((prev) => prev.filter((id) => id !== permissionId));
      } else if (rolePermissionIDs.includes(permissionId)) {
        setDeniedPermissions((prev) => [...prev, permissionId]);
      }
    } else {
      // Tick
      if (deniedPermissions.includes(permissionId)) {
        setDeniedPermissions((prev) => prev.filter((id) => id !== permissionId));
      } else if (!rolePermissionIDs.includes(permissionId)) {
        setGrantedPermissions((prev) => [...prev, permissionId]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      granted: grantedPermissions,
      denied: deniedPermissions,
    });
  };

  // Gom quyền theo module và loại quyền
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
            Phân quyền cho: <span className="highlight">{permissionAccount.TenDangNhap}</span>
          </h2>
          <button onClick={onClose} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <table className="permission-table">
            <thead>
              <tr>
                <th>CHỨC NĂNG</th>
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
                  {["view", "edit", "delete", "add"].map((actionKey) => {
                    const permission = actions[actionKey];
                    return (
                      <td key={actionKey} style={{ textAlign: "center" }}>
                        {permission ? (
                          <input
                            type="checkbox"
                            checked={isChecked(permission.PermissionID)}
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

          <div className="modal-actions">
            <button type="submit" className="action-button">
              Lưu
            </button>
            <button type="button" onClick={onClose} className="action-button cancel">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PermissionModal;
