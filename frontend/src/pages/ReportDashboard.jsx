import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm"; // Đường dẫn tuỳ chỉnh

function ReportDashboard() {
  const [reports, setReports] = useState([
    {
      id: 1,
      type: "Doanh thu",
      date: "2025-06-21",
      data: JSON.stringify({ total: 1000000 }),
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedReport, setSelectedReport] = useState(null);

  // Mở modal
  const openModal = (mode, report = null) => {
    setModalMode(mode);
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Đóng modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  // Gửi form
  const handleSubmit = (data) => {
    try {
      const parsedData = JSON.parse(data.data); // kiểm tra dữ liệu JSON

      if (modalMode === "add") {
        const newReport = { ...data, id: Date.now(), data: JSON.stringify(parsedData) };
        setReports([...reports, newReport]);
      } else if (modalMode === "edit" && selectedReport) {
        const updated = reports.map((r) =>
          r.id === selectedReport.id ? { ...r, ...data, data: JSON.stringify(parsedData) } : r
        );
        setReports(updated);
      }

      closeModal();
    } catch (error) {
      alert("Dữ liệu không hợp lệ! Hãy nhập định dạng JSON hợp lệ.");
    }
  };

  // Xoá báo cáo
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xoá báo cáo này?")) {
      setReports(reports.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Báo cáo & Thống kê</h2>
        <button onClick={() => openModal("add")} className="action-button">
          Thêm báo cáo
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại</th>
              <th>Thời gian</th>
              <th>Dữ liệu</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.type}</td>
                <td>{r.date}</td>
                <td>
                  <pre>{JSON.stringify(JSON.parse(r.data), null, 2)}</pre>
                </td>
                <td>
                  <button onClick={() => openModal("edit", r)} className="action-icon edit">
                    <Edit className="icon" />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="action-icon delete">
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
          section="reports"
          mode={modalMode}
          initialData={selectedReport}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default ReportDashboard;
