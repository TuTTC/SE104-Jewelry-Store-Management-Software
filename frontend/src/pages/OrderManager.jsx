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

      {/* Modal Form */}
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
