from flask import Blueprint, request, jsonify
from database import db
from models import PHIEUDICHVU, CHITIETPHIEUDICHVU, THAMSO, DICHVU
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from datetime import datetime
from models.KhachHang import KHACHHANG
from flask import send_file
from reportlab.lib.pagesizes import A4,landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
from datetime import datetime
pdfmetrics.registerFont(TTFont('DejaVu', '../fonts/times.ttf'))
from reportlab.platypus import Table, TableStyle, SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.styles import ParagraphStyle
# from decorators import permission_required
from flask_jwt_extended import jwt_required, get_jwt_identity
# from permissions import permission_required 
from flask import g

phieudichvu_bp = Blueprint('phieudichvu_bp', __name__)

# Đăng ký font

def lay_tham_so(ten):
    ts = THAMSO.query.filter_by(TenThamSo=ten, KichHoat=True).first()
    if not ts:
        raise ValueError(f"Tham số '{ten}' không tồn tại hoặc chưa kích hoạt.")
    return float(ts.GiaTri)

def tinh_toan_lai_phieu(phieu):
    chi_tiet_list = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=phieu.MaPDV).all()

    tong_tien = 0
    tong_tra_truoc = 0

    for ct in chi_tiet_list:
        tong_tien += ct.ThanhTien
        tong_tra_truoc += ct.TienTraTruoc

    phieu.TongTien = tong_tien
    phieu.TraTruoc = tong_tra_truoc
    phieu.TienConLai = tong_tien - tong_tra_truoc

    db.session.commit()  # Lưu thay đổi vào DB nếu muốn dữ liệu lưu lại


def cap_nhat_trang_thai_phieu(ma_pdv):
    """Tự động cập nhật trạng thái phiếu dịch vụ dựa vào tình trạng các chi tiết."""
    chi_tiet_list = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=ma_pdv).all()

    if not chi_tiet_list:
        return  # Không có chi tiết, không xử lý

    tat_ca_da_giao = all(ct.TinhTrang == "Đã giao" for ct in chi_tiet_list)

    phieu = PHIEUDICHVU.query.get(ma_pdv)
    if not phieu:
        return

    phieu.TrangThai = "Hoàn thành" if tat_ca_da_giao else "Chưa hoàn thành"
    db.session.commit()


@phieudichvu_bp.route('/phieudichvu', methods=['POST'])
@jwt_required()
@permission_required('serviceticket:add')
def create_phieu_dich_vu():
    data = request.get_json()
    try:
        user_id    = data['UserID']
        ghi_chu    = data.get('GhiChu', '')
        trang_thai = data.get('TrangThai', 'Chờ xử lý')
        chi_tiet   = data.get('ChiTiet', [])

        # Kiểm tra khách hàng tồn tại và đúng vai trò
        khach_hang = NGUOIDUNG.query.get(user_id)
        vai_tro_khach = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not khach_hang:
            return jsonify({'status': 'error', 'message': 'User không tồn tại.'}), 400

        if not vai_tro_khach or khach_hang.MaVaiTro != vai_tro_khach.MaVaiTro:
            return jsonify({'status': 'error', 'message': 'User không hợp lệ hoặc không phải khách hàng.'}), 400

        if not khach_hang.TrangThai:
            return jsonify({'status': 'error', 'message': 'Tài khoản khách hàng đang bị khóa.'}), 400


        if not chi_tiet and data.get('MaDV'):
            chi_tiet = [{
                'MaDV': int(data['MaDV']),
                'SoLuong': 1,
                'TienTraTruoc': data.get('TraTruoc', 0),
                'TinhTrang': 'Chưa giao'
            }]
        
        tong_tien = 0
        chi_tiet_objs = []

        # Xử lý từng dòng chi tiết
        for item in chi_tiet:
            dv = DICHVU.query.get(item['MaDV'])
            if not dv or not dv.TrangThai:
                raise ValueError(f"Dịch vụ mã {item['MaDV']} không tồn tại hoặc đang bị khóa.")

            chi_phi_rieng = float(item.get('ChiPhiRieng', 0))
            don_gia_duoc_tinh = float(dv.DonGia) + chi_phi_rieng
            so_luong   = int(item['SoLuong'])
            thanh_tien = don_gia_duoc_tinh * so_luong
            tien_tra_truoc = float(item.get('TienTraTruoc', 0))
            tinh_trang = item.get('TinhTrang', 'Chưa giao')

            # Kiểm tra trả trước ≥ tỷ lệ quy định
            ti_le_tra_truoc = lay_tham_so("Tỉ lệ trả trước") / 100.0
            if tien_tra_truoc < ti_le_tra_truoc * thanh_tien:
                ty_le = int(ti_le_tra_truoc * 100)
                raise ValueError(
                    f"Tiền trả trước của dịch vụ {dv.TenDV} phải ≥ {ty_le}% thành tiền ({tien_tra_truoc}₫/{thanh_tien}₫)."
                )

            ct = CHITIETPHIEUDICHVU(
                MaDV            = dv.MaDV,
                DonGiaDichVu    = float(dv.DonGia),
                ChiPhiRieng     = chi_phi_rieng,
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

        # Tạo phiếu dịch vụ
        phieu = PHIEUDICHVU(
            UserID    = user_id,
            NgayLap   = datetime.now(),
            TongTien  = tong_tien,
            TraTruoc  = sum(ct.TienTraTruoc for ct in chi_tiet_objs),
            GhiChu    = ghi_chu,
            TrangThai = trang_thai
        )
        db.session.add(phieu)
        db.session.flush()  # để lấy MaPDV

        # Gán MaPDV cho từng chi tiết
        for ct in chi_tiet_objs:
            ct.MaPDV = phieu.MaPDV
            db.session.add(ct)

        db.session.commit()

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
@jwt_required()
@permission_required('serviceticket:delete')
def delete_phieu_dichvu(id):
    try:
        db.session.query(CHITIETPHIEUDICHVU).filter_by(MaPDV=id).delete()
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
@jwt_required()
@permission_required("serviceticket:view", "serviceticket:view_own")
def list_phieu_dichvu():
    try:
        current_user = g.current_user
        permissions = g.permissions

        # Nếu có quyền xem tất cả phiếu
        if "serviceticket:view" in permissions:
            phieus = PHIEUDICHVU.query.all()
        else:
            # Nếu chỉ có quyền xem phiếu của chính mình
            phieus = PHIEUDICHVU.query.filter_by(UserID=current_user.UserID).all()
        result = []

        for p in phieus:
            tinh_toan_lai_phieu(p)
            cap_nhat_trang_thai_phieu(p.MaPDV)
            khach_hang = p.khachhang  # Quan hệ đã đặt tên là 'khachhang' trong model
            ten_kh = khach_hang.HoTen if khach_hang else "Không rõ"

            result.append({
                "MaPDV": p.MaPDV,  # Số phiếu
                "NgayLap": p.NgayLap.strftime("%Y-%m-%d %H:%M:%S"),
                "HoTen": ten_kh,  # Họ tên khách hàng
                "TongTien": float(p.TongTien),
                "TraTruoc": float(p.TraTruoc),
                "TienConLai": float(p.TongTien - p.TraTruoc),
                "TrangThai": p.TrangThai
            })

        return jsonify({"status": "success", "data": result})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# Xem chi tiết phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:id>', methods=['GET'])
def detail_phieu_dich_vu(id):
    # Hinh như có lỗi trong đoạn code này, không thể chạy được
    # Cần kiểm tra lại trước khi phân quyền
    p = PHIEUDICHVU.query.get_or_404(id)
    details = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).all()

    khach_hang = p.khachhang  # Quan hệ đã định nghĩa sẵn trong model
    ten_khach = khach_hang.HoTen if khach_hang else "Không rõ"

    phieu_data = {
        "MaPDV":      p.MaPDV,
        "UserID":     p.UserID,
        "HoTen":      ten_khach,
        "NgayLap":    p.NgayLap.strftime("%Y-%m-%d %H:%M:%S"),
        "TongTien":   float(p.TongTien),
        "TraTruoc":   float(p.TraTruoc),
        "GhiChu":     p.GhiChu or "",
        "TrangThai":  p.TrangThai,
        "ChiTiet": []
    }

    for d in details:
        phieu_data["ChiTiet"].append({
            "MaCT":            d.MaCT,
            "MaDV":            d.MaDV,
            "DonGiaDichVu":    float(d.DonGiaDichVu),
            "ChiPhiRieng":     float(d.ChiPhiRieng),
            "DonGiaDuocTinh":  float(d.DonGiaDuocTinh),
            "SoLuong":         d.SoLuong,
            "ThanhTien":       float(d.ThanhTien),
            "TienTraTruoc":    float(d.TienTraTruoc),
            "TienConLai":      float(d.TienConLai),
            "NgayGiao":        d.NgayGiao.strftime("%Y-%m-%d") if d.NgayGiao else None,
            "TinhTrang":       d.TinhTrang
        })

    return jsonify({"status": "success", "data": phieu_data})


# Cập nhật 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['PUT'])
@jwt_required()
@permission_required('serviceticket:edit')
def update_chi_tiet_dich_vu(id):
    ct = CHITIETPHIEUDICHVU.query.get_or_404(id)
    data = request.get_json()

    ct.DonGiaDichVu = data.get('DonGiaDichVu', ct.DonGiaDichVu)
    ct.ChiPhiRieng = data.get('ChiPhiRieng', ct.ChiPhiRieng)
    ct.DonGiaDuocTinh = ct.DonGiaDichVu + ct.ChiPhiRieng

    ct.SoLuong = data.get('SoLuong', ct.SoLuong)
    ct.TienTraTruoc = data.get('TienTraTruoc', ct.TienTraTruoc)
    ct.NgayGiao = data.get('NgayGiao', ct.NgayGiao)
    ct.TinhTrang = data.get('TinhTrang', ct.TinhTrang)

    ct.ThanhTien = ct.DonGiaDuocTinh * ct.SoLuong
    ct.TienConLai = ct.ThanhTien - ct.TienTraTruoc

    try:
        db.session.commit()
        # Cập nhật trạng thái phiếu nếu cần
        cap_nhat_trang_thai_phieu(ct.MaPDV)
        return jsonify({'status': 'success', 'message': 'Cập nhật chi tiết thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Xóa 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['DELETE'])
@jwt_required()
@permission_required('serviceticket:delete')
def delete_chi_tiet_dich_vu(id):
    ct = CHITIETPHIEUDICHVU.query.get_or_404(id)
    ma_pdv = ct.MaPDV
    db.session.delete(ct)
    db.session.commit()
    cap_nhat_trang_thai_phieu(ma_pdv)
    return jsonify({'status': 'success', 'message': 'Xóa chi tiết dịch vụ thành công'})

# (Tùy chọn) Xoá toàn bộ chi tiết của 1 phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:ma_pdv>/clear', methods=['DELETE'])
@jwt_required()
@permission_required('serviceticket:delete')
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
# @jwt_required()
# @permission_required('serviceticket:view')
def print_phieu_dich_vu(id):
    try:
        phieu = PHIEUDICHVU.query.get_or_404(id)
        chi_tiets = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).all()
        khach_hang = NGUOIDUNG.query.get(phieu.UserID)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=20, bottomMargin=20, leftMargin=20, rightMargin=20)
        elements = []

        # Tạo style cho văn bản với font Unicode
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='DejaVu', fontName='DejaVu', fontSize=11, leading=14))
        title_style = ParagraphStyle(name='DejaVuTitle', fontName='DejaVu', fontSize=16, alignment=1, spaceAfter=12)

        # Tiêu đề
        elements.append(Paragraph("<b>PHIẾU DỊCH VỤ</b>", title_style))

        # Thông tin chung
        info = f"""
        <b>Số phiếu:</b> {phieu.MaPDV}<br/>
         <b>Ngày lập:</b> {phieu.NgayLap}<br/>
        """
        # <b>Khách hàng:</b> {khach_hang.HoTen}<br/>
        # <b>Số điện thoại:</b> {khach_hang.SoDienThoai}<br/>
        # <b>Tổng tiền:</b> {phieu.TongTien:,}₫ &nbsp;&nbsp;&nbsp;
        # <b>Tổng tiền trả trước:</b> {phieu.TraTruoc:,}₫ &nbsp;&nbsp;&nbsp;
        # <b>Tổng tiền còn lại:</b> {phieu.TongTien - phieu.TraTruoc:,}₫<br/>
        elements.append(Paragraph(info, styles['DejaVu']))
        elements.append(Spacer(1, 12))

        # Dữ liệu bảng
        # data = [
        #     ['Khách hàng: ', '', '', '', '', 'Số điện thoại:', '', '', '', ''],
        #     ['Tổng tiền:', '', '', 'Tổng tiền trả trước:', '', 'Tổng tiền còn lại:', '', '', '', ''],
        #     ['Stt', 'Loại dịch vụ', 'Đơn giá dịch vụ', 'Đơn giá được tính', 'Số lượng',
        #      'Thành tiền', 'Thanh toán', '', 'Ngày giao', 'Tình trạng'],
        #     ['', '', '', '', '', '', 'Trả trước', 'Còn lại', '', '']
        # ]
        data = [
    [f"Khách hàng: {khach_hang.HoTen}", '', '', '', '', f"Số điện thoại: {khach_hang.SoDienThoai}", '', '', '', ''],
    [f"Tổng tiền: {phieu.TongTien:,}₫", '', '', f"Tổng tiền trả trước: {phieu.TraTruoc:,}₫", '', f"Tổng tiền còn lại: {phieu.TongTien - phieu.TraTruoc:,}₫", '', '', '', ''],
    ['Stt', 'Loại dịch vụ', 'Đơn giá dịch vụ', 'Đơn giá được tính', 'Số lượng',
     'Thành tiền', 'Thanh toán', '', 'Ngày giao', 'Tình trạng'],
    ['', '', '', '', '', '', 'Trả trước', 'Còn lại', '', '']
]

        for i, ct in enumerate(chi_tiets, 1):
            dv = DICHVU.query.get(ct.MaDV)
            data.append([
                str(i),
                dv.TenDV,
                f"{dv.DonGia:,}₫",
                f"{ct.DonGiaDuocTinh:,}₫",
                str(ct.SoLuong),
                f"{ct.ThanhTien:,}₫",
                f"{ct.TienTraTruoc:,}₫",
                f"{ct.TienConLai:,}₫",
                phieu.NgayLap.strftime('%Y-%m-%d'),
                ct.TinhTrang
            ])


        # Tạo bảng
        page_width = landscape(A4)[0] - doc.leftMargin - doc.rightMargin
        colWidths = [page_width * w for w in [0.05, 0.15, 0.1, 0.1, 0.08, 0.1, 0.08, 0.08, 0.13, 0.13]]
        # =[30, 80, 60, 60, 45, 60, 50, 50, 60, 55]
        table = Table(data, colWidths)
        table.setStyle(TableStyle([
            # Font toàn bảng
            ('FONTNAME', (0,0), (-1,-1), 'DejaVu'),

            # Gộp ô đầu
            ('SPAN', (0,0), (4,0)),  # Khách hàng
            ('SPAN', (5,0), (9,0)),  # Số điện thoại

            ('SPAN', (0,1), (2,1)),  # Tổng tiền
            ('SPAN', (3,1), (4,1)),  # Trả trước
            ('SPAN', (5,1), (9,1)),  # Còn lại

            ('SPAN', (6,2), (7,2)),  # Thanh toán
            ('SPAN', (6,3), (6,3)),
            ('SPAN', (7,3), (7,3)),

            # Gộp ô tiêu đề
            ('SPAN', (0,2), (0,3)),
            ('SPAN', (1,2), (1,3)),
            ('SPAN', (2,2), (2,3)),
            ('SPAN', (3,2), (3,3)),
            ('SPAN', (4,2), (4,3)),
            ('SPAN', (5,2), (5,3)),
            ('SPAN', (8,2), (8,3)),
            ('SPAN', (9,2), (9,3)),

            # Viền và căn giữa
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)
        return send_file(buffer, as_attachment=False, download_name=f"phieu_dich_vu_{phieu.MaPDV}.pdf", mimetype='application/pdf')

    except Exception as e:
        return f"<h1>Lỗi: {str(e)}</h1>", 500
    


@phieudichvu_bp.route('/phieudichvu/print-danhsach', methods=['GET'])
@jwt_required()
@permission_required('serviceticket:view')
def print_danh_sach_pdv():
    try:
        # Truy vấn tất cả phiếu dịch vụ
        danh_sach = PHIEUDICHVU.query.order_by(PHIEUDICHVU.NgayLap.desc()).all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=20, bottomMargin=20, leftMargin=20, rightMargin=20)
        elements = []
        styles = getSampleStyleSheet()
        style_normal = styles['Normal']
        style_normal.fontName = 'DejaVu'
        style_title = styles['Title']
        style_title.fontName = 'DejaVu'

        # Tiêu đề
        elements.append(Paragraph("DANH SÁCH PHIẾU DỊCH VỤ", style_title))
        elements.append(Spacer(1, 12))

        # Tiêu đề bảng
        data = [
            ['STT', 'Số phiếu', 'Ngày lập', 'Người lập', 'Tổng tiền', 'Trả trước', 'Còn lại', 'Trạng thái']
        ]

        # Nội dung bảng
        for i, pdv in enumerate(danh_sach, start=1):
            nd = NGUOIDUNG.query.get(pdv.UserID)
            data.append([
                str(i),
                str(pdv.MaPDV),
                pdv.NgayLap.strftime('%Y-%m-%d'),
                nd.HoTen if nd else 'Không rõ',
                f"{pdv.TongTien}₫",
                f"{pdv.TraTruoc}₫",
                f"{pdv.TongTien - pdv.TraTruoc}₫",
                pdv.trang_thai_thuc_te
            ])

        # Cấu hình bảng
        page_width = landscape(A4)[0] - doc.leftMargin - doc.rightMargin
        table = Table(data, colWidths=[30, 70, 80, 150, 80, 80, 80, 80])
        table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), 'DejaVu'),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('GRID', (0,0), (-1,-1), 0.5, colors.black),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name="danh_sach_phieu_dich_vu.pdf", mimetype='application/pdf')

    except Exception as e:
        return {"error": str(e)}, 500

    
@phieudichvu_bp.route("/phieudichvu/<int:id>", methods=["PUT"])
@jwt_required()
@permission_required('serviceticket:edit')
def update_phieu_dich_vu(id):
    try:
        phieu = PHIEUDICHVU.query.get_or_404(id)
        data = request.get_json()

        phieu.UserID = data.get("UserID")  # Giả sử MaKH là ID của khách hàng
        phieu.NgayLap = data.get("NgayLap")

        # phieu.NgayLap = datetime.strptime(data.get("NgayLap"), "%Y-%m-%d %H:%M")  # Chuyển về dạng datetime
        phieu.GhiChu = data.get("GhiChu", "")
        phieu.TrangThai = data.get("TrangThai")

        # Xử lý cập nhật Chi Tiết Phiếu:
        CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).delete()  # Xóa chi tiết cũ

        chi_tiet_list = data.get("ChiTiet", [])
        for item in chi_tiet_list:
            ct = CHITIETPHIEUDICHVU(
                MaPDV = id,
                MaDV = item.get("MaDV"),
                SoLuong = item.get("SoLuong"),
                ChiPhiRieng = item.get("ChiPhiRieng"),
                DonGiaDichVu = item.get("DonGia"),
                DonGiaDuocTinh = item.get("DonGia") + item.get("ChiPhiRieng"),
                ThanhTien = (item.get("DonGia") + item.get("ChiPhiRieng")) * item.get("SoLuong"),
                TienTraTruoc = item.get("TienTraTruoc"),
                TienConLai = (item.get("DonGia") + item.get("ChiPhiRieng")) * item.get("SoLuong") - item.get("TienTraTruoc"),
                NgayGiao = None,  # Tùy nếu bạn có truyền ngày giao thì xử lý thêm
                TinhTrang = item.get("TinhTrang"),
            )
            db.session.add(ct)
        # Sau vòng for cập nhật chi tiết
        db.session.flush()  # Đảm bảo chi tiết đã có trên session để tính toán

        # Truy vấn lại toàn bộ chi tiết sau khi thêm mới
        chi_tiet_moi = CHITIETPHIEUDICHVU.query.filter_by(MaPDV=id).all()

        tong_tien = sum(d.ThanhTien for d in chi_tiet_moi)
        tong_tra_truoc = sum(d.TienTraTruoc for d in chi_tiet_moi)
        tien_con_lai = tong_tien - tong_tra_truoc

        # Cập nhật ngược lại phiếu chính
        phieu.TongTien = tong_tien
        phieu.TraTruoc = tong_tra_truoc
        phieu.TienConLai = tien_con_lai

        db.session.commit()

        return jsonify({"status": "success", "message": "Cập nhật phiếu dịch vụ thành công."})

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
