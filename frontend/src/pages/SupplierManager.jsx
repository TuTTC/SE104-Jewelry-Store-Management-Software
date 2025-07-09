import React, { useState, useEffect } from "react";
import { Edit, Trash, ArrowUpDown } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import * as supplierApi from "../services/supplierApi";
import Pagination from '../components/Pagination';

const SupplierManager = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date: "",
    note: ""
    
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("list"); // Thêm state cho tab
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    supplierApi.getAllSuppliers()
      .then((response) => {
        const fetchedData = Array.isArray(response) ? response : [];
        setSuppliers(fetchedData);
        setData(fetchedData);
      })
      .catch((error) => {
        if (error.status === 403) {
          alert("Bạn không có quyền xem!");
        } else if (error.status === 401) {
          alert("Vui lòng đăng nhập!");
        } else {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
        setSuppliers([]);
        setData([]);
      });
  };

  // Logic phân trang
  const tabFilters = {
    list: null, // Không lọc
    active: (item) => item.status === "Active",
    inactive: (item) => item.status === "Inactive",
  };

  const filterFn = tabFilters[selectedTab] || null;
  const filteredData = (data || []).filter(filterFn ? filterFn : () => true);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Đảm bảo currentPage hợp lệ
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Đặt lại trang khi tab thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  const openModal = (mode, supplier = null) => {
    setModalMode(mode);
    setModalVisible(true);

    if (mode === "edit" && supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.TenNCC || "",
        phone: supplier.SoDienThoai || "",
        email: supplier.Email || "",
        address: supplier.DiaChi || "",
        date: supplier.NgayHopTac || "",
        note: supplier.GhiChu || ""
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        date: "",
        note: ""
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSupplier(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      date: "",
      note: ""
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  const payload = {
    TenNCC: formData.name,
    SoDienThoai: formData.phone,
    Email: formData.email,
    DiaChi: formData.address,
    NgayHopTac: formData.date,
    GhiChu: formData.note,
  };

  if (modalMode === "add") {
    supplierApi.addSupplier(payload)
      .then((res) => {
        alert("Thêm nhà cung cấp thành công!");
        fetchSuppliers();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        alert("Thêm nhà cung cấp thất bại: " + err.message);
        setError(err.message);
      });
  } else if (modalMode === "edit" && selectedSupplier) {
    supplierApi.updateSupplier(selectedSupplier.MaNCC, payload)
      .then((res) => {
        alert("Cập nhật nhà cung cấp thành công!");
        fetchSuppliers();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        alert("Cập nhật thất bại: " + err.message);
        setError(err.message);
      });
  }
};


const handleDelete = (id) => {
  if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
    supplierApi.deleteSupplier(id)
      .then(() => {
        alert("Xóa nhà cung cấp thành công.");
        fetchSuppliers();
      })
      .catch(err => {
        alert(err.message || "Đã xảy ra lỗi.");
      });
  }
};


  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...(data || [])].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (typeof aValue === 'string' && dateRegex.test(aValue)) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (typeof aValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number') {
        return direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title"></h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData('MaNCC')}>ID <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('TenNCC')}>Tên <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('SoDienThoai')}>Điện thoại <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('Email')}>Email <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('DiaChi')}>Địa chỉ <ArrowUpDown className="sort-icon" /></th>
              <th onClick={() => sortData('NgayHopTac')}>Ngày hợp tác <ArrowUpDown className="sort-icon" /></th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((s) => (
              <tr key={s.MaNCC}>
                <td>{s.MaNCC}</td>
                <td>{s.TenNCC}</td>
                <td>{s.SoDienThoai}</td>
                <td>{s.Email}</td>
                <td>{s.DiaChi}</td>
                <td>{s.NgayHopTac || "Chưa cập nhật"}</td>
                <td>{s.GhiChu}</td>
                <td>
                  <button onClick={() => openModal("edit", s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.MaNCC)} className="action-icon delete">
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {modalVisible && (
        <GeneralModalForm
          showModal={modalVisible}
          closeModal={closeModal}
          currentSection="suppliers"
          modalType={modalMode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          error={null}
        />
      )}
    </div>
  );
};

export default SupplierManager;
