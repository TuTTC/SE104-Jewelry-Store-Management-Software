import React, { useState, useEffect } from "react";
import { Edit, Trash, ArrowUpDown, Filter, Eye } from "lucide-react";
import userApi from "../services/userApi";
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
  inChiTietDonHang,
} from "../services/donhangApi";
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
  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    status: 'Pending',
    paymentMethod: '',
    deliveryAddress: ''
  });
    const [error, setError] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 10;
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]); // Danh sách khách hàng
  const [role, setRole] = useState("");

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
        console.log("Mapped orders:", data);
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
    const init = async () => {
      try {
        // Lấy người dùng hiện tại
        const currentUser = await userApi.getCurrentUser();
        const userRole = currentUser?.VaiTro || "";
        setRole(userRole); //Cập nhật state

        // Luôn gọi đơn hàng
        await fetchOrders();

        if (["Admin", "Nhân viên"].includes(userRole)) {
          await loadProducts();
          await loadCustomers();
        } else if (userRole === "Khách hàng") {
          await loadProducts();
          setCustomers([currentUser]); // Chỉ thêm chính khách hàng vào danh sách
        }
      } catch (err) {
        console.error("Lỗi khi khởi tạo dữ liệu:", err);
      }
    };

    init();
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
    
  const loadCustomers = async () => {
    try {
      const res = await userApi.getAllUsers(); // trả về mảng [{ UserID, HoTen, VaiTro, TrangThai, ... }, …]
      // Chỉ lấy khách hàng đang hoạt động
      const customers = res.filter(
        u => u.VaiTro === "Khách hàng" && u.TrangThai === "Kích hoạt"
      );
      setUsers(customers);
    } catch (err) {
      console.error("Lỗi load khách hàng:", err);
    }
  };
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    if (value === "") {
      setData(orders); // hiện tất cả
    } else {
      const filteredData = orders.filter((item) => item.status === value);
      setData(filteredData);
    }
  };

const openOrderModal = (mode, order = null) => {
  setModalType(mode);
  setSelectedOrder(order);
  setViewModal(true); // mở modal chi tiết
};

const openModal = async (mode, data = {}) => {
  setModalType(mode);           // "add", "edit", hoặc "view"
  let details = data.ChiTiet;

  // Nếu là edit hoặc view mà chưa có chi tiết, thì gọi API
  if ((mode === "edit" || mode === "view") && !details) {
    const json = await getChiTietDonHang(data.id);
    if (json.status === "success") details = json.data;
    else return alert("Không lấy được chi tiết đơn hàng!");
  }

  // Khởi tạo formData (dùng chung cho cả add, edit, view)
  setFormData({
    id: data.id || null,
    customerId: data.customerId ?? data.MaKH ?? "",
    customerName: data.customer ?? data.HoTen ?? "", // tên khách hàng
    date: (data.date ?? data.NgayDat ?? "").slice(0, 10),
    status: data.status ?? data.TrangThai ?? "Pending",
    paymentMethod: data.paymentMethod ?? data.PhuongThucThanhToan ?? "",
    deliveryAddress: data.deliveryAddress ?? data.DiaChiGiao ?? ""
  });

  // Thiết lập chi tiết đơn hàng
  setSelectedOrderDetails(details || []);
  setSelectedOrderId(data.id || null);

  // Hiển thị modal
  setShowModal(true);
};


const closeModal = () => {
  setShowModal(false);
  setFormData({
    customerId: '', date: '', status: 'Pending',
    paymentMethod: '', deliveryAddress: ''
  });
  setSelectedOrderDetails([]);
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
      const tongTien = selectedOrderDetails.reduce(
      (sum, item) => sum + item.SoLuong * item.GiaBan,
      0
    );

    const payload = {
      ...formData,
      TongTien: tongTien,
      ChiTiet: selectedOrderDetails.map((ct) => ({
        MaSP: ct.MaSP,
        SoLuong: parseInt(ct.SoLuong),
        GiaBan: parseFloat(ct.GiaBan),
        ThanhTien: parseInt(ct.SoLuong) * parseFloat(ct.GiaBan),
      })),
    };

    console.log("Payload gửi đi:", payload);

    try {
      const res = await suaDonHang(payload); // hoặc suaDonHang(payload)
      if (res.status === "success") {
        alert("Lưu đơn hàng thành công");
        fetchOrders();
        setShowModal(false);
      } else {
        alert("Lỗi khi lưu đơn hàng");
      }
    } catch (err) {
      alert("Lỗi khi gửi request: " + err.message);
    }
  };

const handleFormSubmit = async (formData, chiTietList) => {
  // Tính tổng
  const tongTien = chiTietList.reduce(
    (s, ct) => s + ct.SoLuong * ct.GiaBan, 0
  );

  // Chuẩn bị payload
  const payload = {
    UserID: parseInt(formData.customerId, 10),
    NgayDat: formData.date,
    TongTien: tongTien,
    TrangThai: formData.status,
    PhuongThucThanhToan: formData.paymentMethod,
    DiaChiGiao: formData.deliveryAddress,
    ChiTiet: chiTietList.map(ct => ({
      MaSP: parseInt(ct.MaSP,10),
      SoLuong: parseInt(ct.SoLuong,10),
      GiaBan: parseFloat(ct.GiaBan),
      ThanhTien: ct.SoLuong*ct.GiaBan
    }))
  };

  try {
    let res;
    if (modalType === "edit") {
      // **Chú ý**: suaDonHang nhận (id, payload)
      res = await suaDonHang(formData.id, payload);
    } else {
      // taoDonHang nhận payload
      res = await taoDonHang(payload);
    }
    if (res.status === "success") {
      alert(modalType==="edit"?"Cập nhật thành công":"Tạo đơn thành công");
      fetchOrders();
      closeModal();
    } else {
      alert("Lỗi: "+res.message);
    }
  } catch(err) {
    alert("Lỗi kết nối: "+err.message);
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
        {/* {role !== "Khách hàng" && (
          <button onClick={() => openModal("add")} className="action-button">
            Thêm đơn hàng
          </button>
        )} */}

      </div>

      <div className="tabs">
        {[
          { key: "list", label: "Danh sách đơn" },
          { key: "pending", label: "Cập nhật thông tin đơn" },
          { key: "payment", label: "Xác nhận thanh toán" },
          { key: "shipping", label: "Đóng gói & giao hàng" },
          { key: "return", label: "Trả/Đổi hàng" },
          { key: "status", label: "Cập nhật trạng thái" },
        ]
          .filter(tab => !(role === "Khách hàng" && tab.key === "status")) // ⛔ Ẩn tab "status" nếu là khách
          .map((tab) => (
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
                  {role === "Khách hàng" ? (
                    <button
                      onClick={() => openModal("view", o)} // mở modal xem chi tiết
                      className="action-icon edit"
                    >
                      <Eye className="icon" />
                    </button>
                  ) : (
                    <>
                      <button onClick={() => openModal("edit", o)} className="action-icon edit">
                        <Edit className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete("orders", o.id)}
                        className="action-icon delete"
                      >
                        <Trash className="icon" />
                      </button>
                    </>
                  )}
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
                {role === "Khách hàng" ? (
                  <button
                    onClick={() => openModal("view", o)} // mở modal xem chi tiết
                    className="action-icon edit"
                  >
                    <Eye className="icon" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => openModal("edit", o)} className="action-icon edit">
                      <Edit className="icon" />
                    </button>
                    
                  </>
                )}
              </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedTab === "payment" && (
          <div>
          {role !== "Khách hàng" && (
        <button onClick={() => openModal("add")} className="action-button">
          Thêm đơn hàng
        </button>
      )}
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
          </div>
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
            <th onClick={() => sortData("id")}>
              ID <ArrowUpDown className="sort-icon" />
            </th>
            <th onClick={() => sortData("orderCode")}>
              Mã đơn <ArrowUpDown className="sort-icon" />
            </th>
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
                <select onChange={(e) => handleOrderStatusChange(o.id, e.target.value)} value={o.status}>
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

      <OrderDetailModal
        showModal={showModal}
        onClose={closeModal}
        formData={formData}
        handleInputChange={handleInputChange}
        selectedOrderDetails={selectedOrderDetails}
        products={products}
        updateOrderDetail={updateOrderDetail}
        removeOrderDetail={removeOrderDetail}
        addOrderDetail={addOrderDetail}
        saveOrderDetails={() => handleFormSubmit(formData, selectedOrderDetails)}
        selectedOrderId={selectedOrderId}
        inChiTietDonHang={inChiTietDonHang}
        users={users}
        role={role}
        modalType={modalType}
      />
    </div>
  );
};

export default OrdersManager;