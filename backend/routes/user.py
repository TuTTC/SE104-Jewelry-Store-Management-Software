from flask import Blueprint, jsonify, request
from models.NguoiDung import NGUOIDUNG
from models.KhachHang import KHACHHANG
from models.NguoiQuanLy import NGUOIQUANLY
from models.Permissions import PERMISSIONS
from models.VaiTro import VAITRO
from database import db
from werkzeug.security import generate_password_hash
from utils.permissions_utils import get_user_permissions

user_bp = Blueprint('user', __name__)

# 1. Lấy thông tin cá nhân
@user_bp.route('/me', methods=['GET'])
def get_me():
    user = NGUOIDUNG.query.first()
    if not user:
        return jsonify({'message': 'Không có người dùng nào'}), 404

    result = {
        'UserID': user.UserID,
        'TenDangNhap': user.TenDangNhap,
        'Email': user.Email,
        'VaiTro': user.vaitro.TenVaiTro if user.vaitro else None,
        'TaoNgay': user.TaoNgay
    }
    return jsonify(result), 200


# 2. Cập nhật thông tin cá nhân
@user_bp.route('/me', methods=['PUT'])
def update_me():
    user = NGUOIDUNG.query.first()
    if not user:
        return jsonify({'message': 'Không có người dùng nào'}), 404

    data = request.get_json()
    if 'Email' in data:
        user.Email = data['Email']
    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']
    db.session.commit()
    return jsonify({'message': 'Cập nhật thành công'}), 200


# 3. Lấy danh sách tài khoản
@user_bp.route('/users', methods=['GET'])
def get_all_users():
    users = NGUOIDUNG.query.all()
    result = []
    for user in users:
        item = {
            'UserID': user.UserID,
            'TenDangNhap': user.TenDangNhap,
            'Email': user.Email,
            'VaiTro': user.vaitro.TenVaiTro if user.vaitro else None,
            'TaoNgay': user.TaoNgay
        }
        result.append(item)
    return jsonify(result), 200


# 4. Lấy thông tin chi tiết theo ID (kèm quyền)
@user_bp.route('/users/<int:user_id>/details', methods=['GET'])
def get_user_details(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    all_permissions = PERMISSIONS.query.all()
    all_permissions_list = [
        {"PermissionID": p.PermissionID, "TenQuyen": p.TenQuyen, "MoTa": p.MoTa} for p in all_permissions
    ]
    quyen_thuc_te = get_user_permissions(user)
    quyen_rieng_ids = [p.PermissionID for p in user.permissions]

    result = {
        "UserID": user.UserID,
        "TenDangNhap": user.TenDangNhap,
        "Email": user.Email,
        "VaiTro": user.vaitro.TenVaiTro if user.vaitro else None,
        "TatCaQuyen": all_permissions_list,
        "QuyenThucTe": list(quyen_thuc_te),
        "QuyenRiengIDs": quyen_rieng_ids
    }
    return jsonify(result), 200


# 5. Cập nhật tài khoản
@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user_by_id(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()
    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']
    if 'Email' in data:
        user.Email = data['Email']
    if 'MatKhau' in data:
        user.MatKhau = generate_password_hash(data['MatKhau'])
    db.session.commit()
    return jsonify({'message': 'Cập nhật tài khoản thành công'}), 200


# 6. Xóa tài khoản
@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Đã xóa tài khoản thành công'}), 200


# 7. Đổi vai trò người dùng
@user_bp.route('/users/<int:user_id>/role', methods=['PUT'])
def change_user_role(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()
    vai_tro_id = data.get('VaiTroID')
    vai_tro = VAITRO.query.get(vai_tro_id)
    if not vai_tro:
        return jsonify({'message': 'Vai trò không hợp lệ'}), 400
    user.VaiTroID = vai_tro_id
    db.session.commit()
    return jsonify({'message': f'Đã đổi vai trò thành {vai_tro.TenVaiTro}'}), 200


# 8. Cập nhật quyền riêng người dùng
@user_bp.route('/users/<int:user_id>/permissions', methods=['PUT'])
def update_user_permissions(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()
    permission_ids = data.get('permissions', [])
    new_permissions = PERMISSIONS.query.filter(PERMISSIONS.PermissionID.in_(permission_ids)).all()
    user.permissions = new_permissions
    db.session.commit()
    return jsonify({'message': 'Cập nhật quyền riêng thành công'}), 200
