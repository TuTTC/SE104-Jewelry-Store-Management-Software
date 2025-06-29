import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import Modal from "../components/GeneralModalForm";
import categoryApi from "../services/categoryApi";

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      const formattedData = data.map((item) => ({
        id: item.MaDM,
        name: item.TenDM,
        description: item.MoTa,
      }));
      setCategories(formattedData);
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err.message);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setFormData(item ? { name: item.name, description: item.description } : {});
    setEditingId(item?.id || null);
    setShowModal(true);
    console.log(showModal);

    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const payload = {
      TenDM: formData.name,
      MoTa: formData.description || "",
    };

    try {
      if (modalType === "add") {
        const res = await categoryApi.add(payload);
        setCategories((prev) => [
          ...prev,
          {
            id: res.MaDM,
            name: formData.name,
            description: formData.description || "",
          },
        ]);
      } else if (modalType === "edit" && editingId != null) {
        await categoryApi.update(editingId, payload);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId
              ? { ...cat, name: formData.name, description: formData.description }
              : cat
          )
        );
      }
      closeModal();
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryApi.delete(id);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err.message);
      }
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
                  <button
                    onClick={() => openModal("edit", c)}
                    className="action-icon edit"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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

       {showModal && (
          <Modal
            showModal={showModal} // truyền đầy đủ
            closeModal={closeModal}
            modalType={modalType}
            currentSection="categories"
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            error={null} // hoặc có biến error thì truyền vào
          />
        )}

    </div>
  );
}

export default CategoryManager;
