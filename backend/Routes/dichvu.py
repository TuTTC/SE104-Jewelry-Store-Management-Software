from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
from reportlab.pdfgen import canvas
from models import DICHVU
from models.PhieuDichVu import PHIEUDICHVU
from models.ChiTietPhieuDichVu import CHITIETPHIEUDICHVU
from datetime import datetime
from database import db
from models.ThamSo import THAMSO

dichvu_bp = Blueprint('dichvu', __name__)

# Ánh xạ TenDV → TenThamSo
SURCHARGE_MAP = {
    "CanThuVang": "PhuThu_CanVang",
    "DanhBongVang": "PhuThu_DanhBong",
    "ChamKhacTheoYeuCau": "PhuThu_ChamKhac",
    "GiaCongNuTrang": ["PhuThu_MoRongNhan", "PhuThu_ThuNhoLac"],  # có thể chọn max %
    "ThayDaQuy": "PhuThu_GanDaKimCuong",
    "GiaCongNhan": ["PhuThu_MoRongNhan", "PhuThu_ThuNhoLac"],
    "GanDaKimCuong": "PhuThu_GanDaKimCuong",
    "ThuVang": "PhuThu_CanVang",
    "SuaNuTrang": ["PhuThu_MoRongNhan", "PhuThu_ThuNhoLac"],  # có thể chọn max %",
    "ThayMoiNuTrang": ["PhuThu_MoRongNhan", "PhuThu_ThuNhoLac"],
}

@dichvu_bp.route("/debug/dichvu")
def debug_dv():
    from models import DICHVU
    return jsonify([dv.TenDV for dv in DICHVU.query.all()])


# Thêm dịch vụ mới
@dichvu_bp.route('/dichvu', methods=['POST'])
def create_dichvu():
    data = request.get_json()
    try:
        new_dv = DICHVU(
            TenDV=data['TenDV'],
            DonGia=data['DonGia'],
            MoTa=data.get('MoTa'),
            TrangThai=data.get('TrangThai', True)
        )
        db.session.add(new_dv)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Thêm dịch vụ thành công'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Xóa dịch vụ theo ID
@dichvu_bp.route('/dichvu/<int:id>', methods=['DELETE'])
def delete_dichvu(id):
    dv = DICHVU.query.get(id)
    if not dv:
        return jsonify({'status': 'error', 'message': 'Dịch vụ không tồn tại'}), 404
    db.session.delete(dv)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa dịch vụ thành công'})

# Sửa thông tin dịch vụ
@dichvu_bp.route('/dichvu/<int:id>', methods=['PUT'])
def update_dichvu(id):
    data = request.get_json()
    dv = DICHVU.query.get(id)
    if not dv:
        return jsonify({'status': 'error', 'message': 'Dịch vụ không tồn tại'}), 404

    dv.TenDV = data.get('TenDV', dv.TenDV)
    dv.DonGia = data.get('DonGia', dv.DonGia)
    dv.MoTa = data.get('MoTa', dv.MoTa)
    dv.TrangThai = data.get('TrangThai', dv.TrangThai)

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Cập nhật dịch vụ thành công'})

# Tìm kiếm dịch vụ theo từ khóa
@dichvu_bp.route('/dichvu/search', methods=['GET'])
def search_dichvu():
    keyword = request.args.get('keyword', '')
    results = DICHVU.query.filter(DICHVU.TenDV.ilike(f'%{keyword}%')).all()
    data = [
        {
            'MaDV': dv.MaDV,
            'TenDV': dv.TenDV,
            'DonGia': float(dv.DonGia),
            'MoTa': dv.MoTa,
            'TrangThai': dv.TrangThai
        }
        for dv in results
    ]
    return jsonify({'status': 'success', 'data': data})

# Lấy danh sách tất cả dịch vụ
@dichvu_bp.route('/dichvu', methods=['GET'])
def get_all_dichvu():
    services = DICHVU.query.all()
    data = []

    for dv in services:
        ten = dv.TenDV
        mapping = SURCHARGE_MAP.get(ten)

        # Xác định % phụ thu
        percent = 0.0
        if isinstance(mapping, list):
            # với mảng, lấy max của các tham số đang kích hoạt
            values = []
            for key in mapping:
                ts = THAMSO.query.filter_by(TenThamSo=key).first()
                if ts:
                    try:
                        values.append(float(ts.GiaTri))
                    except ValueError:
                        pass
            percent = max(values) if values else 0.0
        else:
            ts = THAMSO.query.filter_by(TenThamSo=mapping).first()
            if ts:
                try:
                    percent = float(ts.GiaTri)
                except ValueError:
                    percent = 0.0

        base_price = float(dv.DonGia)
        price_with_surcharge = round(base_price * (1 + percent / 100), 2)

        data.append({
            "MaDV":        dv.MaDV,
            "TenDV":       dv.TenDV,
            "DonGia":      base_price,
            "PhuThu":      percent,               # % phụ thu
            "DonGiaThuc":  price_with_surcharge,  # giá sau phụ thu
            "MoTa":        dv.MoTa,
            "TrangThai":   dv.TrangThai
        })

    return jsonify({"status": "success", "data": data})

@dichvu_bp.route('/dichvu/pdf', methods=['GET'])
def export_dichvu_pdf():
    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, "Danh sach dich vu")

    p.setFont("Helvetica", 12)
    y = 770
    services = DICHVU.query.all()
    for i, dv in enumerate(services):
        p.drawString(100, y, f"{i+1}. {dv.TenDV} - {float(dv.DonGia):,.0f} VND")
        y -= 20
        if y < 50:
            p.showPage()
            y = 800

    p.showPage()
    p.save()
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=False,
        download_name="danh_sach_dich_vu.pdf",
        mimetype="application/pdf"
    )

