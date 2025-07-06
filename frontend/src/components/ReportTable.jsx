import React from "react";
import { ArrowUpDown, Edit, Trash } from "lucide-react";

export default function ReportTable({ reports, onSort, onEdit, onDelete }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th onClick={() => onSort("MaBC")}>ID <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => onSort("LoaiBaoCao")}>Loại <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => onSort("TuNgay")}>Từ ngày <ArrowUpDown className="sort-icon" /></th>
          <th onClick={() => onSort("DenNgay")}>Đến ngày <ArrowUpDown className="sort-icon" /></th>
          <th>Dữ liệu</th>
          <th onClick={() => onSort("TaoNgay")}>Ngày tạo <ArrowUpDown className="sort-icon" /></th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.MaBC}>
            <td>{r.MaBC}</td>
            <td>{r.LoaiBaoCao}</td>
            <td>{r.TuNgay}</td>
            <td>{r.DenNgay}</td>
            <td>
              {r.LoaiBaoCao === "Doanh thu" ? (
                parseFloat(r.DuLieu).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
              ) : r.LoaiBaoCao === "Tồn kho" && Array.isArray(r.DuLieu) ? (
                <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                  {r.DuLieu.map((item, index) => (
                    <li key={index}>SP#{item.MaSP}: {item.SoLuongTon} sản phẩm</li>
                  ))}
                </ul>
              ) : (
                "Không rõ dữ liệu"
              )}
            </td>
            <td>{r.TaoNgay}</td>
            <td>
              <button onClick={() => onEdit(r)} className="action-icon edit">
                <Edit className="icon" />
              </button>
              <button onClick={() => onDelete(r.MaBC)} className="action-icon delete">
                <Trash className="icon" />
              </button>
            </td>
          </tr>
        ))}
        {reports.length === 0 && (
          <tr>
            <td colSpan={7} style={{ textAlign: "center" }}>
              Chưa có báo cáo nào.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
