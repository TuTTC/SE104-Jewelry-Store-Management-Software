import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // điều chỉnh path nếu cần

const initialServices = [
  { id: 1, code: "DV001", name: "Thiết kế theo yêu cầu", price: 500.00, description: "Thiết kế trang sức tùy chỉnh", status: true },
  { id: 2, code: "DV002", name: "Sửa chữa trang sức", price: 300.00, description: "Sửa chữa và đánh bóng", status: true },
];

function ServiceManager() {
  const [services, setServices] = useState(initialServices);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedService, setSelectedService] = useState(null);

  // Mở modal
  const openModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedService(null);
  };

  // Gửi form
  const handleSubmit = (data) => {
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      status: data.status === "true", // Chuyển thành boolean
    };

    if (modalMode === "add") {
      const newService = { ...formattedData, id: Date.now() };
      setServices([...services, newService]);
    } else if (modalMode === "edit" && selectedService) {
      const updated = services.map((s) =>
        s.id === selectedService.id ? { ...s, ...formattedData } : s
      );
      setServices(updated);
    }

    closeModal();
  };

  // Xoá dịch vụ
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá dịch vụ này?")) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  // Hành động riêng
  const handleSearchService = () => {
    alert("Tính năng tra cứu dịch vụ đang được phát triển.");
  };

  const handleCreateServiceTicket = () => {
    alert("Tạo phiếu dịch vụ thành công.");
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Quản lý dịch vụ</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm dịch vụ
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.price.toLocaleString()}₫</td>
                <td>{s.description}</td>
                <td>
                  <span className={s.status ? "status-instock" : "status-inactive"}>
                    {s.status ? "Kích hoạt" : "Không hoạt động"}
                  </span>
                </td>
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

      <div className="service-actions">
        <button onClick={handleSearchService} className="action-button">Tra cứu dịch vụ</button>
        <button onClick={handleCreateServiceTicket} className="action-button">Phiếu dịch vụ</button>
      </div>

      {modalVisible && (
        <GeneralModalForm
          section="services"
          mode={modalMode}
          initialData={selectedService}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default ServiceManager;
