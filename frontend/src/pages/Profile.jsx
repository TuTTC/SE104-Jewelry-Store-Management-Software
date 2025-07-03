import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle, X, Edit2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth() || {};
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    accountCode: "PTV001",
    name: user?.name || "Nguyễn Văn Admin",
    position:
      user?.role === "admin"
        ? "Quản trị viên"
        : user?.role === "manager"
        ? "Quản lý"
        : "Nhân viên",
    email: user?.email || "admin@ptvjewelry.com",
    phone: "+84 901 234 567",
    location: "Hồ Chí Minh, Việt Nam",
  });

  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // Gọi API để lưu thay đổi tại đây
    console.log("Saving profile data:", editData);
  };

  const handleInputChange = (field, value) => {
    // Không cho chỉnh sửa position
    if (field === "position") return;
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="dashboard-content">
      <div className="card">
        <div className="profile-card-content">
          <div className="profile-header flex items-center justify-between mb-12">
            <h2 className="profile-title">Thông tin cá nhân</h2>
            <button
              onClick={isEditing ? handleCancel : handleEdit}
              className="profile-edit-btn text-[#1F2937] hover:text-gray-600 transition-colors flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <X className="w-6 h-6" /> Hủy
                </>
              ) : (
                <>
                  <Edit2 className="w-6 h-6" /> Chỉnh sửa
                </>
              )}
            </button>
          </div>

          {/* Avatar và thông tin người dùng */}
          <div className="profile-user-info flex items-center gap-6 mb-8">
            <div className="profile-avatar-container relative">
              <div className="profile-avatar w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#c1a47e] to-[#6d5543] flex items-center justify-center">
                <UserCircle className="profile-avatar-icon w-[55px] h-[55px] text-white" />
              </div>
            </div>
            <div className="profile-user-details flex flex-col gap-2">
              <span className="profile-name card-value">{profileData.name}</span>
              <span className="profile-email card-label block">{profileData.email}</span>
            </div>
          </div>

          <div className="profile-separator w-full h-px bg-[#e0e0e0] mb-8"></div>

          {/* Các trường thông tin */}
          <div className="profile-fields flex flex-col gap-6">

            {/* Mã tài khoản */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Mã tài khoản</span>
              <span className="profile-value card-value">{profileData.accountCode}</span>
            </div>
            <div className="profile-field-separator"></div>

            {/* Tên tài khoản */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Tên tài khoản</span>
              {isEditing ? (
                <input
                  value={editData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="profile-input card-value border-0 p-0 text-right bg-transparent focus:outline-none"
                />
              ) : (
                <span className="profile-value card-value">{profileData.name}</span>
              )}
            </div>
            <div className="profile-field-separator"></div>

            {/* Chức vụ (Không cho chỉnh sửa) */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Chức vụ</span>
              <span className="profile-value card-value">{profileData.position}</span>
            </div>
            <div className="profile-field-separator"></div>

            {/* Email */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Email</span>
              {isEditing ? (
                <input
                  value={editData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="profile-input card-value border-0 p-0 text-right bg-transparent focus:outline-none"
                />
              ) : (
                <span className="profile-value card-value">{profileData.email}</span>
              )}
            </div>
            <div className="profile-field-separator"></div>

            {/* Số điện thoại */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Số điện thoại</span>
              {isEditing ? (
                <input
                  value={editData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="profile-input card-value border-0 p-0 text-right bg-transparent focus:outline-none"
                />
              ) : (
                <span className="profile-value card-value">{profileData.phone}</span>
              )}
            </div>
            <div className="profile-field-separator"></div>

            {/* Địa chỉ */}
            <div className="profile-field flex justify-between items-center mb-6">
              <span className="profile-label card-label">Địa chỉ</span>
              {isEditing ? (
                <input
                  value={editData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="profile-input card-value border-0 p-0 text-right bg-transparent focus:outline-none"
                />
              ) : (
                <span className="profile-value card-value">{profileData.location}</span>
              )}
            </div>
          </div>

          {/* Nút lưu */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="profile-save-btn action-button mt-8"
            >
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
