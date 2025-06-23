from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.NguoiDung import NGUOIDUNG
from models.KhachHang import KHACHHANG
from models.NguoiQuanLy import NGUOIQUANLY
from database import db
from werkzeug.security import generate_password_hash

user_bp = Blueprint('user', __name__)

# Helper: kiểm tra quyền admin
def is_admin():
    identity = get_jwt_identity()
    return identity and identity.get('VaiTro') == 'admin'

# 1. Lấy thông tin cá nhân
@user_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_me():
    identity = get_jwt_identity()
    user = NGUOIDUNG.query.get(identity['UserID'])
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    result = {
        'UserID': user.UserID,
        'TenDangNhap': user.TenDangNhap,
        'Email': user.Email,
        'VaiTro': user.VaiTro,
        'TaoNgay': user.TaoNgay
    }

    if user.VaiTro == 'customer' and user.khachhang:
        kh = user.khachhang
        result.update({
            'HoTen': kh.HoTen,
            'SoDienThoai': kh.SoDienThoai,
            'DiaChi': kh.DiaChi,
            'NgayDangKy': kh.NgayDangKy
        })
    elif user.VaiTro == 'admin' and user.nguoi_quan_ly:
        ql = user.nguoi_quan_ly
        result.update({
            'HoTen': ql.HoTen,
            'SoDienThoai': ql.SoDienThoai,
            'DiaChi': ql.DiaChi
        })

    return jsonify(result), 200

# 2. Cập nhật thông tin cá nhân
@user_bp.route('/api/users/me', methods=['PUT'])
@jwt_required()
def update_me():
    identity = get_jwt_identity()
    user = NGUOIDUNG.query.get(identity['UserID'])
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    data = request.get_json()

    if 'Email' in data:
        user.Email = data['Email']
    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']

    if user.VaiTro == 'customer' and user.khachhang:
        kh = user.khachhang
        if 'HoTen' in data:
            kh.HoTen = data['HoTen']
        if 'SoDienThoai' in data:
            kh.SoDienThoai = data['SoDienThoai']
        if 'DiaChi' in data:
            kh.DiaChi = data['DiaChi']

    elif user.VaiTro == 'admin' and user.nguoi_quan_ly:
        ql = user.nguoi_quan_ly
        if 'HoTen' in data:
            ql.HoTen = data['HoTen']
        if 'SoDienThoai' in data:
            ql.SoDienThoai = data['SoDienThoai']
        if 'DiaChi' in data:
            ql.DiaChi = data['DiaChi']

    db.session.commit()
    return jsonify({'message': 'Cập nhật thành công'}), 200

# 3. Lấy danh sách tài khoản (Admin)
@user_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_all_users():
    if not is_admin():
        return jsonify({'message': 'Bạn không có quyền'}), 403

    users = NGUOIDUNG.query.all()
    result = []
    for user in users:
        item = {
            'UserID': user.UserID,
            'TenDangNhap': user.TenDangNhap,
            'Email': user.Email,
            'VaiTro': user.VaiTro,
            'TaoNgay': user.TaoNgay
        }
        result.append(item)

    return jsonify(result), 200

# 4. Lấy thông tin theo ID (Admin)
@user_bp.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    if not is_admin():
        return jsonify({'message': 'Bạn không có quyền'}), 403

    user = NGUOIDUNG.query.get(user_id)
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    result = {
        'UserID': user.UserID,
        'TenDangNhap': user.TenDangNhap,
        'Email': user.Email,
        'VaiTro': user.VaiTro,
        'TaoNgay': user.TaoNgay
    }

    return jsonify(result), 200

# 5. Cập nhật tài khoản bất kỳ (Admin)
@user_bp.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_by_id(user_id):
    if not is_admin():
        return jsonify({'message': 'Bạn không có quyền'}), 403

    user = NGUOIDUNG.query.get(user_id)
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    data = request.get_json()

    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']
    if 'Email' in data:
        user.Email = data['Email']
    if 'MatKhau' in data:
        user.MatKhau = generate_password_hash(data['MatKhau'])

    db.session.commit()
    return jsonify({'message': 'Cập nhật tài khoản thành công'}), 200

# 6. Xóa tài khoản (Admin)
@user_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if not is_admin():
        return jsonify({'message': 'Bạn không có quyền'}), 403

    user = NGUOIDUNG.query.get(user_id)
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Đã xóa tài khoản thành công'}), 200

# 7. Gán quyền vai trò (Admin)
@user_bp.route('/api/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def change_user_role(user_id):
    if not is_admin():
        return jsonify({'message': 'Bạn không có quyền'}), 403

    user = NGUOIDUNG.query.get(user_id)
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    data = request.get_json()
    new_role = data.get('VaiTro')

    if new_role not in ['admin', 'customer']:
        return jsonify({'message': 'Vai trò không hợp lệ'}), 400

    user.VaiTro = new_role
    db.session.commit()
    return jsonify({'message': f'Đã đổi vai trò thành {new_role}'}), 200
