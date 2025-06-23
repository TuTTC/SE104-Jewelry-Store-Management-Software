import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh lại đường dẫn nếu cần

const SupplierManager = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Công ty TNHH ABC",
      phone: "0901234567",
      email: "abc@gmail.com",
      address: "123 Lê Lợi, Quận 1, TP.HCM",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const openModal = (mode, supplier = null) => {
    setModalMode(mode);
    setSelectedSupplier(supplier);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSupplier(null);
  };

  const handleSubmit = (data) => {
    if (modalMode === "add") {
      const newSupplier = { ...data, id: Date.now() };
      setSuppliers([...suppliers, newSupplier]);
    } else if (modalMode === "edit" && selectedSupplier) {
      const updated = suppliers.map((s) =>
        s.id === selectedSupplier.id ? { ...s, ...data } : s
      );
      setSuppliers(updated);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá nhà cung cấp này?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
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
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>
                  <button onClick={() => openModal("edit", s)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="action-icon delete">
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
          section="suppliers"
          mode={modalMode}
          initialData={selectedSupplier}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default SupplierManager;
