import React, { useState, useEffect } from "react";
import { Edit, Trash, Eye } from "lucide-react";
import {
  danhSachDonHang,
  capNhatTrangThaiDonHang,
  xacNhanThanhToan,
  dongGoiGiaoHang,
  xuLyTraDoi,
  xoaDonHang,
  taoDonHang,
  suaDonHang,
  getChiTietDonHang, 
  capNhatChiTietDonHang,
  inChiTietDonHang
} from "../services/donhangApi";
import GeneralModalForm from "../components/GeneralModalForm-2";
import Pagination from '../components/Pagination';
const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [listFilter, setListFilter] = useState(""); // "" = tất cả
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // đơn đang thao tác
  const [chiTietList, setChiTietList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fetchOrders = async () => {
    const res = await danhSachDonHang();
    if (res.status === "success") {
      // đảm bảo mỗi object có customerId
      const data = res.data.map(o => ({
        ...o,
        customerId: o.customerId ?? o.MaKH  // nếu API chỉ trả MaKH
      }));
      console.log("▶️ Mapped orders:", data);
      setOrders(data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const openModal = (section, type, data = {}) => {
    if (section !== "orders") return;
    setModalType(type);

    const transformedData = type === "edit"
      ? {
          id: data.id || data.MaDH,       // lấy id từ dữ liệu đơn hàng
          customerId: data.MaKH || '',
          date: data.NgayDat?.slice(0, 10) || '',
          total: data.TongTien || '',
          status: data.TrangThai || 'Pending',
          paymentMethod: data.PhuongThucThanhToan || '',
          deliveryAddress: data.DiaChiGiao || ''
        }
      : {};

    setFormData(transformedData);   // dùng để hiển thị lên form
    setSelectedOrder(data);         // lưu dữ liệu gốc (nếu cần)
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  
  // Cập nhật trường trong từng dòng chi tiết đơn hàng
const updateOrderDetail = (index, field, value) => {
  setSelectedOrderDetails(prev => {
    const next = [...prev];
    const item = { ...next[index], [field]: value };
    // cập nhật ThànhTiền nếu thay SoLuong hoặc GiaBan
    if (field === "SoLuong" || field === "GiaBan") {
      const qty = parseInt(item.SoLuong, 10) || 0;
      const price = parseFloat(item.GiaBan) || 0;
      item.ThanhTien = qty * price;
    }
    next[index] = item;
    return next;
  });
};


  // Xoá 1 dòng chi tiết
  const removeOrderDetail = (index) => {
    setSelectedOrderDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Thêm dòng mới
  const addOrderDetail = () => {
    setSelectedOrderDetails((prev) => [
      ...prev,
      { MaSP: "", SoLuong: 1, GiaBan: 0, ThanhTien: 0 }
    ]);
  };
  const saveOrderDetails = async () => {
    try {
      const json = await capNhatChiTietDonHang(selectedOrderId, selectedOrderDetails);
      if (json.status === "success") {
        alert("Đã lưu chi tiết đơn hàng.");
        setViewModal(false);
        fetchOrders();
      } else {
        alert("Lỗi khi lưu: " + json.message);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };


  const handleFormSubmit = async (formData, chiTietList) => {
    const payload = {
      MaKH: parseInt(formData.customerId, 10),
      NgayDat: formData.date,
      TongTien: 0,
      TrangThai: formData.status,
      ChiTiet: (chiTietList || []).map(ct => ({
        MaSP: ct.MaSP,
        SoLuong: parseInt(ct.SoLuong, 10),
        GiaBan: parseFloat(ct.GiaBan),
        ThanhTien: parseFloat(ct.SoLuong * ct.GiaBan)
      }))
    };

    // Nếu là cập nhật, thêm ID vào
    if (modalType === "edit" && selectedOrder?.MaDH) {
      payload.id = selectedOrder.MaDH;
    }

    console.log("Payload:", payload);

    let res;
    if (modalType === "add") {
      res = await taoDonHang(payload);
    } else if (modalType === "edit") {
      console.log("ID đơn hàng cần cập nhật:", formData.id);
      res = await suaDonHang(formData.id, payload);
    }

    if (res.status === "success") {
      alert(modalType === "edit" ? "Cập nhật đơn hàng thành công." : "Đơn hàng đã được tạo.");
      fetchOrders();
      closeModal();
    } else {
      alert("Lỗi: " + res.message);
    }
  };


    const handleDelete = async (section, id) => {
    if (section !== "orders") return;
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
        const res = await xoaDonHang(id);
        if (res.status === "success") {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        } else {
        alert("Xóa đơn hàng thất bại");
        }
    }
    };
    const handleStatusChange = async (id, newStatus) => {
    const res = await capNhatTrangThaiDonHang(id, newStatus);
    if (res.status === "success") {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } else {
        alert("Cập nhật trạng thái thất bại");
    }
    };
    const handleViewDetails = async (orderId) => {
      try {
        const json = await getChiTietDonHang(orderId);
        if (json.status === "success") {
          setSelectedOrderId(orderId);
          setSelectedOrderDetails(json.data);
          setViewModal(true);
        } else {
          alert("Không thể lấy chi tiết đơn hàng.");
        }
      } catch {
        alert("Lỗi khi kết nối API.");
      }
    };


  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý đơn hàng</h2>
        <button onClick={() => openModal("orders", "add")} className="action-button">
          Thêm đơn hàng
        </button>
      </div>

      <div className="tabs">
        {[
          { key: "pending", label: "Cập nhật thông tin đơn" },
          { key: "payment", label: "Xác nhận thanh toán" },
          { key: "shipping", label: "Đóng gói & giao hàng" },
          { key: "return", label: "Trả/Đổi hàng" },
          { key: "list", label: "Danh sách đơn" },
          { key: "status", label: "Cập nhật trạng thái" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={selectedTab === tab.key ? "tab active" : "tab"}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">

      {viewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Chi tiết đơn hàng #{selectedOrderId}</h2>
            <table>
              <thead>
                <tr>
                  <th>Mã SP</th>
                  <th>Số lượng</th>
                  <th>Giá bán</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderDetails.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="number"
                        value={row.MaSP}
                        onChange={(e) =>
                          updateOrderDetail(index, "MaSP", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.SoLuong}
                        onChange={(e) =>
                          updateOrderDetail(index, "SoLuong", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.GiaBan}
                        onChange={(e) =>
                          updateOrderDetail(index, "GiaBan", e.target.value)
                        }
                      />
                    </td>
                    <td>{(row.SoLuong * row.GiaBan).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeOrderDetail(index)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={addOrderDetail}>Thêm sản phẩm</button>

            <div className="modal-actions">
              <button
                className="action-button"
                onClick={async () => {
                  try {
                    const blob = await inChiTietDonHang(selectedOrderId);
                    const url = window.URL.createObjectURL(blob);
                    window.open(url);  // hoặc dùng window.location.href = url để tải về
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
              <button
                className="action-button cancel"
                onClick={() => setViewModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}


        {/* PENDING TAB */}

        {selectedTab === "pending" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.filter((o) => o.status === "Pending").map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>{o.date}</td>
                  <td>{o.total}</td>
                  <td>{o.status}</td>
                  <td>
                    <button onClick={() => openModal("orders", "edit", o)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedTab === "payment" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng</th>
                <th>Phương thức</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>{o.total}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    {o.status !== "Paid" ? (
                      <button
                        className="action-button"
                        onClick={async () => {
                          const res = await xacNhanThanhToan(o.id);
                          if (res.status === "success") {
                            setOrders((prev) =>
                              prev.map((ord) =>
                                ord.id === o.id ? { ...ord, status: "Paid" } : ord
                              )
                            );
                          } else {
                            alert("Xác nhận thanh toán thất bại");
                          }
                        }}
                      >
                        Xác nhận
                      </button>
                    ) : (
                      <span className="status-instock">Đã xác nhận</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* SHIPPING TAB */}

        {selectedTab === "shipping" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((o) => o.status === "Paid")
                .map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.orderCode}</td>
                    <td>{o.deliveryAddress}</td>
                    <td>{o.status}</td>
                    <td>
                      <button
                        className="action-button"
                        onClick={async () => {
                          const res = await dongGoiGiaoHang(o.id);
                          if (res.status === "success") {
                            setOrders((prev) =>
                              prev.map((ord) =>
                                ord.id === o.id ? { ...ord, status: "Shipped" } : ord
                              )
                            );
                          } else {
                            alert("Giao hàng thất bại");
                          }
                        }}
                      >
                        Đóng gói
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* STATUS TAB */}

        {selectedTab === "status" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.status}</td>
                  <td>
                    <select onChange={(e) => handleStatusChange(o.id, e.target.value)} value={o.status}>
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Shipped">Đã giao</option>
                      <option value="Completed">Hoàn thành</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* RETURN TAB */}
        {selectedTab === "return" && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders
              .filter((o) => o.status === "Shipped")
              .map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>
                    {o.status !== "ReturnRequested" ? (
                      <button
                        className="action-button"
                        onClick={async () => {
                          const res = await xuLyTraDoi(o.id);
                          if (res.status === "success") {
                            setOrders((prev) =>
                              prev.map((ord) =>
                                ord.id === o.id
                                  ? { ...ord, status: "ReturnRequested" }
                                  : ord
                              )
                            );
                          } else {
                            alert("Trả/đổi thất bại");
                          }
                        }}
                      >
                        Yêu cầu trả/đổi
                      </button>
                    ) : (
                      <span className="status-instock">Đã yêu cầu</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}


      {/* LIST TAB */}
      {selectedTab === "list" && (
        <>
          <div style={{ margin: "0 24px 16px" }}>
            <label>
              Lọc trạng thái:&nbsp;
              <select
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="ReturnRequested">ReturnRequested</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter((o) => !listFilter || o.status === listFilter)
                .map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.orderCode}</td>
                    <td>{o.customer}</td>
                    <td>{o.date}</td>
                    <td>{o.total}</td>
                    <td>{o.status}</td>
                    <td>
                      <button
                        onClick={() => handleDelete("orders", o.id)}
                        className="action-icon delete"
                      >
                        <Trash className="icon" />
                      </button>
                      <button onClick={() => handleViewDetails(o.id)} className="action-icon view">
                        <Edit className="icon" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
      <Pagination />
      </div>

      {/* Modal Form */}
      <GeneralModalForm
        section="orders"
        mode={modalType}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        showModal={showModal}    
        handleInputChange={handleInputChange}
        error={error}
        initialData={selectedOrder}                    
      />
    </div>
  );
};

export default OrdersManager;
