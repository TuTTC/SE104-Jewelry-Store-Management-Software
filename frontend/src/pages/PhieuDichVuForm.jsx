import React, { useEffect, useState } from "react";
import { X, Plus, Trash } from "lucide-react";
import "../App.css";

const PhieuDichVuForm = ({ visible, onClose, onSave, mode = "add", initialData = {} }) => {
  const [maKH, setMaKH] = useState("");
  const [ngayLap, setNgayLap] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [trangThai, setTrangThai] = useState("Chưa giao");
  const [danhSachDichVu, setDanhSachDichVu] = useState([]);
  const [chiTiet, setChiTiet] = useState([]);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    async function fetchDichVu() {
      const res = await fetch("http://localhost:5000/api/dichvu");
      const json = await res.json();
      if (json.status === "success") setDanhSachDichVu(json.data);
    }
    fetchDichVu();
  }, []);

//   useEffect(() => {
//   if (visible) {
//     if (mode === "add") {
//       // Reset toàn bộ các trường khi thêm mới
//       // setMaKH("");
//       setUserID("");
//       setNgayLap("");
//       setGhiChu("");
//       setTrangThai("Chưa giao");
//       setChiTiet([]);
//     } else if (mode === "edit" || mode === "view") {
//       // Nếu sửa hoặc xem, nạp dữ liệu từ initialData
//       setUserID(initialData.UserID || "");
//       // // setMaKH(initialData.MaKH || "");
//       // const ngayLapFormat = initialData.NgayLap
//       //   ? initialData.NgayLap.replace(" ", "T").slice(0, 16)
//       //   : "";

//       // setNgayLap(ngayLapFormat);
//       setNgayLap(initialData.NgayLap || "");
//       setGhiChu(initialData.GhiChu || "");
//       setTrangThai(initialData.TrangThai || "Chưa giao");
//       setChiTiet(initialData.ChiTiet || []);
//     }
//   }
// }, [visible, mode, initialData]);
useEffect(() => {
  if (visible) {
    if (mode === "add") {
      setUserID("");
      setNgayLap("");
      setGhiChu("");
      setTrangThai("Chưa giao");
      setChiTiet([]);
    } else if (mode === "edit" || mode === "view") {
      setUserID(initialData.UserID || "");

      const ngayLapFormat = initialData.NgayLap
        ? initialData.NgayLap.replace(" ", "T").slice(0, 16)
        : "";

      setNgayLap(ngayLapFormat);
      setGhiChu(initialData.GhiChu || "");
      setTrangThai(initialData.TrangThai || "Chưa giao");

      // Chuẩn hóa dữ liệu chi tiết về đúng định dạng form cần
      const chiTietChuanHoa = (initialData.ChiTiet || []).map(d => ({
        MaDV: d.MaDV,
        SoLuong: d.SoLuong,
        ChiPhiRieng: d.ChiPhiRieng,
        DonGia: d.DonGiaDichVu,   // Lấy từ DonGiaDichVu backend trả về
        TinhTrang: d.TinhTrang,
        TienTraTruoc: d.TienTraTruoc
      }));

      setChiTiet(chiTietChuanHoa);
    }
  }
}, [visible, mode, initialData]);



  const handleAddDichVu = () => {
    setChiTiet([
      ...chiTiet,
      {
        MaDV: "",
        SoLuong: 1,
        ChiPhiRieng: 0,
        DonGia: 0,
        TinhTrang: "Chưa giao",
        TienTraTruoc: 0,
      },
    ]);
  };

  const handleRemoveDichVu = (index) => {
    const newList = [...chiTiet];
    newList.splice(index, 1);
    setChiTiet(newList);
  };

  const updateDichVu = (index, field, value) => {
    const updated = [...chiTiet];
    updated[index][field] = value;

    if (field === "MaDV") {
      const dv = danhSachDichVu.find((d) => d.MaDV === parseInt(value));
      updated[index].DonGia = dv?.DonGia || 0;

      // Nếu các trường chưa được gán lần nào thì gán mặc định
      if (!updated[index].ChiPhiRieng) updated[index].ChiPhiRieng = 0;
      if (!updated[index].SoLuong) updated[index].SoLuong = 1;
      if (!updated[index].TienTraTruoc) updated[index].TienTraTruoc = 0;
    }

    const donGia = parseFloat(updated[index].DonGia) || 0;
    const chiPhi = parseFloat(updated[index].ChiPhiRieng) || 0;
    const soLuong = parseInt(updated[index].SoLuong) || 0;

    const donGiaDuocTinh = donGia + chiPhi;
    const thanhTien = donGiaDuocTinh * soLuong;

    updated[index].ThanhTien = thanhTien;
    updated[index].TienTraTruoc = Math.max(
      parseFloat(updated[index].TienTraTruoc) || 0,
      Math.ceil(thanhTien * 0.5)
    );

    setChiTiet(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      UserID: parseInt(userID),
      NgayLap: ngayLap.replace("T", " "),
      // NgayLap: ngayLap,
      GhiChu: ghiChu,
      TrangThai: trangThai,
      ChiTiet: chiTiet.map((d) => ({
        MaDV: parseInt(d.MaDV),
        SoLuong: parseInt(d.SoLuong),
        ChiPhiRieng: parseFloat(d.ChiPhiRieng || 0),
        DonGia: parseFloat(d.DonGia || 0),
        TienTraTruoc: parseFloat(d.TienTraTruoc || 0),
        TinhTrang: d.TinhTrang,
      })),
    };
    onSave(payload);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        style={{
          width: "95%",
          maxWidth: "1300px",
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div className="modal-header">
          <h2>
            {mode === "add" ? "Thêm phiếu dịch vụ" : "Sửa phiếu dịch vụ"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form scrollable">
          <input
          type="number"
          placeholder="Mã khách hàng"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          required
        />

          <input
            type="datetime-local"
            value={ngayLap}
            onChange={(e) => setNgayLap(e.target.value)}
            required
          />
          <textarea
            placeholder="Ghi chú"
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            rows="3"
          />
          <select
            value={trangThai}
            onChange={(e) => setTrangThai(e.target.value)}
          >
           
            <option value="Chưa hoàn thành">Chưa hoàn thành</option>
            <option value="Hoàn thành">Hoàn thành</option>
           
          </select>

          <hr />
          <h3>Danh sách chi tiết dịch vụ</h3>
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "300px",
              marginBottom: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
          {/* <h3>Danh sách chi tiết dịch vụ</h3> */}
          <table
            className="data-table"
            style={{
              width: "100%",
              tableLayout: "auto",
              borderCollapse: "collapse",
              whiteSpace: "nowrap",
            }}
          >
            <thead>
              <tr>
                <th style={{ minWidth: "160px" }}>Dịch vụ</th>
                <th style={{ minWidth: "100px" }}>Số lượng</th>
                <th style={{ minWidth: "140px" }}>Chi phí riêng</th>
                <th style={{ minWidth: "160px" }}>Đơn giá được tính</th>
                <th style={{ minWidth: "150px" }}>Thành tiền</th>
                <th style={{ minWidth: "130px" }}>Trả trước</th>
                <th style={{ minWidth: "120px" }}>Tình trạng</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {chiTiet.map((item, index) => {
                const donGiaDuocTinh =
                  (parseFloat(item.DonGia) || 0) + (parseFloat(item.ChiPhiRieng) || 0);
                const thanhTien = donGiaDuocTinh * (parseInt(item.SoLuong) || 0);

                return (
                  <tr key={index}>
                    <td>
                    <select
                      value={item.MaDV}
                      onChange={(e) => updateDichVu(index, "MaDV", e.target.value)}
                      required
                      style={{ width: "100%" }}
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {danhSachDichVu
                        .filter((dv) => dv.TrangThai === 1 || dv.TrangThai === true || dv.TrangThai === "true")
                        .map((dv) => (
                          <option key={dv.MaDV} value={dv.MaDV}>
                            {dv.TenDV}
                          </option>
                      ))}
                    </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.SoLuong}
                        onChange={(e) => updateDichVu(index, "SoLuong", e.target.value)}
                        min="1"
                        style={{ width: "100%" }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.ChiPhiRieng}
                        onChange={(e) =>
                          updateDichVu(index, "ChiPhiRieng", e.target.value)
                        }
                        min="0"
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      {donGiaDuocTinh.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td>
                      {thanhTien.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td>
                    <input
                      type="number"
                      min={!isNaN(thanhTien) ? Math.ceil(thanhTien * 0.5) : 0}
                      value={item.TienTraTruoc}
                      onChange={(e) => updateDichVu(index, "TienTraTruoc", e.target.value)}
                      style={{ width: "100%" }}
                      required
                    />
                    </td>
                    <td>
                      <select
                        value={item.TinhTrang}
                        onChange={(e) =>
                          updateDichVu(index, "TinhTrang", e.target.value)
                        }
                        style={{ width: "100%" }}
                      >
                        <option value="Chưa giao">Chưa giao</option>
                        <option value="Đã giao">Đã giao</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveDichVu(index)}
                        className="action-icon delete"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <button type="button" onClick={handleAddDichVu} className="action-button">
            <Plus size={16} /> Thêm dịch vụ
          </button>

         <div className="modal-actions">
          <button type="submit" className="action-button">
            {mode === "add" ? "Lưu phiếu" : "Cập nhật"}
          </button>
          <button type="button" className="action-button cancel" onClick={onClose}>
            Hủy
          </button>
        </div>

        </form>
      </div>
    </div>
  );
};

export default PhieuDichVuForm;
