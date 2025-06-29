import React, { useEffect, useState } from "react";
import "../App.css"; // Giả sử CSS modal bạn để trong đây

function PermissionModal({ isOpen, onClose, account }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    if (isOpen && account) {
      fetchAllPermissions();
      fetchUserPermissions();
    }
  }, [isOpen, account]);

  const fetchAllPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      if (!res.ok) throw new Error("Lỗi lấy danh sách quyền");
      const data = await res.json();
      setAllPermissions(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const res = await fetch(`/api/users/${account.UserID}/details`);
      if (!res.ok) throw new Error("Lỗi lấy quyền người dùng");
      const data = await res.json();
      setUserPermissions(data.QuyenRiengIDs || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckboxChange = (permissionId) => {
    setUserPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${account.UserID}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: userPermissions,
        }),
      });
      if (!res.ok) throw new Error("Lỗi cập nhật quyền");
      alert("Cập nhật quyền thành công");
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Phân quyền cho: <span className="highlight">{account?.TenDangNhap}</span></h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          {allPermissions.map((p) => (
            <label key={p.PermissionID} className="checkbox-label">
              <input
                type="checkbox"
                checked={userPermissions.includes(p.PermissionID)}
                onChange={() => handleCheckboxChange(p.PermissionID)}
              />
              {p.MoTa}
            </label>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="action-button secondary">Hủy</button>
          <button onClick={handleSave} className="action-button">Lưu</button>
        </div>
      </div>
    </div>
  );
}

export default PermissionModal;
