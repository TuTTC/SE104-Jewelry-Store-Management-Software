import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Download, Search, Filter, Edit, Trash } from 'lucide-react';
import { initialOrders } from '../data/initialData';
import GeneralModalForm from '../components/GeneralModalForm';
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';
import Pagination from '../components/Pagination';

const OrderManager = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    // Placeholder cho API call
    // fetchOrders().then(data => setOrders(data));
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    setFormData(item || {});
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setCurrentItem(null);
    setError('');
  };

  const openSearchModal = () => setShowSearchModal(true);
  const openFilterModal = () => setShowFilterModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  const closeFilterModal = () => setShowFilterModal(false);

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

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedData = [...orders].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setOrders(sortedData);
  };

  const exportToCSV = () => {
    const headers = ['ID,Mã đơn hàng,Khách hàng,Ngày đặt,Tổng tiền,Trạng thái,Phương thức thanh toán,Địa chỉ giao hàng,Ghi chú'];
    const rows = orders.map(item => [
      item.id,
      `"${item.orderCode}"`,
      `"${item.customer}"`,
      `"${item.date}"`,
      `"${item.total}"`,
      `"${item.status}"`,
      `"${item.paymentMethod}"`,
      `"${item.deliveryAddress}"`,
      `"${item.note || ''}"`
    ].join(','));
    const csv = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    if (!formData.orderCode || !formData.customer || !formData.date || !formData.total || !formData.status || !formData.paymentMethod || !formData.deliveryAddress) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }
    if (formData.total.startsWith('$')) {
      formData.total = formData.total.replace('$', '');
    }
    if (parseFloat(formData.total) <= 0) {
      setError('Tổng tiền phải lớn hơn 0.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newItem = { ...formData, id: Date.now(), total: `$${parseFloat(formData.total).toFixed(2)}` };
    if (modalType === 'add') {
      setOrders([...orders, newItem]);
    } else if (modalType === 'edit' && currentItem) {
      setOrders(orders.map(item => (item.id === currentItem.id ? { ...newItem, id: item.id } : item)));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      setOrders(orders.filter(item => item.id !== id));
    }
  };

  const handleSearchSubmit = () => {
    // Placeholder cho API call
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Placeholder cho API call
    closeFilterModal();
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý đơn hàng</h2>
        <div>
          <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
          <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
          <button onClick={() => openModal('add')} className="action-button">Thêm đơn hàng</button>
          <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('orderCode')}>Mã đơn hàng <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('customer')}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('date')}>Ngày đặt <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('total')}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('status')}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('paymentMethod')}>Phương thức thanh toán <ArrowUpDown className="sort-icon" /></th>
              <th>Địa chỉ giao hàng</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.orderCode}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.total}</td>
                <td>
                  <span className={order.status === 'Đã xử lý' ? 'status-instock' : 'status-lowstock'}>
                    {order.status}
                  </span>
                </td>
                <td>{order.paymentMethod}</td>
                <td>{order.deliveryAddress}</td>
                <td>{order.note || '-'}</td>
                <td>
                  <button onClick={() => openModal('edit', order)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(order.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination />
      </div>

      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="orders"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="orders"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="orders"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
    </div>
  );
};

export default OrderManager;


/*
import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // Đường dẫn có thể cần điều chỉnh

const OrdersManager = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderCode: "ORD001",
      customer: "Nguyễn Văn A",
      date: "2025-06-20",
      total: "$3700",
      status: "Pending",
      paymentMethod: "COD",
      deliveryAddress: "123 Đường A, Q1, TP.HCM",
      note: "",
    },
  ]);

  const [selectedTab, setSelectedTab] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const openModal = (section, type, data = {}) => {
    if (section !== "orders") return;
    setModalType(type);
    setFormData(type === "edit" ? data : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["orderCode", "customer", "date", "total", "status", "paymentMethod", "deliveryAddress"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError("Vui lòng điền đầy đủ thông tin.");
        return;
      }
    }

    if (modalType === "add") {
      const newId = orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
      const newOrder = { id: newId, ...formData };
      setOrders([...orders, newOrder]);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === formData.id ? formData : o)));
    }

    closeModal();
  };

  const handleDelete = (section, id) => {
    if (section !== "orders") return;
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý đơn hàng</h2>
        <button onClick={() => openModal("orders", "add")} className="action-button">
          Thêm đơn hàng
        </button>
      </div>

      <div className="tabs">
        {[
          { key: "pending", label: "Đơn cần tiếp nhận" },
          { key: "payment", label: "Xác nhận thanh toán" },
          { key: "shipping", label: "Đóng gói & giao hàng" },
          { key: "status", label: "Cập nhật trạng thái" },
          { key: "return", label: "Trả/Đổi hàng" },
          { key: "list", label: "Danh sách đơn hàng" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={selectedTab === tab.key ? "tab active" : "tab"}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {selectedTab === "pending" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.status === "Pending").map((o) => (
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
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng</th>
                <th>Phương thức</th>
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
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.status !== "Shipped").map((o) => (
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
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Trạng thái</th>
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
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
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
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
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

       
      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="orders"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
};

export default OrdersManager;
*/