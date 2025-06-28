import React, { useEffect, useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import * as productAPI from "../services/productApi";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    productAPI.getAllProducts()
      .then(data => setProducts(data))
      .catch(err => alert(err.message));

  };

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
      productAPI.addProduct(data)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => alert(err.message));
    } else if (formMode === "edit" && selectedProduct) {
      productAPI.updateProduct(selectedProduct.MaSP, data)
        .then(() => {
          fetchProducts();
          closeModal();
        })
        .catch(err => alert(err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      productAPI.deleteProduct(id)
        .then(() => fetchProducts())
        .catch(err => alert(err.message));
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
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Nhà cung cấp</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Hình ảnh</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.MaSP}>
                <td>{p.MaSP}</td>
                <td>{p.TenSP}</td>
                <td>{p.MaDM}</td>
                <td>{p.MaNCC}</td>
                <td>{Number(p.GiaBan).toLocaleString()}₫</td>
                <td>{p.SoLuongTon}</td>
                <td>
                  <img src={p.HinhAnh || "/images/default.jpg"} alt={p.TenSP} className="product-image" />
                </td>
                <td>{p.MoTa}</td>
                <td>
                  <button onClick={() => openModal("edit", p)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(p.MaSP)} className="action-icon delete">
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
