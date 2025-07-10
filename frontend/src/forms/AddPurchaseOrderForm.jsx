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

  const tongTien = productList.reduce(
    (sum, item) =>
      sum +
      (parseFloat(item.SoLuong) || 0) * (parseFloat(item.DonGiaNhap) || 0),
    0
  );

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "auto", maxWidth: "90vw" }}>
        <div className="modal-header">
         <h2>
            {modalType === "add"
              ? "Thêm Phiếu nhập"
              : modalType === "edit"
              ? "Sửa Phiếu nhập"
              : "Xem Phiếu nhập"}
          </h2>

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
          <input
            type="text"
            name="userName"
            value={formData.userName || "Không rõ"}
            disabled
            className="form-control"
          />


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

          <table className="data-table" style={{ width: "100%", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Sản phẩm</th>
                <th style={{ width: "15%" }}>Số lượng</th>
                <th style={{ width: "15%" }}>Đơn giá nhập</th>
                <th style={{ width: "20%" }}>Thành tiền</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {productList.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={item.MaSP}
                      onChange={(e) =>
                        handleProductChange(index, "MaSP", e.target.value)
                      }
                      style={{ width: "100%" }}
                      required
                    >
                      <option value="">Chọn sản phẩm</option>
                      {products.map((sp) => (
                        <option key={sp.MaSP} value={sp.MaSP}>
                          {sp.TenSP}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.SoLuong}
                      onChange={(e) =>
                        handleProductChange(index, "SoLuong", e.target.value)
                      }
                      min={0}
                      style={{ width: "100%" }}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.DonGiaNhap}
                      onChange={(e) =>
                        handleProductChange(index, "DonGiaNhap", e.target.value)
                      }
                      min={0}
                      style={{ width: "100%" }}
                      required
                    />
                  </td>
                  <td>
                    {(item.SoLuong * item.DonGiaNhap).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-icon delete"
                      onClick={() => removeProductRow(index)}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="action-button" onClick={addProductRow}>
            <Plus size={16} /> Thêm sản phẩm
          </button>

          <p style={{ marginTop: "10px" }}>
            <strong>Tổng tiền toàn bộ:</strong>{" "}
            {tongTien.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>

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
