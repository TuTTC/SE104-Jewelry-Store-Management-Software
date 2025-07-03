import React, { useEffect, useState } from "react";
import { fetchPhuThuByTen } from "../services/parameterApi";

const PhieuDichVuForm = ({
  visible,
  onClose,
  onSave,
  initialData = {},
  mode = "add"
}) => {
  const [maKH, setMaKH] = useState("");
  const [ngayLap, setNgayLap] = useState("");
  const [tongTien, setTongTien] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [trangThai, setTrangThai] = useState("Chờ xử lý");
  const [maDV, setMaDV] = useState("");
  const [donGia, setDonGia] = useState(0);
  const [donGiaThucTe, setDonGiaThucTe] = useState(0);
  const [soLuong, setSoLuong] = useState(1);
  const [thanhTien, setThanhTien] = useState(0);
  const [traTruoc, setTraTruoc] = useState(0);
  const [danhSachDichVu, setDanhSachDichVu] = useState([]);
  // Đọc dữ liệu khi chuyển sang chế độ xem/sửa
  useEffect(() => {
    if (mode !== "add" && initialData) {
      if (initialData.ChiTiet?.length) {
        setMaDV(initialData.ChiTiet[0].MaDV.toString());
      }
      setMaKH(initialData.MaKH || "");
      setNgayLap(initialData.NgayLap?.replace(" ", "T") || "");
      setTongTien(initialData.TongTien?.toString() || "");
      setTraTruoc(initialData.TraTruoc?.toString() || "");
      setGhiChu(initialData.GhiChu || "");
      setTrangThai(initialData.TrangThai || "Chờ xử lý");
    } else {
      setMaKH("");
      setNgayLap("");
      setTongTien("");
      setTraTruoc("");
      setGhiChu("");
      setTrangThai("Chờ xử lý");
      setMaDV("");
      setSoLuong(1);
    }
  }, [initialData, mode]);

  useEffect(() => {
    async function fetchDichVu() {
      const res = await fetch("http://localhost:5000/api/dichvu");
      const json = await res.json();
      if (json.status === "success") setDanhSachDichVu(json.data);
    }
    fetchDichVu();
  }, []);

  useEffect(() => {
  if (!maDV) return;
  const selected = danhSachDichVu.find((d) => d.MaDV === parseInt(maDV));
  if (!selected) return;

    const keyMap = {
    CanThuVang: "PhuThu_CanVang",
    DanhBongVang: "PhuThu_DanhBong",
    ChamKhacTheoYeuCau: "PhuThu_ChamKhac",
    GiaCongNuTrang: "PhuThu_MoRongNhan",
    ThayDaQuy: "PhuThu_GanDaKimCuong",
    };
  const tenThamSo = keyMap[selected.TenDV];
  const giaGoc = +selected.DonGia;
  async function fetchPhuThu() {
    try {
      const { status, data } = await fetchPhuThuByTen(tenThamSo);
      const tyLe = status === "success" ? (+data.GiaTri) / 100 : 0.05;
      const giaTinh = giaGoc * (1 + tyLe);
      setDonGia(giaGoc);
      setDonGiaThucTe(giaTinh);
      setThanhTien(giaTinh * soLuong);
      setTraTruoc(Math.ceil(giaTinh * soLuong * 0.5));
    } catch (err) {
      console.error("Lỗi khi fetch phụ thu:", err);
    }
  }

  fetchPhuThu();
}, [maDV, soLuong, danhSachDichVu]);

  const readOnly = mode === "view";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;

    const payload = {
      MaKH: parseInt(maKH, 10),
      ChiTiet: [
      {
        MaDV: parseInt(maDV, 10),
        SoLuong: parseInt(soLuong, 10),
        TienTraTruoc: parseFloat(traTruoc) || 0,
        TinhTrang: "Chưa giao",
      }
    ],
      NgayLap: ngayLap,
      TongTien: parseFloat(thanhTien),
      TraTruoc: parseFloat(traTruoc || 0),
      GhiChu: ghiChu,
      TrangThai: trangThai,
    };
    console.log("MaDV đang lưu:", maDV);
    console.log("Tên dịch vụ:", danhSachDichVu.find(d => d.MaDV == maDV)?.TenDV);
    console.log("Payload đầy đủ:", payload);
    onSave && onSave(payload);
  };

  if (!visible) return null;


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          {mode === "add"
            ? "Thêm phiếu dịch vụ"
            : mode === "edit"
            ? "Chỉnh sửa phiếu dịch vụ"
            : "Chi tiết phiếu dịch vụ"}
        </h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Mã khách hàng<br />
            <input
              type="number"
              value={maKH}
              onChange={(e) => setMaKH(e.target.value)}
              disabled={readOnly}
              required
            />
          </label>
        <label>
          Dịch vụ<br />
          <select
           value={maDV}
           onChange={(e) => setMaDV(e.target.value)}
           required
           disabled={mode !== "add"}
          >
            <option value="">-- Chọn dịch vụ --</option>
            {danhSachDichVu.map((dv) => (
              <option key={dv.MaDV} value={dv.MaDV}>
                {dv.TenDV}
              </option>
            ))}
          </select>
        </label>
          <label>
            Ngày lập<br />
            <input
              type="datetime-local"
              value={ngayLap}
              onChange={(e) => setNgayLap(e.target.value)}
              disabled={readOnly}
              required
            />
          </label>

          <label>
            Số lượng<br />
           <input
             type="number"
             value={soLuong}
             min={1}
             onChange={(e) => setSoLuong(parseInt(e.target.value))}
             required
             disabled={readOnly}
           />
          </label>

          <label>
            Đơn giá gốc: {donGia.toLocaleString()}₫
          </label>
           {/* --- Tổng tiền: read-only khi view, else cho phép override --- */}
           <label>
             Tổng tiền<br />
             {mode === "view" ? (
               <span className="read-only-value">
                 {thanhTien.toLocaleString()}₫
               </span>
             ) : (
               <input
                 type="number"
                 step="0.01"
                 value={thanhTien || tongTien}
                 onChange={(e) => setTongTien(e.target.value)}
                 required
               />
             )}
           </label>
          <label>
            Trả trước<br />
           <input
             type="number"
             value={traTruoc}
             min={Math.ceil(thanhTien * 0.5)}
             onChange={(e) => setTraTruoc(parseInt(e.target.value))}
             required
             disabled={readOnly}
           />
          </label>
          <label>
            Ghi chú<br />
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              rows={2}
              disabled={readOnly}
            />
          </label>
          <label>
            Trạng thái<br />
            <select
              value={trangThai}
              onChange={(e) => setTrangThai(e.target.value)}
              disabled={readOnly}
            >
              <option>Chờ xử lý</option>
              <option>Đang thực hiện</option>
              <option>Hoàn thành</option>
              <option>Hủy</option>
            </select>
          </label>
          <div className="modal-actions">
            {mode !== "view" && (
              <button type="submit" className="action-button">
                Lưu phiếu
              </button>
            )}
            <button
              type="button"
              className="action-button cancel"
              onClick={onClose}
            >
              {mode === "view" ? "Đóng" : "Hủy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhieuDichVuForm;
