from flask import Blueprint, request, jsonify
from database import db
from models import PHIEUDICHVU, CHITIETPHIEUDICHVU, THAMSO, DICHVU
from datetime import datetime


phieudichvu_bp = Blueprint('phieudichvu_bp', __name__)

# Hàm tính đơn giá được tính từ đơn giá dịch vụ + chi phí riêng + lợi nhuận từ tham số
def tinh_don_gia_duoc_tinh(dv: DICHVU, chi_phi_rieng: float = 0.0):
    # Map TenDV -> TenThamSo phụ thu
    phu_thu_mapping = {
        "CanThuVang": "PhuThu_CanVang",
        "DanhBongVang": "PhuThu_DanhBong",
        "ChamKhacTheoYeuCau": "PhuThu_ChamKhac",
        "GiaCongNuTrang": "PhuThu_MoRongNhan",  # Hoặc PhuThu_ThuNhoLac, tuỳ logic xử lý riêng
        "ThayDaQuy": "PhuThu_GanDaKimCuong"
    }

    ten_tham_so = phu_thu_mapping.get(dv.TenDV)

    if not ten_tham_so:
        raise ValueError(f"Chưa định nghĩa phụ thu cho dịch vụ {dv.TenDV}")

    thamso = THAMSO.query.filter_by(TenThamSo=ten_tham_so, KichHoat=True).first()
    ty_le = float(thamso.GiaTri) / 100 if thamso else 0.0

    return float(dv.DonGia) * (1 + ty_le) + chi_phi_rieng

# Tạo phiếu dịch vụ mới
@phieudichvu_bp.route('/phieudichvu', methods=['POST'])
def create_phieu_dich_vu():
    data = request.get_json()
    try:
        ma_kh      = data['MaKH']
        ghi_chu    = data.get('GhiChu', '')
        trang_thai = data.get('TrangThai', 'Chờ xử lý')
        tra_truoc  = float(data.get('TraTruoc', 0))
        chi_tiet   = data.get('ChiTiet', [])
        if not chi_tiet and data.get('MaDV'):
            chi_tiet = [{
                'MaDV': int(data['MaDV']),
                'SoLuong': 1,
                'TienTraTruoc': data.get('TraTruoc', 0),
                'TinhTrang': 'Chưa giao'
            }]
        tong_tien = 0
        chi_tiet_objs = []

        # 1) Xử lý từng dòng chi tiết
        for item in chi_tiet:
            dv = DICHVU.query.get(item['MaDV'])
            if not dv:
                raise ValueError(f"Dịch vụ mã {item['MaDV']} không tồn tại.")

            # Chi phí riêng (nếu có) sẽ cộng vào tính giá
            chi_phi_rieng = float(item.get('ChiPhiRieng', 0))
            don_gia_duoc_tinh = tinh_don_gia_duoc_tinh(dv, chi_phi_rieng)
            so_luong   = int(item['SoLuong'])
            thanh_tien = don_gia_duoc_tinh * so_luong
            tien_tra_truoc = float(item.get('TienTraTruoc', 0))
            tinh_trang = item.get('TinhTrang', 'Chưa giao')

            # 2) Kiểm tra trả trước ≥ 50%
            if tien_tra_truoc < 0.5 * thanh_tien:
                raise ValueError(
                  f"Tiền trả trước của dịch vụ {dv.TenDV} phải ≥ 50% thành tiền."
                )

            ct = CHITIETPHIEUDICHVU(
                MaDV            = dv.MaDV,
                DonGiaDichVu    = float(dv.DonGia),
                DonGiaDuocTinh  = don_gia_duoc_tinh,
                SoLuong         = so_luong,
                ThanhTien       = thanh_tien,
                TienTraTruoc    = tien_tra_truoc,
                TienConLai      = thanh_tien - tien_tra_truoc,
                NgayGiao        = item.get('NgayGiao'),
                TinhTrang       = tinh_trang
            )

            chi_tiet_objs.append(ct)
            tong_tien += thanh_tien

        # 3) Tạo Phiếu dịch vụ
        phieu = PHIEUDICHVU(
            MaKH      = ma_kh,
            NgayLap   = datetime.now(),
            TongTien  = tong_tien,
            TraTruoc  = tra_truoc,
            GhiChu    = ghi_chu,
            TrangThai = trang_thai
        )
        db.session.add(phieu)
        db.session.flush()  # để lấy phieu.MaPDV

        # 4) Gán MaPDV cho từng chi tiết rồi lưu
        for ct in chi_tiet_objs:
            ct.MaPDV = phieu.MaPDV
            db.session.add(ct)

        db.session.commit()

        # 5) (Tuỳ chọn) Cập nhật tiếp trạng thái tổng thể
        cap_nhat_trang_thai_phieu(phieu.MaPDV)

        return jsonify({
            'status': 'success',
            'message': 'Tạo phiếu dịch vụ thành công',
            'data': {'MaPDV': phieu.MaPDV}
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
# DELETE /api/phieudichvu/<id> - Xóa phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:id>', methods=['DELETE'])
def delete_phieu_dichvu(id):
    try:
        phieu = PHIEUDICHVU.query.get(id)
        if not phieu:
            return jsonify({"status": "error", "message": "Phiếu dịch vụ không tồn tại."}), 404
        db.session.delete(phieu)
        db.session.commit()
        return jsonify({"status": "success", "message": "Xóa phiếu dịch vụ thành công."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# GET /api/phieudichvu - Lấy danh sách phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu', methods=['GET'])
def list_phieu_dichvu():
    try:
        phieus = PHIEUDICHVU.query.all()
        result = []

        for p in phieus:
            # Lấy danh sách chi tiết
            chi_tiet_list = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=p.MaPDV).all()

            tong_tien = 0
            for ct in chi_tiet_list:
                dv = DICHVU.query.get(ct.MaDV)
                if not dv:
                    continue
                # Tên tham số phụ thu tương ứng
                map_phuthu = {
                    "CanThuVang": "PhuThu_CanVang",
                    "DanhBongVang": "PhuThu_DanhBong",
                    "ChamKhacTheoYeuCau": "PhuThu_ChamKhac",
                    "GiaCongNuTrang": "PhuThu_MoRongNhan",  # Hoặc ThuNhoLac
                    "ThayDaQuy": "PhuThu_GanDaKimCuong"
                }
                key = map_phuthu.get(dv.TenDV, None)
                phu_thu = 0.0
                if key:
                    ts = THAMSO.query.filter_by(TenThamSo=key, KichHoat=True).first()
                    if ts:
                        phu_thu = float(ts.GiaTri) / 100.0

                don_gia_tinh = float(dv.DonGia) * (1 + phu_thu)
                tong_tien += don_gia_tinh * ct.SoLuong

            result.append({
                "MaPDV": p.MaPDV,
                "MaKH": p.MaKH,
                "NgayLap": p.NgayLap.strftime("%Y-%m-%d %H:%M:%S"),
                "TongTien": round(tong_tien, 2),
                "TraTruoc": float(p.TraTruoc),
                "GhiChu": p.GhiChu or "",
                "TrangThai": p.TrangThai
            })

        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
# Xem chi tiết phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:id>', methods=['GET'])
def detail_phieu_dich_vu(id):
    p = PHIEUDICHVU.query.get_or_404(id)
    # Lấy chi tiết
    details = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).all()

    # Build dict cho phiếu
    phieu_data = {
        "MaPDV":      p.MaPDV,
        "MaKH":       p.MaKH,
        "NgayLap":    p.NgayLap.strftime("%Y-%m-%d %H:%M:%S"),
        "TongTien":   float(p.TongTien),
        "TraTruoc":   float(p.TraTruoc),
        "GhiChu":     p.GhiChu or "",
        "TrangThai":  p.TrangThai,
        "ChiTiet": []
    }

    # Build list chi tiết
    for d in details:
        phieu_data["ChiTiet"].append({
            "MaCT":          d.MaCT,
            "MaDV":          d.MaDV,
            "DonGiaDichVu":  float(d.DonGiaDichVu),
            "DonGiaDuocTinh":float(d.DonGiaDuocTinh),
            "SoLuong":       d.SoLuong,
            "ThanhTien":     float(d.ThanhTien),
            "TienTraTruoc":  float(d.TienTraTruoc),
            "TienConLai":    float(d.TienConLai),
            "NgayGiao":      d.NgayGiao.strftime("%Y-%m-%d") if d.NgayGiao else None,
            "TinhTrang":     d.TinhTrang
        })

    return jsonify({"status": "success", "data": phieu_data})
# Cập nhật 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['PUT'])
def update_chi_tiet_dich_vu(id):
    ct = CHITIETPHIEUDICHVU.query.get_or_404(id)
    data = request.get_json()

    ct.DonGiaDichVu = data.get('DonGiaDichVu', ct.DonGiaDichVu)
    ct.DonGiaDuocTinh = data.get('DonGiaDuocTinh', ct.DonGiaDuocTinh)
    ct.SoLuong = data.get('SoLuong', ct.SoLuong)
    ct.TienTraTruoc = data.get('TienTraTruoc', ct.TienTraTruoc)
    ct.NgayGiao = data.get('NgayGiao', ct.NgayGiao)
    ct.TinhTrang = data.get('TinhTrang', ct.TinhTrang)

    ct.ThanhTien = ct.DonGiaDuocTinh * ct.SoLuong
    ct.TienConLai = ct.ThanhTien - ct.TienTraTruoc

    db.session.commit()
    # Cập nhật trạng thái phiếu nếu cần
    cap_nhat_trang_thai_phieu(ct.MaPDV)
    
    return jsonify({'status': 'success', 'message': 'Cập nhật chi tiết thành công'})

# Xóa 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['DELETE'])
def delete_chi_tiet_dich_vu(id):
    ct = CHITIETPHIEUDICHVU.query.get_or_404(id)
    ma_pdv = ct.MaPDV
    db.session.delete(ct)
    db.session.commit()
    cap_nhat_trang_thai_phieu(ma_pdv)
    return jsonify({'status': 'success', 'message': 'Xóa chi tiết dịch vụ thành công'})

# (Tùy chọn) Xoá toàn bộ chi tiết của 1 phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:ma_pdv>/clear', methods=['DELETE'])
def clear_all_chi_tiet(ma_pdv):
    CHITIETPHIEUDICHVU.query.filter_by(MaPDV=ma_pdv).delete()
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Đã xóa toàn bộ chi tiết của phiếu'})

def cap_nhat_trang_thai_phieu(ma_pdv):
    chi_tiet = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=ma_pdv).all()
    if not chi_tiet:
        return  # Không có chi tiết nào → giữ nguyên

    da_giao_het = all(ct.TinhTrang == "Đã giao" for ct in chi_tiet)

    phieu = PHIEUDICHVU.query.get(ma_pdv)
    phieu.TrangThai = "Hoàn thành" if da_giao_het else "Chưa hoàn thành"
    db.session.commit()

@phieudichvu_bp.route("/phieudichvu/<int:id>/print", methods=["GET"])
def print_phieu_dich_vu(id):
    try:
        phieu = PHIEUDICHVU.query.get_or_404(id)
        chi_tiets = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).all()

        rows_html = ""
        for ct in chi_tiets:
            dv = DICHVU.query.get(ct.MaDV)
            rows_html += f"""
            <tr>
              <td>{dv.TenDV}</td>
              <td>{ct.DonGiaDuocTinh}₫</td>
              <td>{ct.SoLuong}</td>
              <td>{ct.ThanhTien}₫</td>
              <td>{ct.TinhTrang}</td>
            </tr>"""

        html = f"""
        <html>
        <head>
          <title>In Phiếu Dịch Vụ #{phieu.MaPDV}</title>
          <style>
            body {{ font-family: Arial, sans-serif; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid black; padding: 8px; text-align: left; }}
          </style>
        </head>
        <body>
          <h2>PHIẾU DỊCH VỤ #{phieu.MaPDV}</h2>
          <p><strong>Mã KH:</strong> {phieu.MaKH}</p>
          <p><strong>Ngày lập:</strong> {phieu.NgayLap.strftime("%Y-%m-%d %H:%M:%S")}</p>
          <p><strong>Ghi chú:</strong> {phieu.GhiChu}</p>
          <p><strong>Trạng thái:</strong> {phieu.TrangThai}</p>
          <hr>
          <h4>Chi tiết dịch vụ:</h4>
          <table>
            <tr><th>Dịch vụ</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th>Tình trạng</th></tr>
            {rows_html}
          </table>
          <p><strong>Tổng tiền:</strong> {phieu.TongTien}₫</p>
          <p><strong>Trả trước:</strong> {phieu.TraTruoc}₫</p>
        </body>
        </html>
        """
        return html

    except Exception as e:
        return f"<h1>Lỗi: {str(e)}</h1>", 500
