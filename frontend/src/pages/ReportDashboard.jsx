import React, { useState, useEffect } from "react";
import { ArrowUpDown, Download, Edit, Trash } from "lucide-react";
import GeneralModalForm from "../components/GeneralModalForm-2.jsx";
import {
  layDanhSachBaoCao,
  themBaoCao,
  suaBaoCao,
  xoaBaoCao,
  inBaoCaoPDF,
} from "../services/baocaoApi";
import Pagination from '../components/Pagination';

export default function ReportDashboard() {
  const [reports, setReports] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    LoaiBaoCao: "Doanh thu",
    TuNgay: "",
    DenNgay: "",
    MoTa: "",
    NguoiTao: 1,
  });
  const [error, setError] = useState("");

 // 1. Load danh sách
  useEffect(() => {
    (async () => {
      try {
        const res = await layDanhSachBaoCao();
        if (res.status === "success") setReports(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy báo cáo:", err);
      }
    })();
  }, []);

  // 2. Sort
  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    const sorted = [...reports].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setReports(sorted);
  };

 // 3. Mở / đóng modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setCurrentItem(item);
    if (type === "edit" && item) {
      setFormData({
        LoaiBaoCao: item.LoaiBaoCao,
        TuNgay: item.TuNgay,
        DenNgay: item.DenNgay,
        MoTa: item.MoTa,
      });
    } else {
      setFormData({
        LoaiBaoCao: "",
        TuNgay:      "",
        DenNgay:     "",
        MoTa:        "",
      });
    }
    setError("");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  // 4. Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };


// 5. Validate
const validate = () => {
  // Bắt buộc chọn loại, từ ngày, đến ngày
  if (!formData.LoaiBaoCao || !formData.TuNgay || !formData.DenNgay) {
    setError("Vui lòng chọn loại và khoảng thời gian báo cáo.");
    return false;
  }
  return true;
};

 // 6. Submit (add / edit)
  const handleSubmit = async (formData) => {
    console.log("📤 Dữ liệu gửi đi:", formData);
    const { LoaiBaoCao, TuNgay, DenNgay, MoTa } = formData;
    // ✅ Kiểm tra form trước
    if (!LoaiBaoCao || !TuNgay || !DenNgay) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin báo cáo.");
      return;
    }
    
    const payload = {
      LoaiBaoCao,
      TuNgay,
      DenNgay,
      MoTa,
      NguoiTao: 1,  // hoặc userID hiện tại nếu có login
    };

    try {
      const res =
        modalType === "add"
          ? await themBaoCao(formData)
          : await suaBaoCao(currentItem.MaBC, formData);

      if (res.status === "success") {
        const reload = await layDanhSachBaoCao();
        if (reload.status === "success") setReports(reload.data);
        closeModal();
      } else {
        alert("Thất bại: " + res.message);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  // The following block is a duplicate and should be removed to avoid syntax errors.

  // 7. Xóa
  const handleDelete = async (MaBC) => {
    if (!window.confirm("Xác nhận xóa báo cáo này?")) return;
    try {
      const res = await xoaBaoCao(MaBC);
      if (res.status === "success") {
        setReports((prev) => prev.filter((r) => r.MaBC !== MaBC));
      } else {
        alert("Xóa thất bại: " + res.message);
      }
    } catch {
      alert("Lỗi kết nối khi xóa.");
    }
  };

  // 8a. Xuất CSV
  const exportCSV = () => {
    const headers = ["MaBC","LoaiBaoCao","TuNgay","DenNgay","MoTa","TaoNgay"];
    const rows = reports.map(r =>
      headers.map(h => `"${r[h]||""}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
  };

  // 8b. Xuất PDF
 const exportPDF = () => {
   if (!currentReport || !currentReport.MaBC) {
     return alert("Vui lòng chọn báo cáo để xuất PDF.");
   }
   inBaoCaoPDF(currentReport.MaBC)
     .then((blob) => {
       const url = URL.createObjectURL(blob);
       window.open(url);
     })
     .catch((err) => alert("Lỗi khi xuất PDF: " + err.message));
 };

  const showReportModal  = showModal;
  const modalMode        = modalType;
  const currentReport    = currentItem;
  const closeReportModal = closeModal;
  const handleSaveReport = handleSubmit;
  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">Báo cáo & Thống kê</h2>
        <div className="service-actions">
          <button onClick={() => openModal("add")} className="action-button">
            Thêm báo cáo
          </button>
          <button onClick={exportCSV} className="action-button">
            <Download className="icon" /> Xuất CSV
          </button>
          <button onClick={exportPDF} className="action-button">
            <Download className="icon" /> Xuất PDF
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => sortData("MaBC")}>
                ID <ArrowUpDown className="sort-icon" />
              </th>
              <th onClick={() => sortData("LoaiBaoCao")}>
                Loại <ArrowUpDown className="sort-icon" />
              </th>
              <th onClick={() => sortData("TuNgay")}>
                Từ ngày <ArrowUpDown className="sort-icon" />
              </th>
              <th onClick={() => sortData("DenNgay")}>
                Đến ngày <ArrowUpDown className="sort-icon" />
              </th>
              <th>Dữ liệu</th>
              <th onClick={() => sortData("TaoNgay")}>
                Ngày tạo <ArrowUpDown className="sort-icon" />
              </th>
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
                  <button
                    onClick={() => openModal("edit", r)}
                    className="action-icon edit"
                  >
                    <Edit className="icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.MaBC)}
                    className="action-icon delete"
                  >
                    <Trash className="icon" />
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Chưa có báo cáo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination />
      </div>

      <GeneralModalForm
        section="reports"
        mode={modalMode}
        initialData={currentReport} // hoặc {} với mode="add"
        showModal={showReportModal}
        onClose={closeReportModal}
        onSubmit={handleSaveReport}
      />
    </div>
  );
}

