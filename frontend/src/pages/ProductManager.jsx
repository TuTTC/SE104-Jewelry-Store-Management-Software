// src/components/ProductManager.jsx
import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "./GeneralModalForm";

const initialProducts = [
  { id: 1, code: "SP001", name: "Ruby Ring", price: "$1200", category: "Ring", quantity: 10, status: "In Stock", image: "https://via.placeholder.com/50", note: "Best Seller" },
  { id: 2, code: "SP002", name: "Sapphire Necklace", price: "$2500", category: "Necklace", quantity: 5, status: "Low Stock", image: "https://via.placeholder.com/50", note: "Limited Edition" },
];

const ProductManager = () => {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (mode, product = null) => {
    setFormMode(mode);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleSubmit = (data) => {
    if (formMode === "add") {
      const newProduct = { ...data, id: Date.now(), image: data.image || "/images/default.jpg" };
      setProducts((prev) => [...prev, newProduct]);
    } else if (formMode === "edit" && selectedProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...data } : p))
      );
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (confirmDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý sản phẩm</h2>
        <button onClick={() => openModal("add")} className="action-button">Thêm sản phẩm</button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Hình ảnh</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString()}₫</td>
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
                  <button onClick={() => openModal("edit", p)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <GeneralModalForm
          section="products"
          mode={formMode}
          data={selectedProduct}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default ProductManager;
