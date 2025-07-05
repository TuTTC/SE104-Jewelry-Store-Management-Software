import React from "react";
import { Plus, Trash, X } from "lucide-react";
import "../App.css";

function OrderDetailsForm({
  showModal,
  closeModal,
  selectedOrderId,
  productList,
  setProductList,
  allProducts,
  handleSave,
  handlePrint,
}) {
  const handleProductChange = (index, field, value) => {
    const updatedList = [...productList];
    updatedList[index][field] = value;
    setProductList(updatedList);
  };

  const addProductRow = () => {
    const newList = [...productList, { MaSP: "", SoLuong: 0, GiaBan: 0 }];
    setProductList(newList);
  };

  const removeProductRow = (index) => {
    const updatedList = [...productList];
    updatedList.splice(index, 1);
    setProductList(updatedList);
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{selectedOrderId}</h2>
          <button onClick={closeModal} className="modal-close">
            <X className="icon" />
          </button>
        </div>

        <h3>Danh sách sản phẩm</h3>
        {productList.map((item, index) => (
          <div key={index} className="product-row">
            <br />
            <div>
              <strong>STT: {index + 1}</strong>
              <br />
            </div>

            <div>
              <label>Sản phẩm</label>
              <br />
              <select
                value={item.MaSP}
                onChange={(e) =>
                  handleProductChange(index, "MaSP", e.target.value)
                }
                required
              >
                <option value="">Chọn sản phẩm</option>
                {allProducts.map((sp) => (
                  <option key={sp.MaSP} value={sp.MaSP}>
                    {sp.TenSP}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Số lượng</label>
              <br />
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
              <label>Giá bán</label>
              <br />
              <input
                type="number"
                placeholder="Giá bán"
                value={item.GiaBan}
                min={0}
                onChange={(e) =>
                  handleProductChange(index, "GiaBan", e.target.value)
                }
                required
              />
            </div>

            <div>
              <strong>Thành tiền:</strong>{" "}
              {(
                (parseFloat(item.SoLuong) || 0) * (parseFloat(item.GiaBan) || 0)
              ).toLocaleString()}{" "}
              VND
            </div>

            <button type="button" onClick={() => removeProductRow(index)}>
              <Trash size={16} />
            </button>
          </div>
        ))}

        <p>
          <strong>Tổng tiền toàn bộ:</strong>{" "}
          {productList
            .reduce(
              (sum, item) =>
                sum +
                (parseFloat(item.SoLuong) || 0) * (parseFloat(item.GiaBan) || 0),
              0
            )
            .toLocaleString()}{" "}
          VND
        </p>

        <button type="button" onClick={addProductRow}>
          <Plus size={16} /> Thêm sản phẩm
        </button>

        <div className="modal-actions">
          <button type="button" className="action-button" onClick={handlePrint}>
            In chi tiết đơn hàng
          </button>
          <button type="button" className="action-button" onClick={handleSave}>
            Lưu
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="action-button cancel"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsForm;
