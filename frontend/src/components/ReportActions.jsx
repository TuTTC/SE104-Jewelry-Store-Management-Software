import React from "react";
import { Download } from "lucide-react";

export default function ReportActions({ onAdd, onExportCSV, onExportPDF }) {
  return (
    <div className="service-actions">
      <button onClick={onAdd} className="action-button">Thêm báo cáo</button>
      <button onClick={onExportCSV} className="action-button">
        <Download className="icon" /> Xuất CSV
      </button>
      <button onClick={onExportPDF} className="action-button">
        <Download className="icon" /> Xuất PDF
      </button>
    </div>
  );
}
