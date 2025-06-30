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

  const handleSave = () => {
    onSubmit(selectedPermissions);
  };

  if (!isOpen || !permissionAccount) return null;

  // Nhóm quyền theo module
  const groupedPermissions = {};
  allPermissions.forEach((p) => {
    const [module] = p.TenQuyen.split(":");
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = [];
    }
    groupedPermissions[module].push(p);
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
          {Object.entries(groupedPermissions).map(([module, permissions]) => (
            <div key={module} className="permission-group">
              <h4 className="module-title">{module.toUpperCase()}</h4>
              <div className="permission-checkboxes">
                {permissions.map((p) => (
                  <label key={p.PermissionID} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.PermissionID)}
                      onChange={() => handleCheckboxChange(p.PermissionID)}
                    />
                    {p.MoTa}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="action-button secondary">
            Hủy
          </button>
          <button onClick={handleSave} className="action-button">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionModal;
