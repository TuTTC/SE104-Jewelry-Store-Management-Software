import React, { useState, useEffect } from "react";
import { Edit, Trash, Plus } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // Điều chỉnh path nếu cần
import * as orderApi from "../services/purchaseOrderApi";
import SearchModal from '../components/SearchModal';
import FilterModal from '../components/FilterModal';


function PurchaseOrderManager() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchFormData, setSearchFormData] = useState({});
  const [filterFormData, setFilterFormData] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  const openSearchModal = () => setShowSearchModal(true);
  const openFilterModal = () => setShowFilterModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  const closeFilterModal = () => setShowFilterModal(false);
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

    const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFormData({ ...searchFormData, [name]: value });
  };

  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({ ...filterFormData, [name]: value });
  };

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedData = [...purchaseOrders].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setPurchaseOrders(sortedData);
  };

  const exportToCSV = () => {
    const headers = ['ID,Mã phiếu nhập,Tên nhà cung cấp,Ngày nhập,Tổng tiền,Trạng thái'];
    const rows = purchaseOrders.map(item => {
      const supplier = initialSuppliers.find(s => s.id === item.supplierId);
      return [
        item.id,
        `"${item.orderCode}"`,
        `"${supplier ? supplier.name : 'Không xác định'}"`,
        `"${item.date}"`,
        item.total.toFixed(2),
        `"${item.status}"`
      ].join(',');
    });
    const csv = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchaseOrders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };


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
  const handleSearchSubmit = () => {
    // Placeholder cho API call
    closeSearchModal();
  };

  const handleFilterSubmit = () => {
    // Placeholder cho API call
    closeFilterModal();
  };

  const getSupplierName = (supplierId) => {
    const supplier = initialSuppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Không xác định';
  };

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
      <SearchModal
        showSearchModal={showSearchModal}
        closeSearchModal={closeSearchModal}
        currentSection="purchaseOrders"
        searchFormData={searchFormData}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
      />
      <FilterModal
        showFilterModal={showFilterModal}
        closeFilterModal={closeFilterModal}
        currentSection="purchaseOrders"
        filterFormData={filterFormData}
        handleFilterInputChange={handleFilterInputChange}
        handleFilterSubmit={handleFilterSubmit}
      />
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

//  return (
//     <div className="table-card">
//       <div className="table-header">
//         <h2 className="table-title">Quản lý phiếu nhập</h2>
//         <div>
//           <button onClick={openSearchModal} className="action-button"><Search className="icon" /> Tìm kiếm</button>
//           <button onClick={openFilterModal} className="action-button"><Filter className="icon" /> Lọc</button>
//           <button onClick={() => openModal('add')} className="action-button">Thêm phiếu nhập</button>
//           <button onClick={exportToCSV} className="action-button"><Download className="icon" /> Xuất CSV</button>
//         </div>
//       </div>
//       <div className="table-container">
//         <table className="data-table">
//           <thead>
//             <tr>
//               <th onClick={() => sortData('id')}>ID <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('orderCode')}>Mã phiếu nhập <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('supplierId')}>Nhà cung cấp <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('date')}>Ngày nhập <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('total')}>Tổng tiền <ArrowUpDown className="sort-icon" /></th>
//               <th onClick={() => sortData('status')}>Trạng thái <ArrowUpDown className="sort-icon" /></th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {purchaseOrders.map((po) => (
//               <tr key={po.id}>
//                 <td>{po.id}</td>
//                 <td>{po.orderCode}</td>
//                 <td>{getSupplierName(po.supplierId)}</td>
//                 <td>{po.date}</td>
//                 <td>${po.total.toFixed(2)}</td>
//                 <td>
//                   <span className={po.status === 'Đã xử lý' ? 'status-instock' : 'status-lowstock'}>
//                     {po.status}
//                   </span>
//                 </td>
//                 <td>
//                   <button onClick={() => openModal('edit', po)} className="action-icon edit">
//                     <Edit className="icon" />
//                   </button>
//                   <button onClick={() => handleDelete(po.id)} className="action-icon delete">
//                     <Trash className="icon" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>