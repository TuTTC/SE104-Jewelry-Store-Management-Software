import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Gem,
  Users,
  UserCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useNavigate, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth() || { user: null, logout: () => {} };
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Điều hướng mặc định khi vào đúng /admin (và chỉ khi đó)
  useEffect(() => {
    if (user && location.pathname === '/admin') {
      navigate('/admin/dashboard');
    }
  }, [user, location.pathname, navigate]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { label: 'Quản lý tài khoản', icon: UserCircle, key: 'accounts' },
    { label: 'Quản lý sản phẩm', icon: Gem, key: 'products' },
    { label: 'Quản lý danh mục', icon: Gem, key: 'categories' },
    { label: 'Quản lý đơn hàng', icon: ShoppingCart, key: 'orders' },
    { label: 'Quản lý dịch vụ', icon: UserCircle, key: 'services' },
    { label: 'Quản lý nhập hàng', icon: ShoppingCart, key: 'purchaseOrders' },
    { label: 'Chi tiết phiếu nhập', icon: ShoppingCart, key: 'purchaseOrderDetails' },
    { label: 'Chi tiết phiếu dịch vụ', icon: UserCircle, key: 'serviceDetails' },
    { label: 'Quản lý nhà cung cấp', icon: Users, key: 'suppliers' },
    { label: 'Quản lý tồn kho', icon: Gem, key: 'inventory' },
    { label: 'Báo cáo & Thống kê', icon: LayoutDashboard, key: 'reports' },
  ];

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    }
  };

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
              className={
                location.pathname.includes(key)
                  ? 'sidebar-button active'
                  : 'sidebar-button'
              }
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
        <div className="header">
          <h1 className="main-title">
            {menuItems.find((item) =>
              location.pathname.includes(item.key)
            )?.label || 'Dashboard'}
          </h1>
          {user && <p>Chào, {user.name} ({user.role})</p>}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
