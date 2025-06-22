import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import Modal from "./GeneralModalForm"; // hoặc modal bạn đang dùng

const initialCategories = [
  { id: 1, name: "Ring", description: "Jewelry rings" },
  { id: 2, name: "Necklace", description: "Jewelry necklaces" },
];

function CategoryManager() {
  const [categories, setCategories] = useState(initialCategories);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item || {});
    setEditingId(item?.id || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (modalType === "add") {
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        description: formData.description || "",
      };
      setCategories((prev) => [...prev, newCategory]);
    } else if (modalType === "edit" && editingId != null) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === editingId ? { ...cat, ...formData } : cat))
      );
    }

    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý danh mục sản phẩm</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm danh mục
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
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
                  <button onClick={() => openModal("edit", c)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={modalType === "add" ? "Thêm danh mục" : "Cập nhật danh mục"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form-content">
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              placeholder="Tên danh mục"
              required
            />
            <input
              type="text"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Mô tả"
            />
            <button type="submit" className="action-button">
              {modalType === "add" ? "Thêm" : "Cập nhật"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CategoryManager;
