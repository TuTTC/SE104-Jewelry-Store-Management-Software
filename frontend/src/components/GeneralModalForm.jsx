import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const GeneralModalForm = ({
  section,
  mode,
  initialData,
  onClose,
  onSubmit,
  showModal,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Reset formData when modal opens/closes or section changes
    if (!initialData || mode === 'add') {
      setFormData({});
      return;
    }

    if (section === "services") {
      setFormData({
        name: initialData.TenDV || "",
        price: initialData.DonGia || "",
        description: initialData.MoTa || "",
        status: initialData.TrangThai ? "true" : "false",
        id: initialData.MaDV || null,
      });
    } else if (section === "orders") {
      setFormData({
        id: initialData.id || initialData.MaDH || null,
        customerId: initialData.customerId || initialData.MaKH || "",
        customer: initialData.customer || "",
        date: initialData.date || initialData.NgayDat || "",
        total: initialData.total || initialData.TongTien || "",
        status: initialData.status || initialData.TrangThai || "Pending",
        paymentMethod: initialData.paymentMethod || "",
        deliveryAddress: initialData.deliveryAddress || "",
      });
    }
  }, [initialData, section, mode]);

  if (!showModal) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            {mode === "add"
              ? `Thêm ${section === "services" ? "dịch vụ" : "đơn hàng"}`
              : `Sửa ${section === "services" ? "dịch vụ" : "đơn hàng"}`}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X className="icon" />
          </button>
        </div>

        <div className="modal-form">
          {section === "services" && (
            <>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Tên dịch vụ"
                required
              />
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price || ""}
                onChange={handleInputChange}
                placeholder="Giá"
                required
              />
              <input
                type="text"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Mô tả"
              />
              <select
                name="status"
                value={formData.status || "true"}
                onChange={handleInputChange}
                required
              >
                <option value="true">Kích hoạt</option>
                <option value="false">Không hoạt động</option>
              </select>
            </>
          )}

          {section === "orders" && (
            <>
              <input
                type="number"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                placeholder="Mã khách hàng (MaKH)"
                required
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleInputChange}
                placeholder="Tổng tiền"
                required
              />
              <select
                name="status"
                value={formData.status}
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
                value={formData.paymentMethod}
                onChange={handleInputChange}
                placeholder="Phương thức thanh toán"
              />
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Địa chỉ giao hàng"
              />
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleSubmit}
              className="action-button"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="action-button cancel"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralModalForm;
