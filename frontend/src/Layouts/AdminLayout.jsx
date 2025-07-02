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

import React from 'react';
import { LayoutDashboard, ShoppingCart, Gem, Users, UserCircle, LogOut } from 'lucide-react';
import { LuCircleUser } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import "../App.css"

const AdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "Quản lý tài khoản", icon: UserCircle, key: "accounts" },
    { label: "Quản lý sản phẩm", icon: Gem, key: "products" },
    { label: "Quản lý danh mục", icon: Gem, key: "categories" },
    { label: "Quản lý đơn hàng", icon: ShoppingCart, key: "orders" },
    { label: "Quản lý dịch vụ", icon: UserCircle, key: "services" },
    { label: "Quản lý nhập hàng", icon: ShoppingCart, key: "purchaseOrders" },
    { label: "Chi tiết phiếu nhập", icon: ShoppingCart, key: "purchaseOrderDetails" },
    { label: "Chi tiết phiếu dịch vụ", icon: UserCircle, key: "serviceDetails" },
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

  return (
    <div className="container">
      <aside className="sidebar">
        <h1 className="sidebar-title flex items-center gap-2 px-4 py-2">
          {/* Jewelry Admin */}
          <img src="/logoVTP.svg" alt="Jewelry Admin Logo" className="sidebar-logo" />
        </h1>
        <nav className="sidebar-nav">
          {menuItems.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => navigate(`/admin/${key}`)}
              className={window.location.pathname.includes(key) ? "sidebar-button active" : "sidebar-button"}
            >
              <Icon className="icon" />
              <span>{label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="sidebar-button">
            <LogOut className="icon" />
            <span>Đăng xuất</span>
          </button>
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
              <LuCircleUser className="icon" />
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
