// src/components/Sidebar.jsx
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Gem,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";
import "../App.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role") || "Guest";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = useMemo(() => [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Quản lý tài khoản", icon: UserCircle, path: "/admin/accounts" },
    { label: "Quản lý sản phẩm", icon: Gem, path: "/admin/products" },
    { label: "Quản lý danh mục", icon: Gem, path: "/admin/categories" },
    { label: "Quản lý đơn hàng", icon: ShoppingCart, path: "/admin/orders" },
    { label: "Quản lý dịch vụ", icon: UserCircle, path: "/admin/services" },
    { label: "Quản lý nhập hàng", icon: ShoppingCart, path: "/admin/purchaseOrders" },
    { label: "Quản lý nhà cung cấp", icon: Users, path: "/admin/suppliers" },
    { label: "Quản lý tồn kho", icon: Gem, path: "/admin/inventory" },
    { label: "Báo cáo & Thống kê", icon: LayoutDashboard, path: "/admin/reports" },
    { label: "Quản lý tham số", icon: LayoutDashboard, path: "/admin/parameter" },
  ], []);

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Jewelry Admin</h1>
      <nav className="sidebar-nav">
        {menuItems.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={
              location.pathname === path
                ? "sidebar-button active"
                : "sidebar-button"
            }
            disabled={!isAuthenticated}
          >
            <Icon className="icon" />
            <span>{label}</span>
          </button>
        ))}

        {isAuthenticated && (
          <button onClick={handleLogout} className="sidebar-button logout-button">
            <LogOut className="icon" />
            <span>Đăng xuất</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <p>Vai trò: <strong>{userRole}</strong></p>
      </div>
    </aside>
  );
};

export default Sidebar;
