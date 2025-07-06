import React, { useState, useEffect } from "react";
import { ArrowUpDown, Printer, Edit, Trash, Download } from "lucide-react";
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
      // basic fields
      const base = {
        LoaiBaoCao: item.LoaiBaoCao,
        TuNgay:     item.TuNgay,
        DenNgay:    item.DenNgay,
        MoTa:       item.MoTa || "",
      };

      // now derive your time‑type + selection values:
      let thoiGianLoai    = "";
      let selectedDate    = "";
      let selectedMonth   = "";
      let selectedYear    = "";

      if (base.TuNgay === base.DenNgay) {
        // same day
        thoiGianLoai = "ngay";
        selectedDate = base.TuNgay;
      } else {
        const [y1, m1] = base.TuNgay.split("-");
        // const [y2, m2] = base.DenNgay.split("-");
        // month report: starts 1st and ends last day of same month
        const lastDay = new Date(+y1, +m1, 0).getDate().toString().padStart(2, "0");
        if (
          base.TuNgay === `${y1}-${m1}-01` &&
          base.DenNgay === `${y1}-${m1}-${lastDay}`
        ) {
          thoiGianLoai  = "thang";
          selectedMonth = `${y1}-${m1}`;
        }
        // year report: starts Jan 1 and ends Dec 31
        else if (
          base.TuNgay === `${y1}-01-01` &&
          base.DenNgay === `${y1}-12-31`
        ) {
          thoiGianLoai = "nam";
          selectedYear = y1;
        }
      }

      setFormData({
        ...base,
        thoiGianLoai,
        selectedDate,
        selectedMonth,
        selectedYear,
      });
    } else {
      // reset for add
      setFormData({
        LoaiBaoCao:  "",
        TuNgay:      "",
        DenNgay:     "",
        MoTa:        "",
        thoiGianLoai:"",
        selectedDate:"",
        selectedMonth:"",
        selectedYear:"",
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
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((f) => ({ ...f, [name]: value }));
  // };


// 5. Validate
// const validate = () => {
//   // Bắt buộc chọn loại, từ ngày, đến ngày
//   if (!formData.LoaiBaoCao || !formData.TuNgay || !formData.DenNgay) {
//     setError("Vui lòng chọn loại và khoảng thời gian báo cáo.");
//     return false;
//   }
//   return true;
// };

 // 6. Submit (add / edit)
 const handleSubmit = async (formData) => {
  console.log("Dữ liệu gửi đi:", formData);

  const { LoaiBaoCao, TuNgay, DenNgay, MoTa } = formData;

  if (!LoaiBaoCao) {
    alert("Vui lòng chọn loại báo cáo.");
    return;
  }
  if (!TuNgay || !DenNgay) {
    alert("Không xác định được khoảng thời gian. Vui lòng chọn lại.");
    return;
  }

  const payload = {
    LoaiBaoCao,
    TuNgay,
    DenNgay,
    MoTa,
    NguoiTao: 1,
  };

  console.log("Payload gửi API:", payload);

  try {
    const res = modalType === "add"
      ? await themBaoCao(payload)
      : await suaBaoCao(currentItem.MaBC, payload);

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
  const exportPDF = (report) => {
    if (!report || !report.MaBC) {
      alert("Vui lòng chọn báo cáo để xuất PDF.");
      return;
    }

    inBaoCaoPDF(report.MaBC)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url);
      })
      .catch((err) => alert("Lỗi khi xuất PDF: " + err.message));

    console.log("Xuất PDF cho báo cáo:", report);
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
              <th>
               Báo cáo
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
            {reports.map((r) => {
              let rangeType;
              if (r.TuNgay === r.DenNgay) {
                rangeType = "Theo ngày";
              } else if (r.TuNgay.slice(0,7) === r.DenNgay.slice(0,7)) {
                rangeType = "Theo tháng";
              } else {
                rangeType = "Theo năm";
              }
              return (
                <tr key={r.MaBC}>
                  <td>{r.MaBC}</td>
                  <td>{r.LoaiBaoCao}</td>
                  <td>{rangeType}</td>
                  <td>{r.TuNgay}</td> 
                  <td>{r.DenNgay}</td>
                  <td>
                    {r.LoaiBaoCao === "Doanh thu" && typeof r.DuLieu === "object" ? (
                      <div>
                        <b>Doanh thu:</b>{" "}
                        {parseFloat(r.DuLieu.DoanhThu || 0).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </div>
                    ) : r.LoaiBaoCao === "Lợi nhuận" && typeof r.DuLieu === "object" ? (
                      <div>
                        <b>Lợi nhuận:</b>{" "}
                        {parseFloat(r.DuLieu.LoiNhuan || 0).toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </div>
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
                    <button onClick={() => exportPDF(r)} className="action-icon export-pdf">
                      <Printer　color="#22c55e" className="icon" />
                    </button>
                  </td>
                </tr>
              );
            })}
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
        onSubmit={ handleSaveReport }
      />
    </div>
  );
}

