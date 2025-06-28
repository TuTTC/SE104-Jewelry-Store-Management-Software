import React, { useState, useEffect } from "react";
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, ShoppingCart, Gem, Users, UserCircle, X, Edit, Trash, LogOut, ArrowUpDown, Download, Search, Filter } from "lucide-react";
import Auth from "./Auth";

const initialData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 7000 },
];

const initialProducts = [
  { id: 1, code: "SP001", name: "Ruby Ring", price: "$1200", category: "Ring", quantity: 10, status: "In Stock", image: "https://via.placeholder.com/50", note: "Best Seller" },
  { id: 2, code: "SP002", name: "Sapphire Necklace", price: "$2500", category: "Necklace", quantity: 5, status: "Low Stock", image: "https://via.placeholder.com/50", note: "Limited Edition" },
];

const initialOrders = [
  { id: 101, orderCode: "ORD001", customer: "John Doe", date: "2024-04-01", total: "$3700", status: "Pending", paymentMethod: "Credit Card", deliveryAddress: "123 Main St, NY", note: "Gift wrap this order" },
  { id: 102, orderCode: "ORD002", customer: "Jane Smith", date: "2024-04-02", total: "$1200", status: "Pending", paymentMethod: "PayPal", deliveryAddress: "456 Elm St, CA", note: "Call before delivery" },
];

const initialCustomers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "(123) 456-7890", address: "123 Main St, NY", totalSpent: "$5000", status: "Active", customerCode: "KH001", role: "Customer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "(987) 654-3210", address: "456 Elm St, CA", totalSpent: "$3000", status: "Inactive", customerCode: "KH002", role: "Customer" },
  { id: 3, name: "Admin User", email: "admin@example.com", phone: "(555) 555-5555", address: "789 Admin St, TX", totalSpent: "$0", status: "Active", customerCode: "KH003", role: "Admin" },
];

const initialAccounts = [
  { id: 1, username: "alice", password: "alice123", name: "Alice Johnson", email: "alice@jewelry.com", role: "admin", status: "Active", accountCode: "TK001", phone: "(123) 456-7890", address: "123 Admin St", position: "Admin" },
  { id: 2, username: "bob", password: "bob123", name: "Bob Lee", email: "bob@jewelry.com", role: "customer", status: "Active", accountCode: "TK002", phone: "(987) 654-3210", address: "456 Customer St", position: "Customer" },
];

const initialCategories = [
  { id: 1, name: "Ring", description: "Jewelry rings" },
  { id: 2, name: "Necklace", description: "Jewelry necklaces" },
];

const initialServices = [
  { id: 1, code: "DV001", name: "Thiết kế theo yêu cầu", price: 500.00, description: "Thiết kế trang sức tùy chỉnh", status: true },
  { id: 2, code: "DV002", name: "Sửa chữa trang sức", price: 300.00, description: "Sửa chữa và đánh bóng", status: true },
];

const initialPurchaseOrders = [
  { id: 1, code: "PN001", supplier: "Supplier A", date: "2024-05-01", total: 10000.00, status: "Đã nhập" },
  { id: 2, code: "PN002", supplier: "Supplier B", date: "2024-05-02", total: 5000.00, status: "Đang xử lý" },
];

const initialSuppliers = [
  { id: 1, name: "Supplier A", phone: "(111) 111-1111", email: "suppliera@example.com", address: "123 Supply St" },
  { id: 2, name: "Supplier B", phone: "(222) 222-2222", email: "supplierb@example.com", address: "456 Supply Ave" },
];

const initialInventory = [
  { id: 1, productId: 1, quantity: 10, lastUpdated: "2024-06-01" },
  { id: 2, productId: 2, quantity: 5, lastUpdated: "2024-06-01" },
];

const initialPurchaseOrderDetails = [
  { id: 1, maCTPN: 1, maPN: 1, maSP: 1, soLuong: 10, donGiaNhap: 1000.00, thanhTien: 10000.00 },
  { id: 2, maCTPN: 2, maPN: 2, maSP: 2, soLuong: 5, donGiaNhap: 1000.00, thanhTien: 5000.00 },
];

const initialServiceDetails = [
  { id: 1, maCT: 1, maPDV: 1, maDV: 1, donGiaDichVu: 500.00, donGiaDuocTinh: 550.00, soLuong: 1, thanhTien: 550.00, tienTraTruoc: 200.00, tienConLai: 350.00, ngayGiao: "2024-06-01", tinhTrang: "Chưa giao" },
  { id: 2, maCT: 2, maPDV: 2, maDV: 2, donGiaDichVu: 300.00, donGiaDuocTinh: 330.00, soLuong: 1, thanhTien: 330.00, tienTraTruoc: 100.00, tienConLai: 230.00, ngayGiao: null, tinhTrang: "Chưa giao" },
];

const initialReports = [
  { id: 1, type: "Doanh thu", date: "2024-06-01", data: { revenue: 15000 }, createdAt: "2024-06-01T12:00:00Z" },
];

// Define search fields for each section
const searchFields = {
  products: [
    { name: "code", type: "text", placeholder: "Mã sản phẩm" },
    { name: "name", type: "text", placeholder: "Tên sản phẩm" },
  ],
  orders: [
    { name: "orderCode", type: "text", placeholder: "Mã đơn hàng" },
    { name: "customer", type: "text", placeholder: "Khách hàng" },
  ],
  customers: [
    { name: "name", type: "text", placeholder: "Tên" },
    { name: "email", type: "email", placeholder: "Email" },
  ],
  accounts: [
    { name: "name", type: "text", placeholder: "Tên" },
    { name: "email", type: "email", placeholder: "Email" },
  ],
  categories: [
    { name: "name", type: "text", placeholder: "Tên danh mục" },
  ],
  services: [
    { name: "code", type: "text", placeholder: "Mã dịch vụ" },
    { name: "name", type: "text", placeholder: "Tên dịch vụ" },
  ],
  purchaseOrders: [
    { name: "code", type: "text", placeholder: "Mã phiếu nhập" },
    { name: "supplier", type: "text", placeholder: "Nhà cung cấp" },
  ],
  suppliers: [
    { name: "name", type: "text", placeholder: "Tên nhà cung cấp" },
    { name: "email", type: "email", placeholder: "Email" },
  ],
  inventory: [
    { name: "productId", type: "number", placeholder: "ID sản phẩm" },
  ],
  reports: [
    { name: "type", type: "text", placeholder: "Loại báo cáo" },
  ],
  purchaseOrderDetails: [
    { name: "maPN", type: "number", placeholder: "Mã phiếu nhập" },
    { name: "maSP", type: "number", placeholder: "Mã sản phẩm" },
  ],
  serviceDetails: [
    { name: "maPDV", type: "number", placeholder: "Mã phiếu dịch vụ" },
    { name: "maDV", type: "number", placeholder: "Mã dịch vụ" },
  ],
};

// Define filter options for each section
const filterOptions = {
  products: [
    { name: "category", type: "select", options: ["", "Ring", "Necklace"], placeholder: "Chọn danh mục" },
    { name: "status", type: "select", options: ["", "In Stock", "Low Stock"], placeholder: "Chọn trạng thái" },
  ],
  orders: [
    { name: "status", type: "select", options: ["", "Pending", "Shipped"], placeholder: "Chọn trạng thái" },
    { name: "paymentMethod", type: "text", placeholder: "Phương thức thanh toán" },
  ],
  customers: [
    { name: "status", type: "select", options: ["", "Active", "Inactive"], placeholder: "Chọn trạng thái" },
    { name: "role", type: "select", options: ["", "Customer", "Admin", "Employee"], placeholder: "Chọn vai trò" },
  ],
  accounts: [
    { name: "status", type: "select", options: ["", "Active", "Inactive"], placeholder: "Chọn trạng thái" },
    { name: "role", type: "select", options: ["", "Customer", "Admin", "Employee"], placeholder: "Chọn vai trò" },
  ],
  categories: [
    { name: "name", type: "text", placeholder: "Tên danh mục" },
  ],
  services: [
    { name: "status", type: "select", options: ["", "true", "false"], placeholder: "Chọn trạng thái" },
  ],
  purchaseOrders: [
    { name: "status", type: "select", options: ["", "Đã nhập", "Đang xử lý", "Hủy"], placeholder: "Chọn trạng thái" },
  ],
  suppliers: [
    { name: "name", type: "text", placeholder: "Tên nhà cung cấp" },
  ],
  inventory: [
    { name: "quantity", type: "number", placeholder: "Số lượng tối thiểu" },
  ],
  reports: [
    { name: "type", type: "select", options: ["", "Doanh thu", "Tồn kho", "Lợi nhuận"], placeholder: "Chọn loại" },
  ],
  purchaseOrderDetails: [
    { name: "soLuong", type: "number", placeholder: "Số lượng tối thiểu" },
  ],
  serviceDetails: [
    { name: "tinhTrang", type: "select", options: ["", "Đã giao", "Chưa giao"], placeholder: "Chọn trạng thái" },
  ],
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [customers, setCustomers] = useState(initialCustomers);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);
  const [services, setServices] = useState(initialServices);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [inventory, setInventory] = useState(initialInventory);
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState(initialPurchaseOrderDetails);
  const [serviceDetails, setServiceDetails] = useState(initialServiceDetails);
  const [reports, setReports] = useState(initialReports);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedTab, setSelectedTab] = useState("pending");
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedMenu("auth");
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    setSelectedMenu("auth");
  };

  const openModal = (section, type, item = null) => {
    setCurrentSection(section);
    setModalType(type);
    setCurrentItem(item);
    setFormData(item || {});
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
    setError("");
  };

  const openSearchModal = (section) => {
    setCurrentSection(section);
    setShowSearchModal(true);
    setSearchFormData({});
  };

  const openFilterModal = (section) => {
    setCurrentSection(section);
    setShowFilterModal(true);
    setFilterFormData({});
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchFormData({});
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
    setFilterFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFormData({ ...searchFormData, [name]: value });
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({ ...filterFormData, [name]: value });
  };

  const sortData = (key, data, setData) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (currentSection === "products") {
      if (!formData.code || !formData.name || !formData.price || !formData.quantity || !formData.category || !formData.status || !formData.image) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (isNaN(parseFloat(formData.price.replace("$", ""))) || parseFloat(formData.price.replace("$", "")) <= 0) {
        setError("Giá phải là số dương.");
        return false;
      }
      if (parseInt(formData.quantity) < 0) {
        setError("Số lượng không được âm.");
        return false;
      }
    }
    if (currentSection === "orders") {
      if (!formData.orderCode || !formData.customer || !formData.date || !formData.total || !formData.status || !formData.paymentMethod || !formData.deliveryAddress) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (isNaN(parseFloat(formData.total.replace("$", ""))) || parseFloat(formData.total.replace("$", "")) <= 0) {
        setError("Tổng tiền phải là số dương.");
        return false;
      }
    }
    if (currentSection === "customers" || currentSection === "accounts") {
      if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.status || !formData.role) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
    }
    if (currentSection === "categories") {
      if (!formData.name) {
        setError("Vui lòng điền tên danh mục.");
        return false;
      }
    }
    if (currentSection === "services") {
      if (!formData.code || !formData.name || !formData.price || !formData.description || !formData.status) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        setError("Giá phải là số dương.");
        return false;
      }
    }
    if (currentSection === "purchaseOrders") {
      if (!formData.code || !formData.supplier || !formData.date || !formData.total || !formData.status) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (isNaN(parseFloat(formData.total)) || parseFloat(formData.total) <= 0) {
        setError("Tổng tiền phải là số dương.");
        return false;
      }
    }
    if (currentSection === "suppliers") {
      if (!formData.name || !formData.address) {
        setError("Vui lòng điền tên và địa chỉ nhà cung cấp.");
        return false;
      }
    }
    if (currentSection === "inventory") {
      if (!formData.productId || !formData.quantity || !formData.lastUpdated) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (parseInt(formData.quantity) < 0) {
        setError("Số lượng không được âm.");
        return false;
      }
    }
    if (currentSection === "reports") {
      if (!formData.type || !formData.date || !formData.data) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
    }
    if (currentSection === "purchaseOrderDetails") {
      if (!formData.maPN || !formData.maSP || !formData.soLuong || !formData.donGiaNhap) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (parseInt(formData.soLuong) <= 0) {
        setError("Số lượng phải lớn hơn 0.");
        return false;
      }
      if (parseFloat(formData.donGiaNhap) <= 0) {
        setError("Đơn giá nhập phải lớn hơn 0.");
        return false;
      }
    }
    if (currentSection === "serviceDetails") {
      if (!formData.maPDV || !formData.maDV || !formData.donGiaDichVu || !formData.donGiaDuocTinh || !formData.tienTraTruoc) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc.");
        return false;
      }
      if (parseFloat(formData.donGiaDichVu) <= 0 || parseFloat(formData.donGiaDuocTinh) <= 0 || parseFloat(formData.tienTraTruoc) < 0) {
        setError("Giá và số tiền phải hợp lệ.");
        return false;
      }
      if (parseInt(formData.soLuong) <= 0) {
        setError("Số lượng phải lớn hơn 0.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = { ...formData, id: Date.now() };
    if (modalType === "add") {
      if (currentSection === "products") setProducts([...products, newItem]);
      if (currentSection === "orders") setOrders([...orders, newItem]);
      if (currentSection === "customers") setCustomers([...customers, newItem]);
      if (currentSection === "accounts") {
        const newAccount = { ...newItem, status: "Active", role: formData.role || "customer" };
        setAccounts([...accounts, newAccount]);
      }
      if (currentSection === "categories") setCategories([...categories, newItem]);
      if (currentSection === "services") setServices([...services, newItem]);
      if (currentSection === "purchaseOrders") setPurchaseOrders([...purchaseOrders, newItem]);
      if (currentSection === "suppliers") setSuppliers([...suppliers, newItem]);
      if (currentSection === "inventory") setInventory([...inventory, newItem]);
      if (currentSection === "reports") setReports([...reports, newItem]);
      if (currentSection === "purchaseOrderDetails") {
        newItem.thanhTien = (parseFloat(formData.soLuong) * parseFloat(formData.donGiaNhap)).toFixed(2);
        setPurchaseOrderDetails([...purchaseOrderDetails, newItem]);
      }
      if (currentSection === "serviceDetails") {
        newItem.thanhTien = (parseFloat(formData.donGiaDuocTinh) * parseInt(formData.soLuong || 1)).toFixed(2);
        newItem.tienConLai = (newItem.thanhTien - parseFloat(formData.tienTraTruoc)).toFixed(2);
        setServiceDetails([...serviceDetails, newItem]);
      }
    } else if (modalType === "edit" && currentItem) {
      if (currentSection === "products") setProducts(products.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "orders") setOrders(orders.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "customers") setCustomers(customers.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "accounts") setAccounts(accounts.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "categories") setCategories(categories.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "services") setServices(services.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "purchaseOrders") setPurchaseOrders(purchaseOrders.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "suppliers") setSuppliers(suppliers.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "inventory") setInventory(inventory.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "reports") setReports(reports.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      if (currentSection === "purchaseOrderDetails") {
        newItem.thanhTien = (parseFloat(formData.soLuong) * parseFloat(formData.donGiaNhap)).toFixed(2);
        setPurchaseOrderDetails(purchaseOrderDetails.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id, thanhTien: newItem.thanhTien } : item)));
      }
      if (currentSection === "serviceDetails") {
        newItem.thanhTien = (parseFloat(formData.donGiaDuocTinh) * parseInt(formData.soLuong || 1)).toFixed(2);
        newItem.tienConLai = (newItem.thanhTien - parseFloat(formData.tienTraTruoc)).toFixed(2);
        setServiceDetails(serviceDetails.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id, thanhTien: newItem.thanhTien, tienConLai: newItem.tienConLai } : item)));
      }
    }
    closeModal();
  };

  const handleDelete = (section, id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      if (section === "products") setProducts(products.filter((item) => item.id !== id));
      if (section === "orders") setOrders(orders.filter((item) => item.id !== id));
      if (section === "customers") setCustomers(customers.filter((item) => item.id !== id));
      if (section === "accounts") setAccounts(accounts.filter((item) => item.id !== id));
      if (section === "categories") setCategories(categories.filter((item) => item.id !== id));
      if (section === "services") setServices(services.filter((item) => item.id !== id));
      if (section === "purchaseOrders") setPurchaseOrders(purchaseOrders.filter((item) => item.id !== id));
      if (section === "suppliers") setSuppliers(suppliers.filter((item) => item.id !== id));
      if (section === "inventory") setInventory(inventory.filter((item) => item.id !== id));
      if (section === "reports") setReports(reports.filter((item) => item.id !== id));
      if (section === "purchaseOrderDetails") setPurchaseOrderDetails(purchaseOrderDetails.filter((item) => item.id !== id));
      if (section === "serviceDetails") setServiceDetails(serviceDetails.filter((item) => item.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map((order) => order.id === id ? { ...order, status: newStatus } : order));
  };

  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total.replace("$", "")), 0);
  const totalSales = products.reduce((acc, product) => acc + product.quantity, 0);

  const authorizedRoles = {
    dashboard: ["admin", "employee", "customer"],
    accounts: ["admin"],
    products: ["admin", "employee"],
    categories: ["admin"],
    orders: ["admin", "employee"],
    services: ["admin", "employee"],
    purchaseOrders: ["admin"],
    suppliers: ["admin"],
    inventory: ["admin", "employee"],
    reports: ["admin"],
    purchaseOrderDetails: ["admin"],
    serviceDetails: ["admin", "employee"],
  };

  if (!isAuthenticated) {
    return (
      <Auth
        onAuthSuccess={(auth, role, userData) => {
          setIsAuthenticated(auth);
          setUserRole(role);
          setUser(userData);
          setSelectedMenu("dashboard");
          if (userData && !accounts.some(acc => acc.username === userData.username)) {
            setAccounts([...accounts, userData]);
          }
        }}
      />
    );
  }

  if (isAuthenticated && userRole && !authorizedRoles[selectedMenu]?.includes(userRole)) {
    alert("Bạn không có quyền truy cập vào trang này!");
    setSelectedMenu("dashboard");
  }

  return (
    <div className="container">
      {(showModal || showSearchModal || showFilterModal) && (
        <div className="modal-overlay">
          <div className="modal">
            {showModal && (
              <>
                <div className="modal-header">
                  <h2>{modalType === "add" ? `Thêm ${currentSection}` : `Sửa ${currentSection}`}</h2>
                  <button onClick={closeModal} className="modal-close">
                    <X className="icon" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                  {error && <p className="error-message">{error}</p>}
                  {currentSection === "products" && (
                    <>
                      <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã sản phẩm" required />
                      <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên sản phẩm" required />
                      <input type="text" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Giá (VD: $1200)" required />
                      <input type="text" name="category" value={formData.category || ""} onChange={handleInputChange} placeholder="Danh mục" required />
                      <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleInputChange} placeholder="Số lượng" required />
                      <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value="In Stock">Còn hàng</option>
                        <option value="Low Stock">Sắp hết</option>
                      </select>
                      <input type="text" name="image" value={formData.image || ""} onChange={handleInputChange} placeholder="URL hình ảnh" required />
                      <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú" />
                    </>
                  )}
                  {currentSection === "orders" && (
                    <>
                      <input type="text" name="orderCode" value={formData.orderCode || ""} onChange={handleInputChange} placeholder="Mã đơn hàng" required />
                      <input type="text" name="customer" value={formData.customer || ""} onChange={handleInputChange} placeholder="Khách hàng" required />
                      <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
                      <input type="text" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Tổng tiền (VD: $3700)" required />
                      <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Shipped">Đã giao</option>
                      </select>
                      <input type="text" name="paymentMethod" value={formData.paymentMethod || ""} onChange={handleInputChange} placeholder="Phương thức thanh toán" required />
                      <input type="text" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleInputChange} placeholder="Địa chỉ giao hàng" required />
                      <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú" />
                    </>
                  )}
                  {(currentSection === "customers" || currentSection === "accounts") && (
                    <>
                      <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên" required />
                      {currentSection === "customers" && <input type="text" name="customerCode" value={formData.customerCode || ""} onChange={handleInputChange} placeholder="Mã khách hàng" required />}
                      {currentSection === "accounts" && <input type="text" name="accountCode" value={formData.accountCode || ""} onChange={handleInputChange} placeholder="Mã tài khoản" required />}
                      <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" required />
                      <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" required />
                      <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
                      {currentSection === "customers" && <input type="text" name="totalSpent" value={formData.totalSpent || ""} onChange={handleInputChange} placeholder="Tổng chi tiêu" required />}
                      {currentSection === "accounts" && <input type="text" name="position" value={formData.position || ""} onChange={handleInputChange} placeholder="Chức vụ" required />}
                      <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value="Active">Kích hoạt</option>
                        <option value="Inactive">Không hoạt động</option>
                      </select>
                      <select name="role" value={formData.role || ""} onChange={handleInputChange} required>
                        <option value="">Chọn vai trò</option>
                        <option value="Customer">Khách hàng</option>
                        <option value="Admin">Quản trị</option>
                        <option value="Employee">Nhân viên</option>
                      </select>
                    </>
                  )}
                  {currentSection === "categories" && (
                    <>
                      <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên danh mục" required />
                      <input type="text" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Mô tả" />
                    </>
                  )}
                  {currentSection === "services" && (
                    <>
                      <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã dịch vụ" required />
                      <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên dịch vụ" required />
                      <input type="number" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Giá" step="0.01" required />
                      <input type="text" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Mô tả" required />
                      <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value={true}>Kích hoạt</option>
                        <option value={false}>Không hoạt động</option>
                      </select>
                    </>
                  )}
                  {currentSection === "purchaseOrders" && (
                    <>
                      <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã phiếu nhập" required />
                      <input type="text" name="supplier" value={formData.supplier || ""} onChange={handleInputChange} placeholder="Nhà cung cấp" required />
                      <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
                      <input type="number" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Tổng tiền" step="0.01" required />
                      <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value="Đã nhập">Đã nhập</option>
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Hủy">Hủy</option>
                      </select>
                    </>
                  )}
                  {currentSection === "suppliers" && (
                    <>
                      <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên nhà cung cấp" required />
                      <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" />
                      <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
                      <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
                    </>
                  )}
                  {currentSection === "inventory" && (
                    <>
                      <input type="number" name="productId" value={formData.productId || ""} onChange={handleInputChange} placeholder="ID sản phẩm" required />
                      <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleInputChange} placeholder="Số lượng" required />
                      <input type="date" name="lastUpdated" value={formData.lastUpdated || ""} onChange={handleInputChange} placeholder="Ngày cập nhật" required />
                    </>
                  )}
                  {currentSection === "reports" && (
                    <>
                      <select name="type" value={formData.type || ""} onChange={handleInputChange} required>
                        <option value="">Chọn loại</option>
                        <option value="Doanh thu">Doanh thu</option>
                        <option value="Tồn kho">Tồn kho</option>
                        <option value="Lợi nhuận">Lợi nhuận</option>
                      </select>
                      <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} placeholder="Ngày báo cáo" required />
                      <input type="text" name="data" value={formData.data || ""} onChange={handleInputChange} placeholder="Dữ liệu (JSON)" required />
                    </>
                  )}
                  {currentSection === "purchaseOrderDetails" && (
                    <>
                      <input type="number" name="maPN" value={formData.maPN || ""} onChange={handleInputChange} placeholder="Mã phiếu nhập" required />
                      <input type="number" name="maSP" value={formData.maSP || ""} onChange={handleInputChange} placeholder="Mã sản phẩm" required />
                      <input type="number" name="soLuong" value={formData.soLuong || ""} onChange={handleInputChange} placeholder="Số lượng" required />
                      <input type="number" name="donGiaNhap" value={formData.donGiaNhap || ""} onChange={handleInputChange} placeholder="Đơn giá nhập" step="0.01" required />
                    </>
                  )}
                  {currentSection === "serviceDetails" && (
                    <>
                      <input type="number" name="maPDV" value={formData.maPDV || ""} onChange={handleInputChange} placeholder="Mã phiếu dịch vụ" required />
                      <input type="number" name="maDV" value={formData.maDV || ""} onChange={handleInputChange} placeholder="Mã dịch vụ" required />
                      <input type="number" name="donGiaDichVu" value={formData.donGiaDichVu || ""} onChange={handleInputChange} placeholder="Đơn giá dịch vụ" step="0.01" required />
                      <input type="number" name="donGiaDuocTinh" value={formData.donGiaDuocTinh || ""} onChange={handleInputChange} placeholder="Đơn giá được tính" step="0.01" required />
                      <input type="number" name="soLuong" value={formData.soLuong || "1"} onChange={handleInputChange} placeholder="Số lượng" required />
                      <input type="number" name="tienTraTruoc" value={formData.tienTraTruoc || ""} onChange={handleInputChange} placeholder="Tiền trả trước" step="0.01" required />
                      <input type="date" name="ngayGiao" value={formData.ngayGiao || ""} onChange={handleInputChange} placeholder="Ngày giao" />
                      <select name="tinhTrang" value={formData.tinhTrang || ""} onChange={handleInputChange} required>
                        <option value="">Chọn trạng thái</option>
                        <option value="Đã giao">Đã giao</option>
                        <option value="Chưa giao">Chưa giao</option>
                      </select>
                    </>
                  )}
                  <div className="modal-actions">
                    <button type="submit" className="action-button">Lưu</button>
                    <button type="button" onClick={closeModal} className="action-button cancel">Hủy</button>
                  </div>
                </form>
              </>
            )}
            {showSearchModal && (
              <>
                <div className="modal-header">
                  <h2>Tìm kiếm {currentSection}</h2>
                  <button onClick={closeSearchModal} className="modal-close">
                    <X className="icon" />
                  </button>
                </div>
                <div className="modal-form">
                  {searchFields[currentSection]?.map((field) => (
                    <input
                      key={field.name}
                      type={field.type}
                      name={field.name}
                      value={searchFormData[field.name] || ""}
                      onChange={handleSearchInputChange}
                      placeholder={field.placeholder}
                    />
                  ))}
                  <div className="modal-actions">
                    <button type="button" onClick={closeSearchModal} className="action-button">Tìm kiếm</button>
                    <button type="button" onClick={closeSearchModal} className="action-button cancel">Hủy</button>
                  </div>
                </div>
              </>
            )}
            {showFilterModal && (
              <>
                <div className="modal-header">
                  <h2>Lọc {currentSection}</h2>
                  <button onClick={closeFilterModal} className="modal-close">
                    <X className="icon" />
                  </button>
                </div>
                <div className="modal-form">
                  {filterOptions[currentSection]?.map((option) => (
                    option.type === "select" ? (
                      <select
                        key={option.name}
                        name={option.name}
                        value={filterFormData[option.name] || ""}
                        onChange={handleFilterInputChange}
                      >
                        <option value="">{option.placeholder}</option>
                        {option.options.slice(1).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === "true" ? "Kích hoạt" : opt === "false" ? "Không hoạt động" : opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        key={option.name}
                        type={option.type}
                        name={option.name}
                        value={filterFormData[option.name] || ""}
                        onChange={handleFilterInputChange}
                        placeholder={option.placeholder}
                      />
                    )
                  ))}
                  <div className="modal-actions">
                    <button type="button" onClick={closeFilterModal} className="action-button">Lọc</button>
                    <button type="button" onClick={closeFilterModal} className="action-button cancel">Hủy</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    <aside className="sidebar">
  <h1 className="sidebar-title flex items-center gap-2 px-4 py-2">
    Jewelry Admin
    <img
      src="/logoVTP.svg"
      alt="Jewelry Admin Logo"
      className="sidebar-logo"
    />
  </h1>
  <nav className="sidebar-nav">
          {[
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
          ].map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => setSelectedMenu(key)}
              className={selectedMenu === key ? "sidebar-button active" : "sidebar-button"}
              disabled={!isAuthenticated}
            >
              <Icon className="icon" />
              <span>{label}</span>
            </button>
          ))}
          {isAuthenticated && (
            <button onClick={handleLogout} className="sidebar-button">
              <LogOut className="icon" />
              <span>Đăng xuất</span>
            </button>
          )}
        </nav>
      </aside>
      <main className="main-content">
        <div className="header">
          <h1 className="main-title">
            {selectedMenu === "dashboard" ? "Tổng quan Dashboard" :
             selectedMenu === "accounts" ? "Quản lý tài khoản" :
             selectedMenu === "products" ? "Quản lý sản phẩm" :
             selectedMenu === "categories" ? "Quản lý danh mục" :
             selectedMenu === "orders" ? "Quản lý đơn hàng" :
             selectedMenu === "services" ? "Quản lý dịch vụ" :
             selectedMenu === "purchaseOrders" ? "Quản lý nhập hàng" :
             selectedMenu === "purchaseOrderDetails" ? "Chi tiết phiếu nhập" :
             selectedMenu === "serviceDetails" ? "Chi tiết phiếu dịch vụ" :
             selectedMenu === "suppliers" ? "Quản lý nhà cung cấp" :
             selectedMenu === "inventory" ? "Quản lý tồn kho" :
             selectedMenu === "reports" ? "Báo cáo & Thống kê" : selectedMenu}
          </h1>
          {user && <p>Chào, {user.name} ({user.role})</p>}
        </div>

        {selectedMenu === "dashboard" && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="card">
                <div className="card-content">
                  <p className="card-label">Tổng doanh thu</p>
                  <p className="card-value">${totalRevenue.toLocaleString()}</p>
                  <div className="card-icon">
                    <ShoppingCart className="icon" />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-content">
                  <p className="card-label">Số lượng bán ra</p>
                  <p className="card-value">{totalSales}</p>
                  <div className="card-icon">
                    <Gem className="icon" />
                  </div>
                </div>
              </div>
            </div>
            <div className="chart-card">
              <h2 className="chart-title">Tổng quan doanh thu</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={initialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#c1a47e" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {selectedMenu === "accounts" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý tài khoản</h2>
              <div>
                <button onClick={() => openSearchModal("accounts")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("accounts")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("accounts", "add")} className="action-button">Thêm tài khoản</button>
                <button onClick={() => exportToCSV(accounts, "accounts.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", accounts, setAccounts)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("name", accounts, setAccounts)}>Tên <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("position", accounts, setAccounts)}>Chức vụ <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("accountCode", accounts, setAccounts)}>Mã tài khoản <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("email", accounts, setAccounts)}>Email <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("phone", accounts, setAccounts)}>Điện thoại <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("address", accounts, setAccounts)}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("status", accounts, setAccounts)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("role", accounts, setAccounts)}>Vai trò <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.name}</td>
                      <td>{a.position}</td>
                      <td>{a.accountCode}</td>
                      <td>{a.email}</td>
                      <td>{a.phone}</td>
                      <td>{a.address}</td>
                      <td>
                        <span className={a.status === "Active" ? "status-instock" : "status-inactive"}>
                          {a.status}
                        </span>
                      </td>
                      <td>{a.role}</td>
                      <td>
                        <button onClick={() => openModal("accounts", "edit", a)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("accounts", a.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "products" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý sản phẩm</h2>
              <div>
                <button onClick={() => openSearchModal("products")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("products")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("products", "add")} className="action-button">Thêm sản phẩm</button>
                <button onClick={() => exportToCSV(products, "products.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", products, setProducts)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("code", products, setProducts)}>Mã <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("name", products, setProducts)}>Tên <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("price", products, setProducts)}>Giá <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("category", products, setProducts)}>Danh mục <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("quantity", products, setProducts)}>Số lượng <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("status", products, setProducts)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                    <th>Hình ảnh</th>
                    <th onClick={() => sortData("note", products, setProducts)}>Ghi chú <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{p.price}</td>
                      <td>{p.category}</td>
                      <td>{p.quantity}</td>
                      <td>
                        <span className={p.status === "In Stock" ? "status-instock" : "status-lowstock"}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <img src={p.image} alt={p.name} className="product-image" />
                      </td>
                      <td>{p.note}</td>
                      <td>
                        <button onClick={() => openModal("products", "edit", p)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("products", p.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "categories" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý danh mục sản phẩm</h2>
              <div>
                <button onClick={() => openSearchModal("categories")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("categories")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("categories", "add")} className="action-button">Thêm danh mục</button>
                <button onClick={() => exportToCSV(categories, "categories.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", categories, setCategories)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("name", categories, setCategories)}>Tên <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("description", categories, setCategories)}>Mô tả <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.description}</td>
                      <td>
                        <button onClick={() => openModal("categories", "edit", c)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("categories", c.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "orders" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý đơn hàng</h2>
              <div>
                <button onClick={() => openSearchModal("orders")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("orders")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("orders", "add")} className="action-button">Thêm đơn hàng</button>
                <button onClick={() => exportToCSV(orders, "orders.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="tabs">
              <button className={selectedTab === "pending" ? "tab active" : "tab"} onClick={() => setSelectedTab("pending")}>Đơn cần tiếp nhận</button>
              <button className={selectedTab === "payment" ? "tab active" : "tab"} onClick={() => setSelectedTab("payment")}>Xác nhận thanh toán</button>
              <button className={selectedTab === "shipping" ? "tab active" : "tab"} onClick={() => setSelectedTab("shipping")}>Đóng gói & giao hàng</button>
              <button className={selectedTab === "status" ? "tab active" : "tab"} onClick={() => setSelectedTab("status")}>Cập nhật trạng thái</button>
              <button className={selectedTab === "return" ? "tab active" : "tab"} onClick={() => setSelectedTab("return")}>Trả/Đổi hàng</button>
              <button className={selectedTab === "list" ? "tab active" : "tab"} onClick={() => setSelectedTab("list")}>Danh sách đơn hàng</button>
            </div>
            <div className="tab-content">
              {selectedTab === "pending" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("customer", orders, setOrders)}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("date", orders, setOrders)}>Ngày <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("total", orders, setOrders)}>Tổng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("status", orders, setOrders)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === "Pending").map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.customer}</td>
                        <td>{o.date}</td>
                        <td>{o.total}</td>
                        <td>{o.status}</td>
                        <td>
                          <button onClick={() => openModal("orders", "edit", o)} className="action-icon edit">
                            <Edit className="icon" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedTab === "payment" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("customer", orders, setOrders)}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("total", orders, setOrders)}>Tổng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("paymentMethod", orders, setOrders)}>Phương thức <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.customer}</td>
                        <td>{o.total}</td>
                        <td>{o.paymentMethod}</td>
                        <td>
                          <button className="action-button">Xác nhận</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedTab === "shipping" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("deliveryAddress", orders, setOrders)}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("status", orders, setOrders)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status !== "Shipped").map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.deliveryAddress}</td>
                        <td>{o.status}</td>
                        <td>
                          <button className="action-button">Đóng gói</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedTab === "status" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("status", orders, setOrders)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.status}</td>
                        <td>
                          <select onChange={(e) => handleStatusChange(o.id, e.target.value)} value={o.status}>
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Shipped">Đã giao</option>
                            <option value="Completed">Hoàn thành</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedTab === "return" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("customer", orders, setOrders)}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.customer}</td>
                        <td>
                          <button className="action-button">Yêu cầu trả/đổi</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {selectedTab === "list" && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => sortData("id", orders, setOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("orderCode", orders, setOrders)}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("customer", orders, setOrders)}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("date", orders, setOrders)}>Ngày <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("total", orders, setOrders)}>Tổng <ArrowUpDown className="sort-icon" /></th>
                      <th onClick={() => sortData("status", orders, setOrders)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.orderCode}</td>
                        <td>{o.customer}</td>
                        <td>{o.date}</td>
                        <td>{o.total}</td>
                        <td>{o.status}</td>
                        <td>
                          <button onClick={() => handleDelete("orders", o.id)} className="action-icon delete">
                            <Trash className="icon" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
       {selectedMenu === "services" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý dịch vụ</h2>
              <div>
                <button onClick={() => openSearchModal("services")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("services")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("services", "add")} className="action-button">Thêm dịch vụ</button>
                <button onClick={() => exportToCSV(services, "services.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", services, setServices)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("code", services, setServices)}>Mã dịch vụ <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("name", services, setServices)}>Tên dịch vụ <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("price", services, setServices)}>Giá <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("description", services, setServices)}>Mô tả <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("status", services, setServices)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.code}</td>
                      <td>{s.name}</td>
                      <td>${s.price.toFixed(2)}</td>
                      <td>{s.description}</td>
                      <td>
                        <span className={s.status ? "status-instock" : "status-inactive"}>
                          {s.status ? "Kích hoạt" : "Không hoạt động"}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openModal("services", "edit", s)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("services", s.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "purchaseOrders" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý nhập hàng</h2>
              <div>
                <button onClick={() => openSearchModal("purchaseOrders")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("purchaseOrders")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("purchaseOrders", "add")} className="action-button">Thêm phiếu nhập</button>
                <button onClick={() => exportToCSV(purchaseOrders, "purchaseOrders.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", purchaseOrders, setPurchaseOrders)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("code", purchaseOrders, setPurchaseOrders)}>Mã phiếu nhập <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("supplier", purchaseOrders, setPurchaseOrders)}>Nhà cung cấp <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("date", purchaseOrders, setPurchaseOrders)}>Ngày <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("total", purchaseOrders, setPurchaseOrders)}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("status", purchaseOrders, setPurchaseOrders)}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td>{po.id}</td>
                      <td>{po.code}</td>
                      <td>{po.supplier}</td>
                      <td>{po.date}</td>
                      <td>${po.total.toFixed(2)}</td>
                      <td>
                        <span className={po.status === "Đã nhập" ? "status-instock" : po.status === "Đang xử lý" ? "status-lowstock" : "status-inactive"}>
                          {po.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openModal("purchaseOrders", "edit", po)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("purchaseOrders", po.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "suppliers" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý nhà cung cấp</h2>
              <div>
                <button onClick={() => openSearchModal("suppliers")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("suppliers")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("suppliers", "add")} className="action-button">Thêm nhà cung cấp</button>
                <button onClick={() => exportToCSV(suppliers, "suppliers.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", suppliers, setSuppliers)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("name", suppliers, setSuppliers)}>Tên <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("phone", suppliers, setSuppliers)}>Điện thoại <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("email", suppliers, setSuppliers)}>Email <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("address", suppliers, setSuppliers)}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.phone}</td>
                      <td>{s.email}</td>
                      <td>{s.address}</td>
                      <td>
                        <button onClick={() => openModal("suppliers", "edit", s)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("suppliers", s.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "inventory" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Quản lý tồn kho</h2>
              <div>
                <button onClick={() => openSearchModal("inventory")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("inventory")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("inventory", "add")} className="action-button">Thêm tồn kho</button>
                <button onClick={() => exportToCSV(inventory, "inventory.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", inventory, setInventory)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("productId", inventory, setInventory)}>ID sản phẩm <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("quantity", inventory, setInventory)}>Số lượng <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("lastUpdated", inventory, setInventory)}>Cập nhật lần cuối <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i.id}>
                      <td>{i.id}</td>
                      <td>{i.productId}</td>
                      <td>{i.quantity}</td>
                      <td>{i.lastUpdated}</td>
                      <td>
                        <button onClick={() => openModal("inventory", "edit", i)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("inventory", i.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "reports" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Báo cáo & Thống kê</h2>
              <div>
                <button onClick={() => openSearchModal("reports")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("reports")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("reports", "add")} className="action-button">Thêm báo cáo</button>
                <button onClick={() => exportToCSV(reports, "reports.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", reports, setReports)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("type", reports, setReports)}>Loại <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("date", reports, setReports)}>Ngày <ArrowUpDown className="sort-icon" /></th>
                    <th>Dữ liệu</th>
                    <th onClick={() => sortData("createdAt", reports, setReports)}>Ngày tạo <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.type}</td>
                      <td>{r.date}</td>
                      <td>{JSON.stringify(r.data)}</td>
                      <td>{r.createdAt}</td>
                      <td>
                        <button onClick={() => openModal("reports", "edit", r)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("reports", r.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "purchaseOrderDetails" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Chi tiết phiếu nhập</h2>
              <div>
                <button onClick={() => openSearchModal("purchaseOrderDetails")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("purchaseOrderDetails")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("purchaseOrderDetails", "add")} className="action-button">Thêm chi tiết</button>
                <button onClick={() => exportToCSV(purchaseOrderDetails, "purchaseOrderDetails.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", purchaseOrderDetails, setPurchaseOrderDetails)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maCTPN", purchaseOrderDetails, setPurchaseOrderDetails)}>Mã CTPN <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maPN", purchaseOrderDetails, setPurchaseOrderDetails)}>Mã phiếu nhập <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maSP", purchaseOrderDetails, setPurchaseOrderDetails)}>Mã sản phẩm <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("soLuong", purchaseOrderDetails, setPurchaseOrderDetails)}>Số lượng <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("donGiaNhap", purchaseOrderDetails, setPurchaseOrderDetails)}>Đơn giá nhập <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("thanhTien", purchaseOrderDetails, setPurchaseOrderDetails)}>Thành tiền <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrderDetails.map((pod) => (
                    <tr key={pod.id}>
                      <td>{pod.id}</td>
                      <td>{pod.maCTPN}</td>
                      <td>{pod.maPN}</td>
                      <td>{pod.maSP}</td>
                      <td>{pod.soLuong}</td>
                      <td>${pod.donGiaNhap.toFixed(2)}</td>
                      <td>${pod.thanhTien}</td>
                      <td>
                        <button onClick={() => openModal("purchaseOrderDetails", "edit", pod)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("purchaseOrderDetails", pod.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedMenu === "serviceDetails" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Chi tiết phiếu dịch vụ</h2>
              <div>
                <button onClick={() => openSearchModal("serviceDetails")} className="action-button"><Search className="icon" /> Tìm kiếm</button>
                <button onClick={() => openFilterModal("serviceDetails")} className="action-button"><Filter className="icon" /> Lọc</button>
                <button onClick={() => openModal("serviceDetails", "add")} className="action-button">Thêm chi tiết</button>
                <button onClick={() => exportToCSV(serviceDetails, "serviceDetails.csv")} className="action-button"><Download className="icon" /> Xuất CSV</button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => sortData("id", serviceDetails, setServiceDetails)}>ID <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maCT", serviceDetails, setServiceDetails)}>Mã CT <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maPDV", serviceDetails, setServiceDetails)}>Mã phiếu DV <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("maDV", serviceDetails, setServiceDetails)}>Mã dịch vụ <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("donGiaDichVu", serviceDetails, setServiceDetails)}>Đơn giá DV <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("donGiaDuocTinh", serviceDetails, setServiceDetails)}>Đơn giá tính <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("soLuong", serviceDetails, setServiceDetails)}>Số lượng <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("thanhTien", serviceDetails, setServiceDetails)}>Thành tiền <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("tienTraTruoc", serviceDetails, setServiceDetails)}>Tiền trả trước <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("tienConLai", serviceDetails, setServiceDetails)}>Tiền còn lại <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("ngayGiao", serviceDetails, setServiceDetails)}>Ngày giao <ArrowUpDown className="sort-icon" /></th>
                    <th onClick={() => sortData("tinhTrang", serviceDetails, setServiceDetails)}>Tình trạng <ArrowUpDown className="sort-icon" /></th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceDetails.map((sd) => (
                    <tr key={sd.id}>
                      <td>{sd.id}</td>
                      <td>{sd.maCT}</td>
                      <td>{sd.maPDV}</td>
                      <td>{sd.maDV}</td>
                      <td>${sd.donGiaDichVu.toFixed(2)}</td>
                      <td>${sd.donGiaDuocTinh.toFixed(2)}</td>
                      <td>{sd.soLuong}</td>
                      <td>${sd.thanhTien}</td>
                      <td>${sd.tienTraTruoc.toFixed(2)}</td>
                      <td>${sd.tienConLai}</td>
                      <td>{sd.ngayGiao || "Chưa xác định"}</td>
                      <td>
                        <span className={sd.tinhTrang === "Đã giao" ? "status-instock" : "status-lowstock"}>
                          {sd.tinhTrang}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openModal("serviceDetails", "edit", sd)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("serviceDetails", sd.id)} className="action-icon delete">
                          <Trash className="icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;