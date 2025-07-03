/// src/layouts/AdminLayout.jsx
// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "../pages/Sidebar";

// const AdminLayout = () => {
//   return (
//     <div className="app-container">
//       <Sidebar />
//       <div className="main-content">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Gem, Users, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { LuCircleUser } from "react-icons/lu";
import { useNavigate, Outlet, useLocation, Navigate } from 'react-router-dom';
import "../App.css"

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "Quản lý tài khoản", icon: UserCircle, key: "accounts" },
    { label: "Quản lý sản phẩm", icon: Gem, key: "products" },
    { label: "Quản lý danh mục", icon: Gem, key: "categories" },
    { label: "Quản lý đơn hàng", icon: ShoppingCart, key: "orders" },
    { label: "Quản lý dịch vụ", icon: UserCircle, key: "services" },
    { label: "Quản lý nhập hàng", icon: ShoppingCart, key: "purchaseOrders" },
    // { label: "Chi tiết phiếu nhập", icon: ShoppingCart, key: "purchaseOrderDetails" },
    // { label: "Chi tiết phiếu dịch vụ", icon: UserCircle, key: "serviceDetails" },
    { label: "Quản lý nhà cung cấp", icon: Users, key: "suppliers" },
    { label: "Quản lý tồn kho", icon: Gem, key: "inventory" },
    { label: "Báo cáo & Thống kê", icon: LayoutDashboard, key: "reports" },
    { label: "Quản lý tham số", icon: LayoutDashboard, key: "parameter" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  const handleProfileClick = () => {
    navigate('/admin/profile');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  return (
    <div className="container">
      <aside className="sidebar">
        <h1 className="sidebar-title flex items-center gap-2 px-4 py-2">
          PTV Jewelry
          <img src="/logoVTP.svg" alt="Jewelry Admin Logo" className="sidebar-logo" />
        </h1>
        <nav className="sidebar-nav">
          {menuItems.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => navigate(`/admin/${key}`)}
              className={location.pathname.includes(key) ? "sidebar-button active" : "sidebar-button"}
            >
              <Icon className="icon" />
              <span>{label}</span>
            </button>
          ))}
          

          {/* Dropdown tài khoản người dùng */}
          <div className="account-dropdown-wrapper mt-auto relative">
            <button
              onClick={toggleDropdown}
              className="sidebar-button flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <UserCircle className="icon" />
                <span>{user?.name || 'Tài khoản'}</span>
              </div>
              <ChevronDown className="icon" />
            </button>

            {isDropdownOpen && (
              <div
                className="dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '224px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  padding: '4px 0',
                }}
              >
                <button onClick={handleProfileClick} className="dropdown-item w-full text-left">
                  Thông tin cá nhân
                </button>
                <button onClick={handleLogout} className="dropdown-item logout w-full text-left">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

        </nav>
      </aside>
      <main className="main-content">
        <div className="header flex items-center px-4 py-2 border-b bg-white">
          <h1 className="main-title">
            {menuItems.find(item => window.location.pathname.includes(item.key))?.label || "Dashboard"}
          </h1>
          {user?.TenDangNhap && <p>Chào, {user.TenDangNhap}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }} className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              
              <span>{user?.TenDangNhap}</span>
            </div>
            {/* <button onClick={handleLogout} className="logout-button flex items-center gap-1">
              <LogOut className="icon" />
            </button> */}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
