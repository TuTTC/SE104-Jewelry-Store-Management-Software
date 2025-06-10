from datetime import datetime
from flask import Blueprint, request, jsonify
from database import db
from models import DonHang

donhang_bp = Blueprint('donhang_bp', __name__)

# Tiếp nhận đơn hàng
@donhang_bp.route('/donhang', methods=['POST'])
def create_don_hang():
    data = request.get_json()
    try:
        dh = DonHang(
            MaKH=data['MaKH'],
            NgayDat=data.get('NgayDat', datetime.now()),
            TongTien=data.get('TongTien', 0),
            TrangThai=data.get('TrangThai', 'Đang xử lý')
        )
        db.session.add(dh)
        db.session.commit()
        return jsonify({'status':'success','MaDH': dh.MaDH}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status':'error','message': str(e)}), 400

# Xác nhận thanh toán
@donhang_bp.route('/donhang/<int:id>/thanhtoan', methods=['POST'])
def confirm_payment(id):
    dh = DonHang.query.get_or_404(id)
    dh.TrangThai = 'Đã thanh toán'
    db.session.commit()
    return jsonify({'status':'success','message':'Đã thanh toán'})

# Đóng gói và giao hàng
@donhang_bp.route('/donhang/<int:id>/giaohang', methods=['POST'])
def ship_order(id):
    dh = DonHang.query.get_or_404(id)
    dh.TrangThai = 'Đang giao'
    db.session.commit()
    return jsonify({'status':'success','message':'Đơn hàng đã giao'})

# Cập nhật trạng thái đơn hàng
@donhang_bp.route('/donhang/<int:id>/trangthai', methods=['PUT'])
def update_order_status(id):
    dh = DonHang.query.get_or_404(id)
    data = request.get_json()
    dh.TrangThai = data.get('TrangThai', dh.TrangThai)
    db.session.commit()
    return jsonify({'status':'success','message':'Cập nhật trạng thái thành công'})

# Xử lý trả/đổi hàng
@donhang_bp.route('/donhang/<int:id>/doitra', methods=['POST'])
def return_or_exchange(id):
    # thực hiện logic trả/đổi (tạo yêu cầu riêng)
    return jsonify({'status':'success','message':'Yêu cầu trả/đổi đã ghi nhận'})

# Xem danh sách đơn hàng
@donhang_bp.route('/donhang', methods=['GET'])
def list_orders():
    orders = DonHang.query.all()
    data = [o.to_dict() for o in orders]
    return jsonify({'status':'success','data': data})

# Xóa đơn hàng
@donhang_bp.route('/donhang/<int:id>', methods=['DELETE'])
def delete_order(id):
    dh = DonHang.query.get_or_404(id)
    db.session.delete(dh)
    db.session.commit()
    return jsonify({'status':'success','message':'Xóa đơn hàng thành công'})
