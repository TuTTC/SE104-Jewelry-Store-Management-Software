
import React from "react";
import { X, Trash } from "lucide-react";

const OrderDetailModal = ({
  showModal,
  onClose,
  formData,
  handleInputChange,
  selectedOrderDetails,
  products,
  updateOrderDetail,
  removeOrderDetail,
  addOrderDetail,
  saveOrderDetails,
  selectedOrderId,
  inChiTietDonHang,
  users = [], // Thêm tham số customers
  role,
  modalType
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
  <form onSubmit={e => { e.preventDefault(); saveOrderDetails(); }}>
    <div className="modal" style={{ width: "auto", maxWidth: "90vw", padding: "20px" }}>
      <div className="modal-header">
  <h2>
    {modalType === "view"
      ? `Xem đơn hàng #${formData?.id}`
      : formData?.id
        ? `Sửa đơn hàng #${formData.id}`
        : "Thêm đơn hàng"}
  </h2>
  <button onClick={onClose} className="modal-close">
    <X className="icon" />
  </button>
</div>


      {/* === Form thông tin đơn hàng === */}
      <div className="modal-form">
         {role !== "Khách hàng" ? (
          <select
            name="customerId"
            value={formData.customerId || ""}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>-- Chọn khách hàng --</option>
            {users.map((kh) => (
              <option key={kh.UserID} value={kh.UserID}>
                {kh.HoTen}
              </option>
            ))}
          </select>
        ) : (
          <>
            <label>Khách hàng</label>
            <input
              type="text"
              value={formData.customerName || ""}
              disabled
              readOnly
            />
          </>
        )}
        <input
          type="date"
          name="date"
          value={formData.date || ""}
          onChange={handleInputChange}
          required
        />
        <select
          name="status"
          value={formData.status || "Pending"}
          onChange={handleInputChange}
        >
          <option value="Pending">Chờ xử lý</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Shipped">Đã giao</option>
          <option value="Completed">Hoàn thành</option>
        </select>
        <input
          type="text"
          name="paymentMethod"
          value={formData.paymentMethod || ""}
          onChange={handleInputChange}
          placeholder="Phương thức thanh toán"
        />
        <input
          type="text"
          name="deliveryAddress"
          value={formData.deliveryAddress || ""}
          onChange={handleInputChange}
          placeholder="Địa chỉ giao hàng"
        />
      </div>

      {/* === Bảng chi tiết đơn hàng === */}
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
      {role !== "Khách hàng" && (
        <button type="button" className="action-button" onClick={addOrderDetail}>
          Thêm sản phẩm
        </button>
      )}

      </div>

      {/* === Hành động === */}
      <div className="modal-actions">
        {formData?.id && (
          <button
            type="button"
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
        )}
        {role !== "Khách hàng" && (
        <button type="submit" className="action-button">
          Lưu
        </button>
        )}
        <button type="button" className="action-button cancel" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  </form>
</div>
  );
}

export default OrderDetailModal;
