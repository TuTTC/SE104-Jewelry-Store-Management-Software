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
  const [thoiGianLoai] = useState("ngay");
  const [selectedDate] = useState("");
  const [selectedMonth] = useState("");
  const [selectedYear] = useState("");
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
      data.chiphirieng = initialData.ChiPhiRieng || '';
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
      data.LoaiBaoCao     = initialData.LoaiBaoCao || '';
      data.TuNgay         = initialData.TuNgay?.slice(0,10) || '';
      data.DenNgay        = initialData.DenNgay?.slice(0,10) || '';
      data.MoTa           = initialData.MoTa || '';
      data.thoiGianLoai   = initialData.thoiGianLoai || '';
      data.selectedDate   = initialData.selectedDate || '';
      data.selectedMonth  = initialData.selectedMonth || '';
      data.selectedYear   = initialData.selectedYear || '';
    }
    setFormData(data);
  }, [initialData, section, mode]);

  if (!showModal) return null;
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Xử lý riêng cho section reports
    if (section === "reports") {
      if (name === "thoiGianLoai") {
        setFormData((prev) => ({
          ...prev,
          thoiGianLoai: value,
          TuNgay: "",
          DenNgay: "",
          selectedDate: "",
          selectedMonth: "",
          selectedYear: ""
        }));
        return;
      }

      if (name === "selectedDate") {
        setFormData((prev) => ({
          ...prev,
          selectedDate: value,
          TuNgay: value,
          DenNgay: value
        }));
        return;
      }

      if (name === "selectedMonth") {
        const [year, month] = value.split("-");
        const lastDay = new Date(year, month, 0).getDate();
        setFormData((prev) => ({
          ...prev,
          selectedMonth: value,
          TuNgay: `${year}-${month}-01`,
          DenNgay: `${year}-${month}-${String(lastDay).padStart(2, "0")}`
        }));
        return;
      }

      if (name === "selectedYear") {
        setFormData((prev) => ({
          ...prev,
          selectedYear: value,
          TuNgay: `${value}-01-01`,
          DenNgay: `${value}-12-31`
        }));
        return;
      }
    }

    // Các field chung cho mọi section
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit trong GeneralModalForm được gọi");
    if (onSubmit) {
      onSubmit({
      ...formData,
      thoiGianLoai,
      selectedDate,
      selectedMonth,
      selectedYear,
    }); // Gọi về ServiceManager.jsx
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
                placeholder="Giá dịch vụ"
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
              {/* Report type */}
              <select
                name="LoaiBaoCao"
                value={formData.LoaiBaoCao || ""}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Chọn loại báo cáo</option>
                <option value="Doanh thu">Doanh thu</option>
                <option value="Lợi nhuận">Lợi nhuận</option>
              </select>

              {/* Time period selector */}
              <select
                name="thoiGianLoai"
                value={formData.thoiGianLoai || ""}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Chọn thời gian</option>
                <option value="ngay">Báo cáo ngày</option>
                <option value="thang">Báo cáo tháng</option>
                <option value="nam">Báo cáo năm</option>
              </select>

              {/* Ngày */}
              {formData.thoiGianLoai === "ngay" && (
                <input
                  type="date"
                  name="selectedDate"
                  value={formData.selectedDate || ""}
                  onChange={handleInputChange}
                  required
                />
              )}

              {/* Tháng */}
              {formData.thoiGianLoai === "thang" && (
                <input
                  type="month"
                  name="selectedMonth"
                  value={formData.selectedMonth || ""}
                  onChange={handleInputChange}
                  required
                />
              )}

              {/* Năm */}
              {formData.thoiGianLoai === "nam" && (
                <select
                  name="selectedYear"
                  value={formData.selectedYear || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Chọn năm</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              )}

              {/* Description */}
              <textarea
                name="MoTa"
                value={formData.MoTa || ""}
                onChange={handleInputChange}
                placeholder="Mô tả báo cáo"
                rows={3}
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