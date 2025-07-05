import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle, X, Edit2 } from "lucide-react";
import userApi from "../services/userApi"; // Đảm bảo đường dẫn đúng

const Profile = () => {
  const { user, setUser } = useAuth() || {};
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});

  // Lấy dữ liệu từ API khi load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userApi.getCurrentUser();
        setProfileData({
          accountCode: data.UserID,
          HoTen: data.HoTen,
          TenDangNhap: data.TenDangNhap,
          Email: data.Email,
          SoDienThoai: data.SoDienThoai,
          DiaChi: data.DiaChi,
          position: data.VaiTro, // từ vaitro.TenVaiTro
        });

        setEditData({
          HoTen: data.HoTen,
          TenDangNhap: data.TenDangNhap,
          Email: data.Email,
          SoDienThoai: data.SoDienThoai,
          DiaChi: data.DiaChi,
        });


      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleSave = async () => {
    try {
      const updatePayload = {
        HoTen: editData.HoTen,
        Email: editData.Email,
        SoDienThoai: editData.SoDienThoai,
        DiaChi: editData.DiaChi,
      };
      const updatedUser = await userApi.updateCurrentUser(updatePayload);
      setProfileData((prev) => ({
        ...prev,
        name: updatedUser.HoTen,
        email: updatedUser.Email,
        phone: updatedUser.SoDienThoai,
        location: updatedUser.DiaChi,
      }));

      setIsEditing(false);
      if (setUser) {
        setUser(updatedUser); // Cập nhật AuthContext nếu cần
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "position") return;
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  if (loading || !profileData) {
    return <div className="dashboard-content">Đang tải thông tin...</div>;
  }

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

          {/* Avatar và tên/email */}
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
            <ProfileField label="Mã tài khoản" value={profileData.accountCode} />

            {/* Họ tên */}
            <ProfileField
              label="Họ tên"
              isEditing={isEditing}
              value={editData.HoTen}
              onChange={(val) => handleInputChange("HoTen", val)}
            />

            {/* Tên đăng nhập */}
            <ProfileField
              label="Tên đăng nhập"
              isEditing={isEditing}
              value={editData.TenDangNhap}
              onChange={(val) => handleInputChange("TenDangNhap", val)}
            />

            {/* Chức vụ */}
            <ProfileField label="Chức vụ" value={profileData.position} />

            {/* Email */}
            <ProfileField
              label="Email"
              isEditing={isEditing}
              value={editData.Email}
              onChange={(val) => handleInputChange("Email", val)}
            />

            {/* Số điện thoại */}
            <ProfileField
              label="Số điện thoại"
              isEditing={isEditing}
              value={editData.SoDienThoai}
              onChange={(val) => handleInputChange("SoDienThoai", val)}
            />

            {/* Địa chỉ */}
            <ProfileField
              label="Địa chỉ"
              isEditing={isEditing}
              value={editData.DiaChi}
              onChange={(val) => handleInputChange("DiaChi", val)}
            />
          </div>


          {isEditing && (
            <button onClick={handleSave} className="profile-save-btn action-button mt-8">
              Cập nhật thông tin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Component phụ để tái sử dụng các trường thông tin
const ProfileField = ({ label, value, isEditing, onChange }) => {
  return (
    <div className="profile-field flex justify-between items-center mb-6">
      <span className="profile-label card-label">{label}</span>
      {isEditing && onChange ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="profile-input card-value border-0 p-0 text-right bg-transparent focus:outline-none"
        />
      ) : (
        <span className="profile-value card-value">{value}</span>
      )}
      <div className="profile-field-separator"></div>
    </div>
  );
};

export default Profile;
