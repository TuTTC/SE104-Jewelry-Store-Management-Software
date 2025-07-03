import React, { useState, useEffect } from "react";
import { Edit, Trash,ArrowUpDown  } from "lucide-react";
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
    note: ""
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]); // Mảng dữ liệu hiển thị
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    supplierApi.getAllSuppliers()
      .then((data) => {
        setSuppliers(data);
        setData(data);
      })
      .catch((error) => {
        if (error.status === 403) {
          alert("Bạn không có quyền xem!");
        } else if (error.status === 401) {
          alert("Vui lòng đăng nhập!");
        } else {
          console.error("Lỗi khi lấy dữ liệu:", error);
        }
      });
  };

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
        note: supplier.GhiChu || ""
      });
    } else {
      setSelectedSupplier(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
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
      GhiChu: formData.note
    };

    if (modalMode === "add") {
      supplierApi.addSupplier(payload)
        .then(() => {
          fetchSuppliers();
          closeModal();
        })
        .catch(err => setError(err.message));
    } else if (modalMode === "edit" && selectedSupplier) {
      supplierApi.updateSupplier(selectedSupplier.MaNCC, payload)
        .then(() => {
          fetchSuppliers();
          closeModal();
        })
        .catch(err => setError(err.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
      supplierApi.deleteSupplier(id)
        .then(() => fetchSuppliers())
        .catch(err => alert(err.message));
    }
  };

const sortData = (key) => {
  let direction = 'asc';

  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Xử lý null hoặc undefined
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Xử lý kiểu ngày dạng string
    const dateRegex = /^\d{4}-\d{2}-\d{2}/; 
    if (typeof aValue === 'string' && dateRegex.test(aValue)) {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return direction === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Xử lý chuỗi
    if (typeof aValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Xử lý số
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
            {data.map((s) => (
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
        <Pagination />
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

