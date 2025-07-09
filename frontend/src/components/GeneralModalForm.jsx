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
  modalMode,
  handleImageUpload,
  categories,
  suppliers
}) => {
  if (!showModal) return null;
  
  const renderSectionFields = () => {
    switch (currentSection) {
      case "products":
        return (
          <>
            <label>Tên sản phẩm</label> 
            <input type="text" name="TenSP" value={formData.TenSP || ""} onChange={handleInputChange} placeholder="Tên sản phẩm" required />
            <label>Giá bán (VND)</label> 
            <input type="number" name="GiaBan" value={formData.GiaBan || ""} onChange={handleInputChange} placeholder="Giá bán (VND)" required
            />

            {/* <input type="text" name="TenDM" value={formData.TenDM || ""} onChange={handleInputChange} placeholder="Ten danh mục" required /> */}
             <label>Danh mục</label>
                <select
                  name="MaDM"
                  value={formData.MaDM || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((dm) => (
                    <option key={dm.MaDM} value={dm.MaDM}>
                      {dm.TenDM}
                    </option>
                  ))}
                </select>
            <label>Số lượng tồn</label>
            <input type="number" name="SoLuongTon" value={formData.SoLuongTon || ""} onChange={handleInputChange} placeholder="Số lượng tồn" required />
            {/* <label>Tên nhà cung cấp</label> */}
            {/* <input type="text" name="TenNCC" value={formData.TenNCC || ""} onChange={handleInputChange} placeholder="Tên nhà cung cấp" required/> */}
            <label>Nhà cung cấp</label>
            <select
              name="MaNCC"
              value={formData.MaNCC || ""}
              onChange={handleInputChange}
              requireds
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((ncc) => (
                <option key={ncc.MaNCC} value={ncc.MaNCC}>
                  {ncc.TenNCC}
                </option>
              ))}
            </select>

            {/* <input type="text" name="HinhAnh" value={formData.HinhAnh || ""} onChange={handleInputChange} placeholder="URL hình ảnh" required/> */}
              {/* Upload ảnh */}
            <label>Ảnh sản phẩm</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {/* Hiển thị ảnh đã chọn nếu có */}
            {formData.HinhAnh && (
              <img
                src={formData.HinhAnh}
                alt="Ảnh sản phẩm"
                style={{ width: "100px", marginTop: "10px" }}
              />
            )}
            <label>Ghi chú</label>
            <input type="text" name="MoTa" value={formData.MoTa || ""} onChange={handleInputChange} placeholder="Ghi chú"/>
          </>

        );
      case "orders":
        return (
          <>
            <label>Mã đơn hàng</label>
            <input type="text" name="orderCode" value={formData.orderCode || ""} onChange={handleInputChange} placeholder="Mã đơn hàng" required />
            <label>Khách hàng</label>
            <input type="text" name="customer" value={formData.customer || ""} onChange={handleInputChange} placeholder="Khách hàng" required />
            <label>Ngày</label>
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
            <label>Tổng tiền</label>
            <input type="text" name="total" value={formData.total || ""} onChange={handleInputChange} placeholder="Tổng tiền (VD: $3700)" required />
            <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Shipped">Đã giao</option>
            </select>
             <label>Phương thức thanh toán</label>
            <input type="text" name="paymentMethod" value={formData.paymentMethod || ""} onChange={handleInputChange} placeholder="Phương thức thanh toán" required />
             <label>Địa chỉ giao hàng</label>
            <input type="text" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleInputChange} placeholder="Địa chỉ giao hàng" required />
             <label>Ghi chú</label>
            <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú" />
          </>
        );
      
      case "accounts":
        return (
          <>
          <label>Tên đăng nhập</label>
          <input type="text" name="username" value={formData.username || ""} onChange={handleInputChange} placeholder="Tên đăng nhập" required />
          {modalMode === "add" && (
              <>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  placeholder="Mật khẩu"
                  required
                />
              </>
            )}

          <label>Email</label>
          <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" required />
          <label>Họ và tên</label>
          <input type="text" name="fullName" value={formData.fullName || ""} onChange={handleInputChange} placeholder="Họ và tên" required />
          <label>SĐT</label>
          <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" required />
          <label>Địa chỉ</label>
          <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
          <label>Ngày đăng ký</label>
          <input type="date" name="createdAt" value={formData.createdAt ? formData.createdAt.slice(0, 10) : ""} onChange={handleInputChange} required />
          <label>Vai trò</label>
          <select name="role" value={formData.role || ""} onChange={handleInputChange} required>
              <option value="">Chọn vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Quản trị</option>
              <option value="employee">Nhân viên</option>
            </select>
            <label>Trạng thái</label>
              <select name="status" value={formData.status || ""} onChange={handleInputChange} required>
              <option value="">Chọn trạng thái</option>
              <option value="true" >Kích hoạt</option>
              <option value="false">Khóa</option>
          </select>
          </>
        );
      case "categories":
        return (
          <>
            <label>Tên danh mục</label>
            <input type="text" name="TenDM" value={formData.TenDM || ""} onChange={handleInputChange} placeholder="Tên danh mục" required />
            <label>Đơn vị tính</label>
            <input type="text" name="DonViTinh" value={formData.DonViTinh || ""} onChange={handleInputChange} placeholder="Đơn vị tính" />
            <label>Phần trăm lợi nhuận %</label>
            <input type="number" name="PhanTramLoiNhuan" value={formData.PhanTramLoiNhuan || ""} onChange={handleInputChange} placeholder="Phần trăm lợi nhuận %" min = "0" />       
            <label>Mô tả</label>     
            <input type="text" name="MoTa" value={formData.MoTa || ""} onChange={handleInputChange} placeholder="Mô tả" />
          </>
        );
      case "services":
        return (
          <>
            <label>Mã dịch vụ</label>  
            <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã dịch vụ" required />
            <label>Tên dịch vụ</label>  
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên dịch vụ" required />
            <label>Giá</label>  
            <input type="number" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="Giá" step="0.01" required />
            <label>Mô tả</label>  
            <input type="text" name="description" value={formData.description || ""} onChange={handleInputChange} placeholder="Mô tả" required />
            <label>Trang thai</label>  
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
            {/* <input type="text" name="code" value={formData.code || ""} onChange={handleInputChange} placeholder="Mã phiếu nhập" required /> */}
            <label>Nhà cung cấp</label>  
            <input type="text" name="supplier" value={formData.supplier || ""} onChange={handleInputChange} placeholder="Nhà cung cấp" required />
            <label>Người nhập</label>  
            <input type="text" name="user" value={formData.user || ""} onChange={handleInputChange} placeholder="Người nhập" required />
            <label>Mô tả</label>  
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
            <label>Tổng tiền</label>  
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
            <label>Tên nhà cung cấp</label>  
            <input type="text" name="name" value={formData.name || ""} onChange={handleInputChange} placeholder="Tên nhà cung cấp" required />
            <label>Điện thoại</label>  
            <input type="text" name="phone" value={formData.phone || ""} onChange={handleInputChange} placeholder="Điện thoại" />
            <label>Email</label>  
            <input type="email" name="email" value={formData.email || ""} onChange={handleInputChange} placeholder="Email" />
            <label>Địa chỉ</label>  
            <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Địa chỉ" required />
            <label>Ghi chú</label>  
            <input type="text" name="note" value={formData.note || ""} onChange={handleInputChange} placeholder="Ghi chú"/>
            <label>Ngày hợp tác</label>
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required/>
          </>
        );
      case "inventory":
        return (
          <>
            {/* <input type="number" name="stt" value={formData.stt || ""} onChange={handleInputChange} placeholder="STT" required /> */}
            <label>Tên sản phẩm</label>
            <input type="text" name="productName" value={formData.productName || ""} onChange={handleInputChange} placeholder="Tên sản phẩm" required />
            <label>Tồn đầu</label>
            <input type="number" name="tonDau" value={formData.tonDau || ""} onChange={handleInputChange} placeholder="Tồn đầu" required />
            <label>Số lượng mua vào</label>
            <input type="number" name="soLuongMuaVao" value={formData.soLuongMuaVao || ""} onChange={handleInputChange} placeholder="Số lượng mua vào" required />
             <label>Số lượng bán ra</label>
            <input type="number" name="soLuongBanRa" value={formData.soLuongBanRa || ""} onChange={handleInputChange} placeholder="Số lượng bán ra" required />
             <label>Tồn cuối</label>
            <input type="number" name="tonCuoi" value={formData.tonCuoi || ""} onChange={handleInputChange} placeholder="Tồn cuối" required />
            <label>Đơn vị tính</label>
            <input type="text" name="donViTinh" value={formData.donViTinh || ""} onChange={handleInputChange} placeholder="Đơn vị tính" required />
            <label>Ngày cập nhật</label>
            <input type="datetime-local" name="lastUpdated" value={formData.lastUpdated || ""} onChange={handleInputChange} required/>
            <label>Mức cảnh báo</label>
            <input type="number" name="warning" value={formData.warning || ""} onChange={handleInputChange} placeholder="Mức cảnh báo" required />
          </>

        );
      case "reports":
        return (
          <>
          <label>Chọn loại doanh thu</label>  
            <select name="type" value={formData.type || ""} onChange={handleInputChange} required>
              <option value="">Chọn loại</option>
              <option value="Doanh thu">Doanh thu</option>
              <option value="Tồn kho">Tồn kho</option>
              <option value="Lợi nhuận">Lợi nhuận</option>
            </select>
          <label>Date</label>  
            <input type="date" name="date" value={formData.date || ""} onChange={handleInputChange} required />
          <label>Dữ liệu (JSON)</label>  
            <input type="text" name="data" value={formData.data || ""} onChange={handleInputChange} placeholder="Dữ liệu (JSON)" required />
          </>
        );
      case "parameter":
        return (
          <>
            {/* <input type="number" name="parameterId" value={formData.parameterId || ""} onChange={handleInputChange} placeholder="ID sản phẩm" required /> */}
            <label>Tên tham số</label>
            <input type="text" name="paraName" value={formData.TenThamSo || ""}  placeholder="Tên tham số" required disabled />
            <label>Giá trị</label>
            <input type="number" name="paraValue" value={formData.GiaTri || ""} onChange={handleInputChange} placeholder="Giá trị" required />
            <label>Mô tả</label>
            <input type="text" name="paraDescribe" value={formData.MoTa || ""}  placeholder="Mô tả" required />
            <label>Kích hoạt</label>
            <select
              name="paraKH"
              value={formData.KichHoat ? "Có" : "Không"}
              onChange={handleInputChange}
              required
            >
              <option value="Có">Có</option>
              <option value="Không">Không</option>
            </select>

          </>
        )
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
