import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh path nếu cần

const initialPurchaseOrders = [
  { id: 1, code: "PN001", supplier: "Supplier A", date: "2024-05-01", total: 10000.00, status: "Đã nhập" },
  { id: 2, code: "PN002", supplier: "Supplier B", date: "2024-05-02", total: 5000.00, status: "Đang xử lý" },
];


function PurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mở modal
  function openModal(mode, order = null) {
    setModalMode(mode);
    setSelectedOrder(order);
    setModalVisible(true);
  }

  // Đóng modal
  function closeModal() {
    setModalVisible(false);
    setSelectedOrder(null);
  }

  // Gửi form
  function handleSubmit(data) {
    if (modalMode === "add") {
      const newOrder = { ...data, id: Date.now() };
      setPurchaseOrders([...purchaseOrders, newOrder]);
    } else if (modalMode === "edit" && selectedOrder) {
      const updatedOrders = purchaseOrders.map((po) =>
        po.id === selectedOrder.id ? { ...po, ...data } : po
      );
      setPurchaseOrders(updatedOrders);
    }
    closeModal();
  }

  // Xoá
  function handleDelete(id) {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá phiếu nhập này?");
    if (confirmDelete) {
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
    }
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý nhập hàng</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm phiếu nhập
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã phiếu</th>
              <th>Nhà cung cấp</th>
              <th>Ngày nhập</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
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
                <td>${Number(po.total).toFixed(2)}</td>
                <td>{po.status}</td>
                <td>
                  <button onClick={() => openModal("edit", po)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(po.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <GeneralModalForm
          section="purchaseOrders"
          mode={modalMode}
          initialData={selectedOrder}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default PurchaseOrderManager;
