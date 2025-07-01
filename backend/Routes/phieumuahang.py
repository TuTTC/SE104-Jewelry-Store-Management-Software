from flask import Blueprint, request, jsonify
from database import db
from models import ChiTietDonHang, DonHang
from datetime import datetime

phieumuahang_bp = Blueprint('phieumuahang_bp', __name__)

# ---------------------- PUBLIC API ----------------------

# Tạo phiếu mua hàng (form người dùng)
@phieumuahang_bp.route('/phieumuahang', methods=['POST'])
def create_phieu_mua_hang():
    data = request.get_json()
    result = create_phieu_mua_hang_auto(data)
    if result['status'] == 'success':
        return jsonify(result), 201
    else:
        return jsonify(result), 400

# Lấy danh sách phiếu mua hàng
@phieumuahang_bp.route('/phieumuahang', methods=['GET'])
def list_phieu_mua_hang():
    orders = DonHang.query.all()
    data = [o.to_dict() for o in orders]
    return jsonify({'status': 'success', 'data': data})

# Xem chi tiết phiếu mua hàng
@phieumuahang_bp.route('/phieumuahang/<int:id>', methods=['GET'])
def detail_phieu_mua_hang(id):
    o = DonHang.query.get_or_404(id)
    items = ChiTietDonHang.query.filter_by(MaDH=id).all()
    result = o.to_dict()
    result['ChiTiet'] = [i.to_dict() for i in items]
    return jsonify({'status': 'success', 'data': result})


# ---------------------- HÀM HỖ TRỢ (NỘI BỘ) ----------------------

# Hàm dùng nội bộ để tạo đơn hàng + chi tiết đơn hàng
def create_phieu_mua_hang_auto(data):
    try:
        ma_kh = data['MaKH']
        trang_thai = data.get('TrangThai', 'Đang xử lý')
        chi_tiet = data.get('ChiTiet', [])

        dh = DonHang(
            MaKH=ma_kh,
            NgayDat=datetime.now(),
            TongTien=0,
            TrangThai=trang_thai
        )
        db.session.add(dh)
        db.session.flush()  # để lấy MaDH

        tong_tien = 0
        for item in chi_tiet:
            thanh_tien = item['SoLuong'] * item['GiaBan']
            ct = ChiTietDonHang(
                MaDH=dh.MaDH,
                MaSP=item['MaSP'],
                SoLuong=item['SoLuong'],
                GiaBan=item['GiaBan'],
                ThanhTien=thanh_tien
            )
            db.session.add(ct)
            tong_tien += thanh_tien

        dh.TongTien = tong_tien
        db.session.commit()
        return {'status': 'success', 'MaDH': dh.MaDH}
    except Exception as e:
        db.session.rollback()
        return {'status': 'error', 'message': str(e)}
