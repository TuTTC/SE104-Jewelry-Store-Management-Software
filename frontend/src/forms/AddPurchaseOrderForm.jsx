import React, { useEffect, useState } from "react";
import { Plus, Trash, X } from "lucide-react";
import * as supplierApi from "../services/supplierApi";
import * as productApi from "../services/productApi";
import userApi from "../services/userApi";
import "../App.css";

const STATUS_OPTIONS = [
  { value: "da_nhap", label: "Đã nhập" },
  { value: "dang_xu_ly", label: "Đang xử lý" },
  { value: "huy", label: "Hủy" },
];

function PurchaseOrderForm({
  showModal,
  closeModal,
  modalType,
  formData,
  initialData,
  handleInputChange,
  handleSubmit,
  onSuccess,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [productList, setProductList] = useState(
    Array.isArray(formData.ChiTiet) ? formData.ChiTiet : []
  );

  useEffect(() => {
    if (showModal) {
      loadSuppliers();
      loadProducts();
      loadUsers();
    }
  }, [showModal]);

  useEffect(() => {
    if (initialData && Array.isArray(initialData.ChiTiet)) {
      setProductList(initialData.ChiTiet);
      handleInputChange({
        target: { name: "ChiTiet", value: initialData.ChiTiet },
      });
    }
  }, [initialData]);

  const loadSuppliers = async () => {
    try {
      const res = await supplierApi.getAllSuppliers();
      setSuppliers(res);
    } catch (err) {
      console.error("Lỗi load nhà cung cấp:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productApi.getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userApi.getAllUsers();
      setUsers(res);
    } catch (err) {
      console.error("Lỗi load người dùng:", err);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedList = [...productList];
    updatedList[index][field] = value;
    setProductList(updatedList);
    handleInputChange({
      target: { name: "ChiTiet", value: updatedList },
    });
  };

  const addProductRow = () => {
    const newList = [...productList, { MaSP: "", SoLuong: 0, DonGiaNhap: 0 }];
    setProductList(newList);
    handleInputChange({
      target: { name: "ChiTiet", value: newList },
    });
  };

  const removeProductRow = (index) => {
    const updatedList = [...productList];
    updatedList.splice(index, 1);
    setProductList(updatedList);
    handleInputChange({
      target: { name: "ChiTiet", value: updatedList },
    });
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{modalType === "add" ? "Thêm Phiếu nhập" : "Sửa Phiếu nhập"}</h2>
          <button onClick={closeModal} className="modal-close">
            <X className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <h3>Thông tin phiếu nhập</h3>

          <label>Nhà cung cấp:</label>
          <select
            name="supplier"
            value={formData.supplier || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliers.map((ncc) => (
              <option key={ncc.MaNCC} value={ncc.MaNCC}>
                {ncc.TenNCC}
              </option>
            ))}
          </select>

          <label>Người lập:</label>
          <select
            name="user"
            value={formData.user || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Chọn người lập</option>
            {users.map((nguoiDung) => (
              <option key={nguoiDung.UserID} value={nguoiDung.UserID}>
                {nguoiDung.Email}
              </option>
            ))}
          </select>

          <label>Ngày nhập:</label>
          <input
            type="date"
            name="date"
            value={formData.date || ""}
            onChange={handleInputChange}
            required
          />

          <label>Trạng thái:</label>
          <select
            name="status"
            value={formData.status || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Chọn trạng thái</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

      <h3>Danh sách sản phẩm</h3>
{productList.map((item, index) => (
  <div key={index} className="product-row"> <br/>
    
    <div>
      <strong>STT: {index + 1}</strong><br/>
    </div>

    <div>
      <label>Sản phẩm</label><br />
      <select
        value={item.MaSP}
        onChange={(e) =>
          handleProductChange(index, "MaSP", e.target.value)
        }
        required
      >
        <option value="">Chọn sản phẩm</option>
        {products.map((sp) => (
          <option key={sp.MaSP} value={sp.MaSP}>
            {sp.TenSP}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label>Số lượng</label><br />
      <input
        type="number"
        placeholder="Số lượng"
        value={item.SoLuong}
        min={0}
        onChange={(e) =>
          handleProductChange(index, "SoLuong", e.target.value)
        }
        required
      />
    </div>

    <div>
      <label>Đơn giá nhập</label><br />
      <input
        type="number"
        placeholder="Đơn giá nhập"
        value={item.DonGiaNhap}
        min={0}
        onChange={(e) =>
          handleProductChange(index, "DonGiaNhap", e.target.value)
        }
        required
      />
    </div>

    <button type="button" onClick={() => removeProductRow(index)}>
      <Trash size={16} />
    </button>
  </div>
))}

          <p>
            <strong>Tổng tiền toàn bộ:</strong>{" "}
            {productList.reduce(
              (sum, item) =>
                sum +
                (parseFloat(item.SoLuong) || 0) * (parseFloat(item.DonGiaNhap) || 0),
              0
            ).toLocaleString()}{" "}
            VND
          </p>


          <button type="button" onClick={addProductRow}>
            <Plus size={16} /> Thêm sản phẩm
          </button>

          <div className="modal-actions">
            <button type="submit" className="action-button">
              Lưu
            </button>
            <button type="button" onClick={closeModal} className="action-button cancel">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseOrderForm;
