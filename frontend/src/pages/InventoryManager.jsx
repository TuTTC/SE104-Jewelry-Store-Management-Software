import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // cập nhật đường dẫn nếu cần

const InventoryManager = () => {
  const [inventory, setInventory] = useState([
    { id: 1, productId: 101, quantity: 50, lastUpdated: "2025-06-01" },
    { id: 2, productId: 102, quantity: 30, lastUpdated: "2025-06-10" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // or "edit"
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const openModal = (section, type, data = {}) => {
    if (section !== "inventory") return;
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
    const { productId, quantity, lastUpdated } = formData;

    if (!productId || !quantity || !lastUpdated) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (modalType === "add") {
      const newId = inventory.length ? Math.max(...inventory.map((i) => i.id)) + 1 : 1;
      const newItem = { id: newId, ...formData };
      setInventory([...inventory, newItem]);
    } else {
      setInventory((prev) =>
        prev.map((i) => (i.id === formData.id ? formData : i))
      );
    }

    closeModal();
  };

  const handleDelete = (section, id) => {
    if (section !== "inventory") return;
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa?");
    if (confirm) {
      setInventory((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý tồn kho</h2>
        <button onClick={() => openModal("inventory", "add")} className="action-button">
          Thêm tồn kho
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Sản phẩm</th>
              <th>Số lượng</th>
              <th>Ngày cập nhật</th>
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
                  <button
                    onClick={() => openModal("inventory", "edit", i)}
                    className="action-icon edit"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete("inventory", i.id)}
                    className="action-icon delete"
                  >
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <GeneralModalForm
        showModal={showModal}
        closeModal={closeModal}
        modalType={modalType}
        currentSection="inventory"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
};

export default InventoryManager;
