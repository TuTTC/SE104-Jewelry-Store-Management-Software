/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/
import React, { useState } from "react";
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, ShoppingCart, Gem, Users, UserCircle, X, Edit, Trash } from "lucide-react";

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
  { id: 101, orderCode: "ORD001", customer: "John Doe", date: "2024-04-01", total: "$3700", status: "Shipped", paymentMethod: "Credit Card", deliveryAddress: "123 Main St, NY", note: "Gift wrap this order" },
  { id: 102, orderCode: "ORD002", customer: "Jane Smith", date: "2024-04-02", total: "$1200", status: "Pending", paymentMethod: "PayPal", deliveryAddress: "456 Elm St, CA", note: "Call before delivery" },
];

const initialCustomers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "(123) 456-7890", address: "123 Main St, NY", totalSpent: "$5000", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "(987) 654-3210", address: "456 Elm St, CA", totalSpent: "$3000", status: "Inactive" },
];

const initialEmployees = [
  { id: 1, name: "Alice Johnson", position: "Sales Manager", email: "alice@jewelry.com", phone: "(111) 222-3333", address: "789 Pearl St, TX", status: "Active" },
  { id: 2, name: "Bob Lee", position: "Inventory Clerk", email: "bob@jewelry.com", phone: "(444) 555-6666", address: "321 Opal Ave, FL", status: "Inactive" },
];

function App() {
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [customers, setCustomers] = useState(initialCustomers);
  const [employees, setEmployees] = useState(initialEmployees);

  // State cho modal và form
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" hoặc "edit"
  const [currentSection, setCurrentSection] = useState(""); // "products", "orders", "customers", "employees"
  const [currentItem, setCurrentItem] = useState(null);

  // State cho form
  const [formData, setFormData] = useState({});

  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total.replace("$", "")), 0);
  const totalSales = products.reduce((acc, product) => acc + product.quantity, 0);

  // Mở modal để thêm hoặc sửa
  const openModal = (section, type, item = null) => {
    setCurrentSection(section);
    setModalType(type);
    setCurrentItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thêm hoặc sửa
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === "add") {
      const newItem = { ...formData, id: Date.now() }; // Tạo ID mới dựa trên timestamp
      if (currentSection === "products") setProducts([...products, newItem]);
      if (currentSection === "orders") setOrders([...orders, newItem]);
      if (currentSection === "customers") setCustomers([...customers, newItem]);
      if (currentSection === "employees") setEmployees([...employees, newItem]);
    } else if (modalType === "edit" && currentItem) {
      if (currentSection === "products") {
        setProducts(products.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      }
      if (currentSection === "orders") {
        setOrders(orders.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      }
      if (currentSection === "customers") {
        setCustomers(customers.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      }
      if (currentSection === "employees") {
        setEmployees(employees.map((item) => (item.id === currentItem.id ? { ...formData, id: item.id } : item)));
      }
    }
    closeModal();
  };

  // Xử lý xóa
  const handleDelete = (section, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (section === "products") setProducts(products.filter((item) => item.id !== id));
      if (section === "orders") setOrders(orders.filter((item) => item.id !== id));
      if (section === "customers") setCustomers(customers.filter((item) => item.id !== id));
      if (section === "employees") setEmployees(employees.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="container">
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{modalType === "add" ? `Add New ${currentSection}` : `Edit ${currentSection}`}</h2>
              <button onClick={closeModal} className="modal-close">
                <X className="icon" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {currentSection === "products" && (
                <>
                  <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Code" required />
                  <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Name" required />
                  <input type="text" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Price" required />
                  <input type="text" name="category" value={formData.category || ""} onChange={handleInputChange} placeholder="Category" required />
                  <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleInputChange} placeholder="Quantity" required />
                  <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                    <option value="">Select Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                  </select>
                  <input type="text" name="image" value={formData.image || ""} onChange={handleInputChange} placeholder="Image URL" required />
                  <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Note" />
                </>
              )}
              {currentSection === "orders" && (
                <>
                  <input type="text" name="orderCode" value={formData.orderCode || ""} onChange={handleInputChange} placeholder="Order Code" required />
                  <input type="text" name="customer" value={formData.customer || ""} onChange={handleInputChange} placeholder="Customer" required />
                  <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
                  <input type="text" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Total" required />
                  <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                    <option value="">Select Status</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <input type="text" name="paymentMethod" value={formData.paymentMethod || ""} onChange={handleInputChange} placeholder="Payment Method" required />
                  <input type="text" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleInputChange} placeholder="Delivery Address" required />
                  <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Note" />
                </>
              )}
              {currentSection === "customers" && (
                <>
                  <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Name" required />
                  <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" required />
                  <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Phone" required />
                  <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Address" required />
                  <input type="text" name="totalSpent" value={formData.totalSpent || ""} onChange={handleInputChange} placeholder="Total Spent" required />
                  <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </>
              )}
              {currentSection === "employees" && (
                <>
                  <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Name" required />
                  <input type="text" name="position" value={formData.position || ""} onChange={handleInputChange} placeholder="Position" required />
                  <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" required />
                  <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Phone" required />
                  <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Address" required />
                  <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </>
              )}
              <div className="modal-actions">
                <button type="submit" className="action-button">Save</button>
                <button type="button" onClick={closeModal} className="action-button cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="sidebar-title">Jewelry Admin</h1>
        <nav className="sidebar-nav">
          {[
            { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
            { label: "Products", icon: Gem, key: "products" },
            { label: "Orders", icon: ShoppingCart, key: "orders" },
            { label: "Customers", icon: Users, key: "customers" },
            { label: "Employees", icon: UserCircle, key: "employees" },
          ].map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => setSelectedMenu(key)}
              className={selectedMenu === key ? "sidebar-button active" : "sidebar-button"}
            >
              <Icon className="icon" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="header">
          <h1 className="main-title">
            {selectedMenu === "dashboard" ? "Dashboard Overview" : selectedMenu}
          </h1>
        </div>

        {/* Dashboard Content */}
        {selectedMenu === "dashboard" && (
          <div className="dashboard-content">
            {/* Stats Cards */}
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

            {/* Chart Section */}
            <div className="chart-card">
              <h2 className="chart-title">Revenue Overview</h2>
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

        {/* Products Section */}
        {selectedMenu === "products" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Products</h2>
              <button onClick={() => openModal("products", "add")} className="action-button">Add Product</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CODE</th>
                    <th>PRODUCT</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>STOCK</th>
                    <th>STATUS</th>
                    <th>IMAGE</th>
                    <th>NOTE</th>
                    <th>ACTIONS</th>
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

        {/* Orders Section */}
        {selectedMenu === "orders" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Orders</h2>
              <button onClick={() => openModal("orders", "add")} className="action-button">New Order</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ORDER CODE</th>
                    <th>CUSTOMER</th>
                    <th>DATE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                    <th>ADDRESS</th>
                    <th>NOTE</th>
                    <th>ACTIONS</th>
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
                      <td>
                        <span className={o.status === "Shipped" ? "status-instock" : "status-lowstock"}>
                          {o.status}
                        </span>
                      </td>
                      <td>{o.paymentMethod}</td>
                      <td>{o.deliveryAddress}</td>
                      <td>{o.note}</td>
                      <td>
                        <button onClick={() => openModal("orders", "edit", o)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("orders", o.id)} className="action-icon delete">
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

        {/* Customers Section */}
        {selectedMenu === "customers" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Customers</h2>
              <button onClick={() => openModal("customers", "add")} className="action-button">Add Customer</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>ADDRESS</th>
                    <th>TOTAL SPENT</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.address}</td>
                      <td>{c.totalSpent}</td>
                      <td>
                        <span className={c.status === "Active" ? "status-instock" : "status-inactive"}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openModal("customers", "edit", c)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("customers", c.id)} className="action-icon delete">
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

        {/* Employees Section */}
        {selectedMenu === "employees" && (
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Employees</h2>
              <button onClick={() => openModal("employees", "add")} className="action-button">Add Employee</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>POSITION</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>ADDRESS</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.id}</td>
                      <td>{e.name}</td>
                      <td>{e.position}</td>
                      <td>{e.email}</td>
                      <td>{e.phone}</td>
                      <td>{e.address}</td>
                      <td>
                        <span className={e.status === "Active" ? "status-instock" : "status-inactive"}>
                          {e.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openModal("employees", "edit", e)} className="action-icon edit">
                          <Edit className="icon" />
                        </button>
                        <button onClick={() => handleDelete("employees", e.id)} className="action-icon delete">
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