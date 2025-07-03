import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const GeneralModalForm = ({
  section,
  mode,
  initialData,
  onClose,
  onSubmit,
  showModal
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {

    console.log("initialData:", initialData);
    console.log("section:", section, "mode:", mode);
    if (!initialData || mode === 'add') {
      setFormData({});
      return;
    }
    const data = {};
    if (section === 'services') {
      data.name = initialData.TenDV || '';
      data.price = initialData.DonGia || '';
      data.description = initialData.MoTa || '';
      data.status = initialData.TrangThai ? 'true' : 'false';
    } else if (section === 'orders') {
      data.id = initialData.id || '';  // dùng id đúng với dữ liệu frontend
      data.customerId = initialData.customerId || '';
      data.date = initialData.date || '';
      data.total = initialData.total || '';
      data.status = ["Pending", "Paid", "Shipped", "Completed"].includes(initialData.status)
        ? initialData.status
        : "Pending";
      data.paymentMethod = initialData.paymentMethod || '';
      data.deliveryAddress = initialData.deliveryAddress || '';
    } else if (section === 'reports') {
      data.LoaiBaoCao = initialData.LoaiBaoCao || '';
      data.TuNgay = initialData.TuNgay?.slice(0,10) || '';
      data.DenNgay = initialData.DenNgay?.slice(0,10) || '';
      data.MoTa = initialData.MoTa || '';
    }
    setFormData(data);
  }, [initialData, section, mode]);

  if (!showModal) return null;
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let parsedValue = value;
    if (name === "status") {
      parsedValue = value === "true"; // ép kiểu thành boolean
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit trong GeneralModalForm được gọi");
    if (onSubmit) {
      onSubmit(formData); // Gọi về ServiceManager.jsx
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            {mode === "add"
              ? `Thêm ${
                  section === "services"
                    ? "dịch vụ"
                    : section === "orders"
                    ? "đơn hàng"
                    : section === "reports"
                    ? "báo cáo"
                    : ""
                }`
              : `Sửa ${
                  section === "services"
                    ? "dịch vụ"
                    : section === "orders"
                    ? "đơn hàng"
                    : section === "reports"
                    ? "báo cáo"
                    : ""
                }`}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X className="icon" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modal-form">
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
                value={formData.status === true ? "true" : "false"}
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
                value={formData.customerId || ""}
                onChange={handleInputChange}
                placeholder="Mã khách hàng (MaKH)"
                required
              />
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
            </>
          )}

          {section === "reports" && (
            <>
              <select
                name="LoaiBaoCao"
                value={formData.LoaiBaoCao || ""}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Chọn loại báo cáo
                </option>
                <option value="Doanh thu">Doanh thu</option>
                <option value="Tồn kho">Tồn kho</option>
              </select>
              <input
                type="date"
                name="TuNgay"
                value={formData.TuNgay || ""}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="DenNgay"
                value={formData.DenNgay || ""}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="MoTa"
                value={formData.MoTa || ""}
                onChange={handleInputChange}
                placeholder="Mô tả báo cáo"
                rows={4}
              />
            </>
          )}

          <div className="modal-actions">
            <button type="submit" className="action-button">
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
        </form>
      </div>
    </div>
  );
};

export default GeneralModalForm;