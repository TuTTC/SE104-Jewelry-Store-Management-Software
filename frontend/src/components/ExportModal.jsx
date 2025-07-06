import React from "react";
import { X } from "lucide-react";

export default function ExportModal({
  show,
  onClose,
  exportFormData,
  onChange,
  onSubmit,
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Xuất Báo Cáo</h2>
          <button onClick={onClose} className="modal-close">
            <X className="icon" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <select
            name="reportType"
            value={exportFormData.reportType}
            onChange={onChange}
            required
          >
            <option value="year">Theo năm</option>
            <option value="month">Theo tháng</option>
          </select>
          {exportFormData.reportType === "month" && (
            <input
              type="number"
              name="year"
              value={exportFormData.year}
              onChange={onChange}
              placeholder="Chọn năm"
              min="2000"
              max={new Date().getFullYear()}
              required
            />
          )}
          <div className="modal-actions">
            <button type="submit" className="action-button">Xuất</button>
            <button type="button" onClick={onClose} className="action-button cancel">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
