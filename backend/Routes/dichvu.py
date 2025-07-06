from flask import Blueprint, request, jsonify, send_file
from io import BytesIO
from reportlab.pdfgen import canvas
from models import DICHVU
from models.PhieuDichVu import PHIEUDICHVU
from models.ChiTietPhieuDichVu import CHITIETPHIEUDICHVU
from datetime import datetime
from database import db

dichvu_bp = Blueprint('dichvu', __name__)


# DEBUG: Lấy tên tất cả dịch vụ
@dichvu_bp.route("/debug/dichvu")
def debug_dv():
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
            TrangThai=str(data.get('TrangThai', True)).lower() == "true",
            IsDisable=False
        )
        db.session.add(new_dv)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Thêm dịch vụ thành công'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi thêm dịch vụ: {e}")
        return jsonify({'status': 'error', 'message': 'Đã xảy ra lỗi, vui lòng thử lại.'}), 400



# Xóa mềm dịch vụ
@dichvu_bp.route('/dichvu/<int:id>', methods=['DELETE'])
def delete_dichvu(id):
    dv = DICHVU.query.get(id)
    if not dv:
        return jsonify({'status': 'error', 'message': 'Dịch vụ không tồn tại'}), 404
    dv.IsDisable = True
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Ẩn dịch vụ thành công'})


# Cập nhật dịch vụ
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


# Tìm kiếm dịch vụ (lọc theo keyword và IsDisable=False)
@dichvu_bp.route('/dichvu/search', methods=['GET'])
def search_dichvu():
    keyword = request.args.get('keyword', '')
    results = DICHVU.query.filter(
        DICHVU.TenDV.ilike(f'%{keyword}%'),
        DICHVU.IsDisable == False
    ).all()
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


# Lấy tất cả dịch vụ còn hoạt động
@dichvu_bp.route('/dichvu', methods=['GET'])
def get_all_dichvu():
    services = DICHVU.query.filter_by(IsDisable=False).all()
    data = [
        {
            "MaDV": dv.MaDV,
            "TenDV": dv.TenDV,
            "DonGia": float(dv.DonGia),
            "MoTa": dv.MoTa,
            "TrangThai": dv.TrangThai
        }
        for dv in services
    ]
    return jsonify({"status": "success", "data": data})


# Xuất danh sách dịch vụ ra PDF
@dichvu_bp.route('/dichvu/pdf', methods=['GET'])
def export_dichvu_pdf():
    buffer = BytesIO()
    p = canvas.Canvas(buffer)

    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, "Danh sách dịch vụ")

    p.setFont("Helvetica", 12)
    y = 770
    services = DICHVU.query.filter_by(IsDisable=False).all()
    for i, dv in enumerate(services):
        don_gia = f"{float(dv.DonGia):,.0f} VND"
        mo_ta = dv.MoTa if dv.MoTa else ""
        trang_thai = "Hoạt động" if dv.TrangThai else "Ngừng"
        p.drawString(100, y, f"{i+1}. {dv.TenDV} | Đơn giá: {don_gia} | Mô tả: {mo_ta} | Trạng thái: {trang_thai}")
        y -= 20
        if y < 50:
            p.showPage()
            y = 800

    p.save()
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=False,
        download_name="danh_sach_dich_vu.pdf",
        mimetype="application/pdf"
    )

