import React, { useState, useEffect } from "react";
import { Edit, Trash, X, ArrowUpDown, Filter } from "lucide-react";
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
import OrderDetailModal from "../components/OrderDetailModal"; // Import new modal
import Pagination from '../components/Pagination';
import * as productApi from "../services/productApi";

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTab, setSelectedTab] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      const res = await danhSachDonHang();
      if (res.status === "success") {
     const data = res.data.map(o => ({
  ...o,
  id: o.id,
  customerId: o.customerId,
  orderCode: o.orderCode,
  customer: o.customer,
  date: o.date,
  total: o.total,
  status: o.status,
  paymentMethod: o.paymentMethod,
  deliveryAddress: o.deliveryAddress
}));


        console.log("▶️ Mapped orders:", data);
        setOrders(data);
        setData(data);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      alert("Lỗi khi lấy dữ liệu đơn hàng: " + err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    loadProducts();
  }, []);

  useEffect(() => {
    let filteredData = orders;
    if (selectedStatus) {
      filteredData = orders.filter((o) => o.status === selectedStatus);
    }
    setData(filteredData);
  }, [orders, selectedStatus]);

 // Phân trang 
// Định nghĩa bộ lọc cho từng tab (nếu có)
const tabFilters = {
  list: null, // Không lọc
  active: (item) => item.status === "Active", // Ví dụ: Lọc tài khoản đang hoạt động
  inactive: (item) => item.status === "Inactive", // Ví dụ: Lọc tài khoản không hoạt động
  // Thêm các tab khác nếu cần
};

// Lấy bộ lọc cho tab hiện tại
const filterFn = tabFilters[selectedTab] || null;
const filteredData = filterFn ? data.filter(filterFn) : data;

// Tính toán phân trang
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);


  const loadProducts = async () => {
    try {
      const res = await productApi.getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi load sản phẩm:", err);
    }
  };

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === null && b[key] === null) return 0;

      if (key === "date") {
        const dateA = new Date(a[key]).getTime();
        const dateB = new Date(b[key]).getTime();
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else if (key === "total") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      } else if (typeof a[key] === "string") {
        const valueA = a[key].toLowerCase();
        const valueB = b[key].toLowerCase();
        return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });

    setData(sortedData);
  };

  const handleStatusChange = async (id, value) => {
    try {
      // Gọi API cập nhật trạng thái đơn hàng
      const response = await fetch(`http://localhost:5000/api/donhang/${id}/trangthai`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TrangThai: value }),
      });

      const result = await response.json();

      if (result.status === "success") {
        // Cập nhật lại UI
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status: value } : order
          )
        );
        setData((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status: value } : order
          )
        );
      } else {
        alert("Cập nhật trạng thái thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

const openModal = (section, type, data = {}) => {
  if (section !== "orders") return;
  setModalType(type);

  const transformedData = type === "edit" ? {
    id: data.id || data.MaDH,
    customerId: data.UserID || '',
    date: data.NgayDat?.slice(0, 16) || '',
    total: data.TongTien || '',
    status: data.TrangThai || 'Pending',
    paymentMethod: data.PhuongThucThanhToan || '',
    deliveryAddress: data.DiaChiGiao || ''
  } : {
    customerId: '',
    date: '',
    total: 0,
    status: 'Pending',
    paymentMethod: '',
    deliveryAddress: ''
  };

  setFormData(transformedData);
  setSelectedOrder(data);
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

  const updateOrderDetail = (index, field, value) => {
    setSelectedOrderDetails(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === "SoLuong" || field === "GiaBan") {
        const qty = parseInt(item.SoLuong, 10) || 0;
        const price = parseFloat(item.GiaBan) || 0;
        item.ThanhTien = qty * price;
      }
      next[index] = item;
      return next;
    });
  };

  const removeOrderDetail = (index) => {
    setSelectedOrderDetails((prev) => prev.filter((_, i) => i !== index));
  };

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
      UserID: parseInt(formData.customerId, 10),
      NgayDat: formData.date,
      TongTien: parseFloat(formData.total) || 0,
      TrangThai: formData.status || "Pending",
      PhuongThucThanhToan: formData.paymentMethod,
      DiaChiGiao: formData.deliveryAddress,
      ChiTiet: (chiTietList || []).map(ct => ({
        MaSP: parseInt(ct.MaSP, 10),
        SoLuong: parseInt(ct.SoLuong, 10),
        GiaBan: parseFloat(ct.GiaBan),
        ThanhTien: parseFloat(ct.SoLuong * ct.GiaBan)
      }))
    };

    if (modalType === "edit" && selectedOrder?.MaDH) {
      payload.id = selectedOrder.MaDH;
    }

    console.log("Payload:", payload);

    try {
      const res = modalType === "add"
        ? await taoDonHang(payload)
        : await suaDonHang(formData.id, payload);

      if (res.status === "success") {
        alert(modalType === "edit" ? "Cập nhật đơn hàng thành công." : "Đơn hàng đã được tạo.");
        fetchOrders();
        closeModal();
      } else {
        alert("Lỗi: " + res.message);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const handleDelete = async (section, id) => {
    if (section !== "orders") return;
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        const res = await xoaDonHang(id);
        if (res.status === "success") {
          setOrders((prev) => prev.filter((o) => o.id !== id));
          setData((prev) => prev.filter((o) => o.id !== id));
        } else {
          alert("Xóa đơn hàng thất bại");
        }
      } catch (err) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  const handleOrderStatusChange = async (id, newStatus) => {
    try {
      const res = await capNhatTrangThaiDonHang(id, newStatus);
      if (res.status === "success") {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
        setData((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
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
    } catch (err) {
      alert("Lỗi khi kết nối API: " + err.message);
    }
  };
const handlePrint = async () => {
  try {
    const blob = await inChiTietDonHang(selectedOrderId);
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  } catch (error) {
    alert("Lỗi khi tạo PDF: " + error.message);
  }
};



  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        <button onClick={() => openModal("orders", "add")} className="action-button">
          Thêm đơn hàng
        </button>
      </div>

      <div className="tabs">
        {[
          { key: "list", label: "Danh sách đơn" },
          { key: "pending", label: "Cập nhật thông tin đơn" },
          { key: "payment", label: "Xác nhận thanh toán" },
          { key: "shipping", label: "Đóng gói & giao hàng" },
          { key: "return", label: "Trả/Đổi hàng" },
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
        <OrderDetailModal
          showModal={viewModal}
          onClose={() => setViewModal(false)}
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
          products={products}
          updateOrderDetail={updateOrderDetail}
          removeOrderDetail={removeOrderDetail}
          addOrderDetail={addOrderDetail}
          saveOrderDetails={saveOrderDetails}
          selectedOrderId={selectedOrderId}
          inChiTietDonHang={handlePrint}
        />

        {selectedTab === "list" && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("customer")}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("date")}>Ngày <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("total")}>Tổng <ArrowUpDown className="sort-icon" /></th>
                <th className="relative">
                  Trạng thái
                  <Filter className="sort-icon" onClick={() => setShowStatusFilter(!showStatusFilter)} style={{ cursor: "pointer" }} />
                  {showStatusFilter && (
                    <div className="filter-popup">
                      <select value={selectedStatus} onChange={handleStatusChange}>
                        <option value="">Tất cả</option>
                        {Array.from(new Set(orders.map(o => o.status))).map((status, index) => (
                          <option key={index} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((o, index) => (
                <tr key={o.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>{new Date(o.date).toLocaleString('vi-VN')}</td>
                  <td>{o.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td>{o.status}</td>
                  <td>
                    <button onClick={() => handleViewDetails(o.id)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                    <button
                      onClick={() => handleDelete("orders", o.id)}
                      className="action-icon delete"
                    >
                      <Trash className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedTab === "pending" && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("customer")}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("date")}>Ngày <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("total")}>Tổng <ArrowUpDown className="sort-icon" /></th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.filter((o) => o.status === "Pending").map((o, index) => (
                <tr key={o.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>{new Date(o.date).toLocaleString('vi-VN')}</td>
                  <td>{o.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
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
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("customer")}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("total")}>Tổng <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("paymentMethod")}>Phương thức <ArrowUpDown className="sort-icon" /></th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((o, index) => (
                <tr key={o.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{o.orderCode}</td>
                  <td>{o.customer}</td>
                  <td>{o.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    {o.status !== "Paid" ? (
                      <button
                        className="action-button"
                        onClick={async () => {
                          try {
                            const res = await xacNhanThanhToan(o.id);
                            if (res.status === "success") {
                              setOrders((prev) =>
                                prev.map((ord) =>
                                  ord.id === o.id ? { ...ord, status: "Paid" } : ord
                                )
                              );
                              setData((prev) =>
                                prev.map((ord) =>
                                  ord.id === o.id ? { ...ord, status: "Paid" } : ord
                                )
                              );
                            } else {
                              alert("Xác nhận thanh toán thất bại");
                            }
                          } catch (err) {
                            alert("Lỗi khi xác nhận thanh toán: " + err.message);
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

        {selectedTab === "shipping" && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("deliveryAddress")}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.filter((o) => o.status === "Paid")
                .map((o, index) => (
                  <tr key={o.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{o.orderCode}</td>
                    <td>{o.deliveryAddress}</td>
                    <td>{o.status}</td>
                    <td>
                      <button
                        className="action-button"
                        onClick={async () => {
                          try {
                            const res = await dongGoiGiaoHang(o.id);
                            if (res.status === "success") {
                              setOrders((prev) =>
                                prev.map((ord) =>
                                  ord.id === o.id ? { ...ord, status: "Shipped" } : ord
                                )
                              );
                              setData((prev) =>
                                prev.map((ord) =>
                                  ord.id === o.id ? { ...ord, status: "Shipped" } : ord
                                )
                              );
                            } else {
                              alert("Giao hàng thất bại");
                            }
                          } catch (err) {
                            alert("Lỗi khi đóng gói: " + err.message);
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

        {selectedTab === "status" && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((o, index) => (
                <tr key={o.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
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

        {selectedTab === "return" && (
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => sortData("id")}>ID <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("orderCode")}>Mã đơn <ArrowUpDown className="sort-icon" /></th>
                <th onClick={() => sortData("customer")}>Khách hàng <ArrowUpDown className="sort-icon" /></th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems
                .filter((o) => o.status === "Shipped")
                .map((o, index) => (
                  <tr key={o.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{o.orderCode}</td>
                    <td>{o.customer}</td>
                    <td>
                      {o.status !== "ReturnRequested" ? (
                        <button
                          className="action-button"
                          onClick={async () => {
                            try {
                              const res = await xuLyTraDoi(o.id);
                              if (res.status === "success") {
                                setOrders((prev) =>
                                  prev.map((ord) =>
                                    ord.id === o.id
                                      ? { ...ord, status: "ReturnRequested" }
                                      : ord
                                  )
                                );
                                setData((prev) =>
                                  prev.map((ord) =>
                                    ord.id === o.id
                                      ? { ...ord, status: "ReturnRequested" }
                                      : ord
                                  )
                                );
                              } else {
                                alert("Trả/đổi thất bại");
                              }
                            } catch (err) {
                              alert("Lỗi khi xử lý trả/đổi: " + err.message);
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

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

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