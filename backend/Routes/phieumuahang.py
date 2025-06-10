from flask import Blueprint, request, jsonify
from database import db
from models import ChiTietDonHang, DonHang
from datetime import datetime

phieumuahang_bp = Blueprint('phieumuahang_bp', __name__)

# Tạo phiếu mua hàng
@phieumuahang_bp.route('/phieumuahang', methods=['POST'])
def create_phieu_mua_hang():
    data = request.get_json()
    try:
        # Tạo đơn hàng trước
        dh = DonHang(
            MaKH=data['MaKH'],
            NgayDat=datetime.now(),
            TongTien=0,
            TrangThai=data.get('TrangThai', 'Đang xử lý')
        )
        db.session.add(dh)
        db.session.flush()
        # Tạo chi tiết đơn hàng và tính tổng tiền
        total = 0
        for item in data.get('ChiTiet', []):
            ct = ChiTietDonHang(
                MaDH=dh.MaDH,
                MaSP=item['MaSP'],
                SoLuong=item['SoLuong'],
                GiaBan=item['GiaBan'],
                ThanhTien=item['SoLuong'] * item['GiaBan']
            )
            total += ct.ThanhTien
            db.session.add(ct)
        dh.TongTien = total
        db.session.commit()
        return jsonify({'status':'success','MaDH': dh.MaDH}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status':'error','message': str(e)}), 400

# Lấy danh sách phiếu mua hàng
@phieumuahang_bp.route('/phieumuahang', methods=['GET'])
def list_phieu_mua_hang():
    orders = DonHang.query.all()
    data = [o.to_dict() for o in orders]
    return jsonify({'status':'success','data': data})

# Xem chi tiết phiếu mua hàng
@phieumuahang_bp.route('/phieumuahang/<int:id>', methods=['GET'])
def detail_phieu_mua_hang(id):
    o = DonHang.query.get_or_404(id)
    items = ChiTietDonHang.query.filter_by(MaDH=id).all()
    result = o.to_dict()
    result['ChiTiet'] = [i.to_dict() for i in items]
    return jsonify({'status':'success','data': result})

