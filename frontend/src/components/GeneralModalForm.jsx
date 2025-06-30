import React from "react";
import { X } from "lucide-react";

const GeneralModalForm = ({
  showModal,
  closeModal,
  modalType,
  currentSection,
  formData,
  handleInputChange,
  handleSubmit,
  error,
}) => {
  if (!showModal) return null;

  const renderSectionFields = () => {
    switch (currentSection) {
      case "products":
        return (
          <>
            <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã sản phẩm" required />
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên sản phẩm" required />
            <input type="text" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Giá (VD: $1200)" required />
            <input type="text" name="category" value={formData.category || ""} onChange={handleInputChange} placeholder="Danh mục" required />
            <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleInputChange} placeholder="Số lượng" required />
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="In Stock">Còn hàng</option>
              <option value="Low Stock">Sắp hết</option>
            </select>
            <input type="text" name="image" value={formData.image || ""} onChange={handleInputChange} placeholder="URL hình ảnh" required />
            <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú" />
          </>
        );
      case "orders":
        return (
          <>
            <input type="text" name="orderCode" value={formData.orderCode || ""} onChange={handleInputChange} placeholder="Mã đơn hàng" required />
            <input type="text" name="customer" value={formData.customer || ""} onChange={handleInputChange} placeholder="Khách hàng" required />
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
            <input type="text" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Tổng tiền (VD: $3700)" required />
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Shipped">Đã giao</option>
            </select>
            <input type="text" name="paymentMethod" value={formData.paymentMethod || ""} onChange={handleInputChange} placeholder="Phương thức thanh toán" required />
            <input type="text" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleInputChange} placeholder="Địa chỉ giao hàng" required />
            <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú" />
          </>
        );
      case "customers":
        
      case "accounts":
        return (
          <>
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên" required />
            {currentSection === "customers" && (
              <input type="text" name="customerCode" value={formData.customerCode || ""} onChange={handleInputChange} placeholder="Mã khách hàng" required />
            )}
            {currentSection === "accounts" && (
              <input type="text" name="accountCode" value={formData.accountCode || ""} onChange={handleInputChange} placeholder="Mã tài khoản" required />
            )}
            <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" required />
            <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" required />
            <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
            {currentSection === "customers" && (
              <input type="text" name="totalSpent" value={formData.totalSpent || ""} onChange={handleInputChange} placeholder="Tổng chi tiêu" required />
            )}
            {currentSection === "accounts" && (
              <input type="text" name="position" value={formData.position || ""} onChange={handleInputChange} placeholder="Chức vụ" required />
            )}
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="Active">Kích hoạt</option>
              <option value="Inactive">Không hoạt động</option>
            </select>
            <select name="role" value={formData.role || ""} onChange={handleInputChange} required>
              <option value="">Chọn vai trò</option>
              <option value="Customer">Khách hàng</option>
              <option value="Admin">Quản trị</option>
              <option value="Employee">Nhân viên</option>
            </select>
          </>
        );
      case "categories":
        return (
          <>
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên danh mục" required />
            <input type="text" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Mô tả" />
          </>
        );
      case "services":
        return (
          <>
            <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã dịch vụ" required />
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên dịch vụ" required />
            <input type="number" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Giá" step="0.01" required />
            <input type="text" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Mô tả" required />
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="true">Kích hoạt</option>
              <option value="false">Không hoạt động</option>
            </select>
          </>
        );
      case "purchaseOrders":
        return (
          <>
            <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã phiếu nhập" required />
            <input type="text" name="supplier" value={formData.supplier || ""} onChange={handleInputChange} placeholder="Nhà cung cấp" required />
            <input type="text" name="user" value={formData.user || ""} onChange={handleInputChange} placeholder="Người nhập" required />
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
            <input type="number" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Tổng tiền" step="0.01" required />
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="Đã nhập">Đã nhập</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Hủy">Hủy</option>
            </select>
          </>
        );
      case "suppliers":
        return (
          <>
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên nhà cung cấp" required />
            <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" />
            <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
            <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
            <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú"/>
          </>
        );
      case "inventory":
        return (
          <>
            <input type="number" name="productId" value={formData.productId || ""} onChange={handleInputChange} placeholder="ID sản phẩm" required />
            <input type="number" name="quantity" value={formData.quantity || ""} onChange={handleInputChange} placeholder="Số lượng" required />
            <input type="date" name="lastUpdated" value={formData.lastUpdated || ""} onChange={handleInputChange} required />
          </>
        );
      case "reports":
        return (
          <>
            <select name="type" value={formData.type || ""} onChange={handleInputChange} required>
              <option value="">Chọn loại</option>
              <option value="Doanh thu">Doanh thu</option>
              <option value="Tồn kho">Tồn kho</option>
              <option value="Lợi nhuận">Lợi nhuận</option>
            </select>
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
            <input type="text" name="data" value={formData.data || ""} onChange={handleInputChange} placeholder="Dữ liệu (JSON)" required />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{modalType === "add" ? `Thêm ${currentSection}` : `Sửa ${currentSection}`}</h2>
          <button onClick={closeModal} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <p className="error-message">{error}</p>}
          {renderSectionFields()}
          <div className="modal-actions">
            <button type="submit" className="action-button">Lưu</button>
            <button type="button" onClick={closeModal} className="action-button cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralModalForm;
