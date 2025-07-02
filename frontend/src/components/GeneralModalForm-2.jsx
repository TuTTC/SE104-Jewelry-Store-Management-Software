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
      data.customerId = initialData.MaKH || '';
      data.date = initialData.NgayDat?.slice(0,10) || '';
      data.total = initialData.TongTien || '';
      data.status = initialData.TrangThai || 'Pending';
      data.paymentMethod = initialData.PhuongThucThanhToan || '';
      data.deliveryAddress = initialData.DiaChiGiao || '';
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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