import React, { useState, useEffect } from "react";
import { Edit, Trash, Plus } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // Điều chỉnh path nếu cần
import * as orderApi from "../services/purchaseOrderApi";

function PurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    supplier: "",
    user:"",
    date: "",
    total: "",
    status: "",
  });

  const modalType = modalMode;
  const showModal = modalVisible;

  // Fetch danh sách phiếu nhập từ backend
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      if (res.status === "success") {
        setPurchaseOrders(res.data);
      } else {
        alert("Lỗi khi tải dữ liệu!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  // Xử lý mở modal
  function openModal(mode, order = null) {
    setModalMode(mode);
    setSelectedOrder(order);
    setModalVisible(true);

    if (order) {
      setFormData({
        code: order.MaPN,
        supplier: order.MaNCC,
        user: order.UserID,
        date: order.NgayNhap?.slice(0, 10),
        total: order.TongTien,
        status: order.TrangThai,
      });
    } else {
      setFormData({
        code: "",
        supplier: "",
        user: "",
        date: "",
        total: "",
        status: "",
      });
    }
  }

  // Đóng modal
  function closeModal() {
    setModalVisible(false);
    setSelectedOrder(null);
  }

  // Sau khi form thêm/sửa thành công
  function handleSuccess() {
    closeModal();
    fetchPurchaseOrders();
  }

  // Xử lý input form
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = {
        
        MaNCC: formData.supplier,
        UserID: formData.user,
        NgayNhap: formData.date,
        TongTien: parseFloat(formData.total),
        TrangThai: formData.status,
      };

      if (modalMode === "add") {
        const res = await orderApi.addOrder(data);
        if (res.status === "success") {
          alert("Thêm phiếu nhập thành công!");
          handleSuccess();
        } else {
          alert("Thêm thất bại: " + res.message);
        }
      } else if (modalMode === "edit") {
        const res = await orderApi.updateOrder(data.MaPN, data);
        if (res.status === "success") {
          alert("Cập nhật phiếu nhập thành công!");
          handleSuccess();
        } else {
          alert("Cập nhật thất bại: " + res.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  }

  // Xoá phiếu nhập
  async function handleDelete(maPN) {
    const confirmDelete = window.confirm("Bạn có chắc muốn xoá phiếu nhập này?");
    if (confirmDelete) {
      try {
        const res = await orderApi.deleteOrder(maPN);
        if (res.status === "success") {
          alert("Xoá thành công!");
          fetchPurchaseOrders();
        } else {
          alert("Xoá thất bại: " + res.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Không kết nối được server!");
      }
    }
  }

  // Xuất PDF
  function exportPDF(maPN) {
    orderApi.exportOrderPDF(maPN);
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý nhập hàng</h2>
        <button onClick={() => openModal("add")} className="action-button">
          <Plus className="icon" /> Thêm phiếu nhập
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhà cung cấp</th>
              <th>Người lập</th>
              <th>Ngày nhập</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po.MaPN}>
                <td>{po.MaPN}</td>
                <td>{po.TenNCC || po.MaNCC}</td>
                <td>{po.UserID}</td>
                <td>{po.NgayNhap}</td>
                <td>{formatCurrency(po.TongTien)}</td>
                <td>{po.TrangThai}</td>
                <td>
                  <button onClick={() => openModal("edit", po)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(po.MaPN)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                  <button onClick={() => exportPDF(po.MaPN)} className="action-icon export">
                    Xuất PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <GeneralModalForm
          showModal={showModal}
          closeModal={closeModal}
          modalType={modalType}
          currentSection="purchaseOrders"
          formData={formData}
          initialData={selectedOrder}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// Hàm format tiền
function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export default PurchaseOrderManager;
