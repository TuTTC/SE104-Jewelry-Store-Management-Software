import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm";
import * as supplierApi from "../services/supplierApi";

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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    supplierApi.getAllSuppliers()
      .then(data => setSuppliers(data))
      .catch(err => alert(err.message));
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

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý nhà cung cấp</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Ngày hợp tác</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
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
