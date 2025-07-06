import React from "react";
import { X, Trash } from "lucide-react";

const OrderDetailModal = ({
  showModal,
  onClose,
  selectedOrderDetails,
  setSelectedOrderDetails,
  products,
  updateOrderDetail,
  removeOrderDetail,
  addOrderDetail,
  saveOrderDetails,
  selectedOrderId,
  inChiTietDonHang,
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "auto", maxWidth: "90vw", padding: "20px" }}>
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{selectedOrderId}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <div className="modal-form">
          <table className="data-table" style={{ width: "100%", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Sản phẩm</th>
                <th style={{ width: "15%" }}>Số lượng</th>
                <th style={{ width: "15%" }}>Giá bán</th>
                <th style={{ width: "20%" }}>Thành tiền</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderDetails.map((row, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={row.MaSP}
                      onChange={(e) => {
                        const selectedProductId = parseInt(e.target.value, 10);
                        const selectedProduct = products.find(
                          (sp) => sp.MaSP === selectedProductId
                        );
                        updateOrderDetail(index, "MaSP", selectedProductId);
                        updateOrderDetail(
                          index,
                          "GiaBan",
                          selectedProduct ? selectedProduct.GiaBan : 0
                        );
                      }}
                      style={{ width: "100%" }}
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
                      value={row.SoLuong}
                      onChange={(e) => updateOrderDetail(index, "SoLuong", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.GiaBan}
                      onChange={(e) => updateOrderDetail(index, "GiaBan", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    {(row.SoLuong * row.GiaBan).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td>
                    <button
                      className="action-icon delete"
                      onClick={() => removeOrderDetail(index)}
                    >
                      <Trash className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="action-button" onClick={addOrderDetail}>
            Thêm sản phẩm
          </button>
        </div>
        <div className="modal-actions">
          <button
            className="action-button"
            onClick={async () => {
              try {
                const blob = await inChiTietDonHang(selectedOrderId);
                const url = window.URL.createObjectURL(blob);
                window.open(url);
              } catch (err) {
                alert("Lỗi khi tạo PDF: " + err.message);
              }
            }}
          >
            In chi tiết đơn hàng
          </button>
          <button className="action-button" onClick={saveOrderDetails}>
            Lưu
          </button>
          <button className="action-button cancel" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;