from flask import Blueprint, request, jsonify, send_file
from datetime import datetime
from models.BaoCao import BAOCAO
from models.DonHang import DONHANG
from models.NguoiDung import NGUOIDUNG 
from models.NhaCungCap import NHACUNGCAP
from models.PhieuDichVu import PHIEUDICHVU
from models.ChiTietPhieuDichVu import CHITIETPHIEUDICHVU
from models.PhieuNhap import PHIEUNHAP
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from database import db
from sqlalchemy import func
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from calendar import monthrange
import os
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity, jwt_required
FONT_PATH = os.path.join(os.path.dirname(__file__), "..", "fonts", "times.ttf")

pdfmetrics.registerFont(TTFont("TimesVN", FONT_PATH)) 

baocao_bp = Blueprint("baocao", __name__, url_prefix="/api")

@baocao_bp.route("/baocao", methods=["POST"])
@jwt_required()
@permission_required("reports:add")
def tao_bao_cao():
    data = request.get_json()
    loai       = data["LoaiBaoCao"]
    tu_ngay    = datetime.strptime(data.get("TuNgay"), "%Y-%m-%d").date()
    den_ngay   = datetime.strptime(data.get("DenNgay"), "%Y-%m-%d").date()
    mo_ta      = data.get("MoTa", "")
    nguoi_tao  = data.get("NguoiTao", 1)

    print("Dữ liệu nhận được:", data)

    # 1. Tạo báo cáo chính
    report = BAOCAO(
        LoaiBaoCao = loai,
        TuNgay     = tu_ngay,
        DenNgay    = den_ngay,
        MoTa       = mo_ta,
        NguoiTao   = nguoi_tao
    )
    db.session.add(report)

    # 2. Xác định loại còn lại
    loai_con_lai = "Lợi nhuận" if loai == "Doanh thu" else "Doanh thu"

    # 3. Kiểm tra đã tồn tại báo cáo còn lại chưa
    existed = BAOCAO.query.filter_by(
        LoaiBaoCao = loai_con_lai,
        TuNgay     = tu_ngay,
        DenNgay    = den_ngay
    ).first()

    # 4. Nếu chưa có thì tạo thêm
    if not existed:
        auto_report = BAOCAO(
            LoaiBaoCao = loai_con_lai,
            TuNgay     = tu_ngay,
            DenNgay    = den_ngay,
            MoTa       = f"Tự động tạo từ báo cáo {loai.lower()}",
            NguoiTao   = nguoi_tao
        )
        db.session.add(auto_report)

    # 5. Lưu cả hai (hoặc một)
    db.session.commit()

    return jsonify({
        "status": "success",
        "data": {
            "MaBC":       report.MaBC,
            "LoaiBaoCao": report.LoaiBaoCao,
            "TuNgay":     report.TuNgay.isoformat(),
            "DenNgay":    report.DenNgay.isoformat(),
            "MoTa":       report.MoTa,
            "TaoNgay":    report.TaoNgay.isoformat()
        }
    }), 201


# Cập nhật báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['PUT'])
@jwt_required()
@permission_required("reports:edit")
def update_baocao(id):
    try:
        data = request.get_json()
        bc = BAOCAO.query.get_or_404(id)

        # Lấy giá trị mới, nếu không có thì giữ nguyên
        bc.LoaiBaoCao = data.get('LoaiBaoCao', bc.LoaiBaoCao)

        # parse TuNgay và DenNgay từ client gửi lên
        if data.get('TuNgay'):
            bc.TuNgay = datetime.strptime(data['TuNgay'], '%Y-%m-%d').date()
        if data.get('DenNgay'):
            bc.DenNgay = datetime.strptime(data['DenNgay'], '%Y-%m-%d').date()

        bc.MoTa = data.get('MoTa', bc.MoTa)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Cập nhật báo cáo thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
    

# Xóa báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['DELETE'])
@jwt_required()
@permission_required("reports:delete")
def delete_baocao(id):
    bc = BAOCAO.query.get_or_404(id)
    db.session.delete(bc)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa báo cáo thành công'})

# Lấy danh sách tất cả báo cáo
@baocao_bp.route('/baocao', methods=['GET'])
@jwt_required()
@permission_required("reports:view")
def list_baocao():
    reports = BAOCAO.query.order_by(BAOCAO.TuNgay.desc()).all()
    result = []

    for r in reports:
        du_lieu = {}

        # Tổng doanh thu từ đơn hàng (chỉ lấy đơn đã hoàn thành)
        tong_don_hang = db.session.query(
            func.coalesce(func.sum(DONHANG.TongTien), 0)
        ).filter(
            DONHANG.NgayDat >= r.TuNgay,
            DONHANG.NgayDat <= r.DenNgay,
            DONHANG.TrangThai == "Completed"
        ).scalar() or 0

        # Tổng doanh thu từ dịch vụ đã giao
        tong_dich_vu = db.session.query(
            func.coalesce(func.sum(CHITIETPHIEUDICHVU.ThanhTien), 0)
        ).join(PHIEUDICHVU).filter(
            PHIEUDICHVU.NgayLap >= r.TuNgay,
            PHIEUDICHVU.NgayLap <= r.DenNgay,
            CHITIETPHIEUDICHVU.TinhTrang == "Đã giao"
        ).scalar() or 0

        # Tổng doanh thu = đơn hàng + dịch vụ
        total_doanh_thu = tong_don_hang + tong_dich_vu

        # Tổng tiền nhập từ phiếu nhập (chi phí đầu vào)
        tong_tien_nhap = db.session.query(
            func.coalesce(
                func.sum(CHITIETPHIEUNHAP.SoLuong * CHITIETPHIEUNHAP.DonGiaNhap), 0
            )
        ).join(PHIEUNHAP).filter(
            PHIEUNHAP.NgayNhap >= r.TuNgay,
            PHIEUNHAP.NgayNhap <= r.DenNgay
        ).scalar() or 0

        # Lợi nhuận = doanh thu - chi phí nhập hàng
        loi_nhuan = tong_don_hang - tong_tien_nhap

        # Tùy loại báo cáo mà gán dữ liệu
        if r.LoaiBaoCao == "Doanh thu":
            du_lieu = {
                "DoanhThu": total_doanh_thu
            }
        elif r.LoaiBaoCao == "Lợi nhuận":
            du_lieu = {
                "LoiNhuan": loi_nhuan
            }

        result.append({
            "MaBC":       r.MaBC,
            "LoaiBaoCao": r.LoaiBaoCao,
            "TuNgay":     r.TuNgay.strftime("%Y-%m-%d"),
            "DenNgay":    r.DenNgay.strftime("%Y-%m-%d"),
            "DuLieu":     du_lieu,
            "MoTa":       r.MoTa or "",
            "TaoNgay":    r.TaoNgay.strftime("%Y-%m-%d %H:%M:%S"),
            "NguoiTao":   r.NguoiTao
        })

    return jsonify({"status": "success", "data": result})



# Báo cáo tồn kho
@baocao_bp.route('/baocao/tonkho', methods=['GET'])
@jwt_required()
@permission_required("reports:add")
def baocao_ton_kho():
    reports = BAOCAO.query.filter(BAOCAO.LoaiBaoCao == 'Tồn kho').all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})

# Xem/print báo cáo ra PDF
@baocao_bp.route("/baocao/<int:id>/print", methods=["GET"])
@jwt_required()
@permission_required("reports:view")
def print_bao_cao(id):
    bc = BAOCAO.query.get_or_404(id)
    tu_ngay = bc.TuNgay
    den_ngay = bc.DenNgay

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='NormalTimes', fontName='TimesVN', fontSize=10))
    styles.add(ParagraphStyle(name='TitleTimes', fontName='TimesVN', fontSize=16, alignment=1))
    elements = []

    # ===== TIÊU ĐỀ =====
    elements.append(Paragraph(f"BÁO CÁO {bc.LoaiBaoCao.upper()}", styles['TitleTimes']))

    # ===== THỜI GIAN =====
    if tu_ngay.day == 1 and den_ngay.day == monthrange(den_ngay.year, den_ngay.month)[1] and tu_ngay.month == den_ngay.month:
        elements.append(Paragraph(f"Tháng: {tu_ngay.month}/{tu_ngay.year}", styles['NormalTimes']))
    elif tu_ngay.month == 1 and den_ngay.month == 12 and tu_ngay.day == 1 and den_ngay.day == 31:
        elements.append(Paragraph(f"Năm: {tu_ngay.year}", styles['NormalTimes']))
    else:
        elements.append(Paragraph(
            f"Từ ngày: {tu_ngay.strftime('%d/%m/%Y')} - Đến ngày: {den_ngay.strftime('%d/%m/%Y')}",
            styles['NormalTimes']
        ))

    elements.append(Spacer(1, 12))

    # === BÁO CÁO DOANH THU ===
    if bc.LoaiBaoCao == "Doanh thu":
        # Chỉ lấy đơn hoàn thành để tính doanh thu
        orders = db.session.query(
            DONHANG.MaDH, DONHANG.NgayDat, NGUOIDUNG.HoTen, DONHANG.TongTien
        ).join(NGUOIDUNG, DONHANG.UserID == NGUOIDUNG.UserID) \
         .filter(
            DONHANG.NgayDat >= tu_ngay,
            DONHANG.NgayDat <= den_ngay,
            DONHANG.TrangThai == "Completed"
        ).order_by(DONHANG.NgayDat).all()

        # Tránh lặp MaDH nếu có lỗi dữ liệu
        seen_madh = set()
        data = [[Paragraph(cell, styles["NormalTimes"]) for cell in ["STT", "Mã đơn hàng", "Ngày đặt", "Khách hàng", "Tổng tiền", "Đơn vị tính"]]]
        total = 0
        stt = 1

        for o in orders:
            if o.MaDH in seen_madh:
                continue  # bỏ trùng
            seen_madh.add(o.MaDH)

            total += o.TongTien

            row = [
                Paragraph(str(stt), styles["NormalTimes"]),
                Paragraph(str(o.MaDH), styles["NormalTimes"]),
                Paragraph(o.NgayDat.strftime("%d/%m/%Y"), styles["NormalTimes"]),
                Paragraph(o.HoTen, styles["NormalTimes"]),
                Paragraph(f"{o.TongTien:,.0f}", styles["NormalTimes"]),
                Paragraph("VNĐ", styles["NormalTimes"])
            ]
            data.append(row)
            stt += 1

        table = Table(data, colWidths=[30, 80, 80, 150, 80, 50])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 12))
        elements.append(
            Paragraph(f"<b>Tổng doanh thu: {total:,.0f} VNĐ</b>", styles["NormalTimes"])
        )
        # --- PHẦN BÁO CÁO DỊCH VỤ ---
        dich_vu_list = db.session.query(
            PHIEUDICHVU.MaPDV,
            PHIEUDICHVU.NgayLap,
            NGUOIDUNG.HoTen,
            func.sum(CHITIETPHIEUDICHVU.ThanhTien).label("TongTien")
        ).join(NGUOIDUNG, PHIEUDICHVU.UserID == NGUOIDUNG.UserID) \
        .join(CHITIETPHIEUDICHVU, PHIEUDICHVU.MaPDV == CHITIETPHIEUDICHVU.MaPDV) \
        .filter(
            PHIEUDICHVU.NgayLap >= tu_ngay,
            PHIEUDICHVU.NgayLap <= den_ngay,
            CHITIETPHIEUDICHVU.TinhTrang == "Đã giao"
        ).group_by(PHIEUDICHVU.MaPDV, PHIEUDICHVU.NgayLap, NGUOIDUNG.HoTen) \
        .order_by(PHIEUDICHVU.NgayLap).all()

        if dich_vu_list:
            elements.append(Spacer(1, 24))
            elements.append(Paragraph("DOANH THU DỊCH VỤ", styles["TitleTimes"]))
            elements.append(Spacer(1, 24))
            headers = ["STT", "Mã phiếu DV", "Ngày đặt", "Khách hàng", "Tổng tiền", "Đơn vị tính"]
            data = [[Paragraph(cell, styles["NormalTimes"]) for cell in headers]]

            total_dv = 0
            for idx, dv in enumerate(dich_vu_list, 1):
                total_dv += dv.TongTien
                data.append([
                    Paragraph(str(idx), styles["NormalTimes"]),
                    Paragraph(str(dv.MaPDV), styles["NormalTimes"]),
                    Paragraph(dv.NgayLap.strftime("%d/%m/%Y"), styles["NormalTimes"]),
                    Paragraph(dv.HoTen, styles["NormalTimes"]),
                    Paragraph(f"{dv.TongTien:,.0f}", styles["NormalTimes"]),
                    Paragraph("VNĐ", styles["NormalTimes"]),
                ])

            table = Table(data, colWidths=[30, 80, 80, 150, 80, 50])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
            ]))

            elements.append(table)
            elements.append(Spacer(1, 12))
            elements.append(
                Paragraph(f"<b>Tổng doanh thu dịch vụ: {total_dv:,.0f} VNĐ</b>", styles["NormalTimes"])
            )
    # === LỢI NHUẬN ===
    elif bc.LoaiBaoCao == "Lợi nhuận":
        # Lọc phiếu nhập trong khoảng thời gian
        phieu_nhaps = db.session.query(
            PHIEUNHAP.MaPN,
            PHIEUNHAP.NgayNhap,
            NGUOIDUNG.HoTen.label("TenNguoiLap"),
            NHACUNGCAP.TenNCC,
            func.sum(CHITIETPHIEUNHAP.SoLuong * CHITIETPHIEUNHAP.DonGiaNhap).label("TongTienNhap")
        ).join(NHACUNGCAP, PHIEUNHAP.MaNCC == NHACUNGCAP.MaNCC) \
        .join(CHITIETPHIEUNHAP, PHIEUNHAP.MaPN == CHITIETPHIEUNHAP.MaPN) \
        .join(NGUOIDUNG, PHIEUNHAP.UserID == NGUOIDUNG.UserID) \
        .filter(PHIEUNHAP.NgayNhap >= tu_ngay, PHIEUNHAP.NgayNhap <= den_ngay) \
        .group_by(PHIEUNHAP.MaPN, PHIEUNHAP.NgayNhap, NGUOIDUNG.HoTen, NHACUNGCAP.TenNCC) \
        .order_by(PHIEUNHAP.NgayNhap).all()

        # Tổng doanh thu từ các đơn hàng đã hoàn thành
        total_doanh_thu = db.session.query(
            func.coalesce(func.sum(DONHANG.TongTien), 0)
        ).filter(
            DONHANG.NgayDat >= tu_ngay,
            DONHANG.NgayDat <= den_ngay,
            DONHANG.TrangThai == "Completed"
        ).scalar() or 0

        # Tính tổng tiền nhập
        tong_tien_nhap = sum(p.TongTienNhap for p in phieu_nhaps)

        # Lợi nhuận
        loi_nhuan = total_doanh_thu - tong_tien_nhap

        # === Xuất bảng ===
        headers = ["STT", "Tên nhà cung cấp", "Ngày nhập", "Người lập", "Tổng tiền nhập", "Đơn vị tính"]
        data = [[Paragraph(h, styles["NormalTimes"]) for h in headers]]

        for idx, p in enumerate(phieu_nhaps, start=1):
            data.append([
                Paragraph(str(idx), styles["NormalTimes"]),
                Paragraph(p.TenNCC, styles["NormalTimes"]),
                Paragraph(p.NgayNhap.strftime("%d/%m/%Y"), styles["NormalTimes"]),
                Paragraph(p.TenNguoiLap, styles["NormalTimes"]),
                Paragraph(f"{p.TongTienNhap:,.0f}", styles["NormalTimes"]),
                Paragraph("VNĐ", styles["NormalTimes"]),
            ])

        table = Table(data, colWidths=[30, 120, 80, 100, 100, 50])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(
            f"<b>Tổng lợi nhuận: {loi_nhuan:,.0f} VNĐ</b>", styles["NormalTimes"]
        ))
    else:
        elements.append(Paragraph("Loại báo cáo không được hỗ trợ để in.", styles['NormalTimes']))

    doc.build(elements)
    buffer.seek(0)
    response = send_file(
        buffer,
        as_attachment=True,
        download_name=f"BaoCao_{bc.LoaiBaoCao}_{tu_ngay.strftime('%m_%Y')}.pdf",
        mimetype="application/pdf"
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response