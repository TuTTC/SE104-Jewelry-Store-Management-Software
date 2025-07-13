from flask import Blueprint, jsonify, request
from models.NguoiDung import NGUOIDUNG
from models.KhachHang import KHACHHANG
from models.NguoiQuanLy import NGUOIQUANLY
from models.Permissions import PERMISSIONS
from models.VaiTro import VAITRO
from database import db
from werkzeug.security import generate_password_hash
from utils.permissions_utils import get_user_permissions
from sqlalchemy.exc import IntegrityError
user_bp = Blueprint('user', __name__)
from flask_jwt_extended import jwt_required
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

# 1. Lấy thông tin cá nhân
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = NGUOIDUNG.query.get(user_id)

    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404

    result = {
        'UserID': user.UserID,
        'TenDangNhap': user.TenDangNhap,
        'Email': user.Email,
        'HoTen': user.HoTen,
        'SoDienThoai': user.SoDienThoai,
        'DiaChi': user.DiaChi,
        'VaiTro': user.vaitro.TenVaiTro if user.vaitro else None,
        'TaoNgay': user.TaoNgay,
    }
    return jsonify(result), 200



# 2. Cập nhật thông tin cá nhân
@user_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = NGUOIDUNG.query.get(user_id)

    if not user:
        return jsonify({'message': 'Không tìm thấy người dùng'}), 404

    data = request.get_json()

    if 'Email' in data:
        user.Email = data['Email']
    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']
    if 'HoTen' in data:
        user.HoTen = data['HoTen']
    if 'SoDienThoai' in data:
        user.SoDienThoai = data['SoDienThoai']
    if 'DiaChi' in data:
        user.DiaChi = data['DiaChi']
    # if 'TrangThai' in data:
    #     user.TrangThai = data['TrangThai']


    db.session.commit()
    return jsonify({'message': 'Cập nhật thành công'}), 200




# 3. Lấy danh sách tài khoản
@user_bp.route('/users', methods=['GET'])
@jwt_required()
@permission_required("accounts:view")
def get_all_users():
    users = NGUOIDUNG.query.all()
    result = []
    for user in users:
        item = {
            'UserID': user.UserID,
            'TenDangNhap': user.TenDangNhap,
            'Email': user.Email,
            'VaiTro': user.vaitro.TenVaiTro if user.vaitro else None,
            'HoTen': user.HoTen,
            'SoDienThoai': user.SoDienThoai,
            'DiaChi': user.DiaChi,
            'TaoNgay': user.TaoNgay.strftime("%Y-%m-%d %H:%M:%S") if user.TaoNgay else None,
            'TrangThai': "Kích hoạt" if user.TrangThai else "Khóa"
        }
        result.append(item)
    
    return jsonify(result), 200


# Lấy danh sách khách hàng đang hoạt động
@user_bp.route('/users/customers', methods=['GET'])
@jwt_required()
def get_active_customers():
    users = NGUOIDUNG.query.filter_by(TrangThai=True).join(VAITRO).filter(VAITRO.TenVaiTro == "Khách hàng").all()
    result = []
    for user in users:
        item = {
            'UserID': user.UserID,
            'TenDangNhap': user.TenDangNhap,
            'Email': user.Email,
            'VaiTro': user.vaitro.TenVaiTro if user.vaitro else None,
            'HoTen': user.HoTen,
            'SoDienThoai': user.SoDienThoai,
            'DiaChi': user.DiaChi,
            'TaoNgay': user.TaoNgay.strftime("%Y-%m-%d %H:%M:%S") if user.TaoNgay else None,
            'TrangThai': "Kích hoạt"
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
@jwt_required()
@permission_required("accounts:edit")
def update_user_by_id(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()

    if 'TenDangNhap' in data:
        user.TenDangNhap = data['TenDangNhap']
    if 'Email' in data:
        user.Email = data['Email']
    if 'MatKhau' in data and data['MatKhau']:
        user.MatKhau = generate_password_hash(data['MatKhau'])
    if 'HoTen' in data:
        user.HoTen = data['HoTen']
    if 'DiaChi' in data:
        user.DiaChi = data['DiaChi']
    if 'SoDienThoai' in data:
        user.SoDienThoai = data['SoDienThoai']
    if 'status' in data:
        if isinstance(data['status'], bool):
            user.TrangThai = data['status']
        elif str(data['status']).lower() == "true":
            user.TrangThai = True
        else:
            user.TrangThai = False

    # ✅ Cập nhật vai trò
    if 'role' in data:
        try:
            user.MaVaiTro = int(data['role'])
        except ValueError:
            return jsonify({'message': 'Vai trò không hợp lệ'}), 400

    db.session.commit()
    return jsonify({'message': 'Cập nhật tài khoản thành công'}), 200




# 6. Xóa tài khoản
@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@permission_required("accounts:delete")
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
@jwt_required()
@permission_required("accounts:edit")
def update_user_permissions(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()
    permission_ids = data.get('permissions', [])
    new_permissions = PERMISSIONS.query.filter(PERMISSIONS.PermissionID.in_(permission_ids)).all()
    user.permissions = new_permissions
    db.session.commit()
    return jsonify({'message': 'Cập nhật quyền riêng thành công'}), 200



# @user_bp.route('/add', methods=['POST'])
# def create_user():
#     data = request.get_json()

#     ten_dang_nhap = data.get('username')
#     email = data.get('email')
#     mat_khau = data.get('password')
#     ho_ten = data.get('fullName')
#     so_dien_thoai = data.get('phone')
#     dia_chi = data.get('address')
#     ma_vai_tro = data.get('role')  # role ở đây truyền MaVaiTro dạng số

#     # Kiểm tra thông tin bắt buộc
#     if not all([ten_dang_nhap, email, mat_khau, ho_ten, so_dien_thoai, ma_vai_tro]):
#         return jsonify({'message': 'Vui lòng cung cấp đầy đủ thông tin'}), 400

#     # Kiểm tra email hợp lệ
#     if '@' not in email:
#         return jsonify({'message': 'Email không hợp lệ'}), 400

#     # Kiểm tra tài khoản đã tồn tại chưa
#     if NGUOIDUNG.query.filter((NGUOIDUNG.TenDangNhap == ten_dang_nhap) | (NGUOIDUNG.Email == email)).first():
#         return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

#     # Tạo tài khoản mới
#     hashed_password = generate_password_hash(mat_khau)
#     new_user = NGUOIDUNG(
#         TenDangNhap=ten_dang_nhap,
#         Email=email,
#         MatKhau=hashed_password,
#         HoTen=ho_ten,
#         SoDienThoai=so_dien_thoai,
#         DiaChi=dia_chi,
#         MaVaiTro=ma_vai_tro
#     )

#     try:
#         db.session.add(new_user)
#         db.session.commit()
#         return jsonify({'message': 'Tạo tài khoản thành công'}), 201
#     except IntegrityError:
#         db.session.rollback()
#         return jsonify({'message': 'Lỗi hệ thống, vui lòng thử lại'}), 500
@user_bp.route('/add', methods=['POST'])
def create_user():
    data = request.get_json()

    ten_dang_nhap = data.get('username')
    email = data.get('email')
    mat_khau = data.get('password')
    ho_ten = data.get('fullName')
    so_dien_thoai = data.get('phone')
    dia_chi = data.get('address')
    ma_vai_tro = data.get('role')  # Vai trò dạng số (1, 2, 3)
    trang_thai = data.get('status', True)  # ✅ Mặc định là True nếu không gửi lên

    # Kiểm tra thông tin bắt buộc
    if not all([ten_dang_nhap, email, mat_khau, ho_ten, so_dien_thoai, ma_vai_tro]):
        return jsonify({'message': 'Vui lòng cung cấp đầy đủ thông tin'}), 400

    # Kiểm tra email hợp lệ
    if '@' not in email:
        return jsonify({'message': 'Email không hợp lệ'}), 400

    # Kiểm tra tài khoản đã tồn tại chưa
    if NGUOIDUNG.query.filter((NGUOIDUNG.TenDangNhap == ten_dang_nhap) | (NGUOIDUNG.Email == email)).first():
        return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

    # Tạo tài khoản mới
    hashed_password = generate_password_hash(mat_khau)
    new_user = NGUOIDUNG(
        TenDangNhap=ten_dang_nhap,
        Email=email,
        MatKhau=hashed_password,
        HoTen=ho_ten,
        SoDienThoai=so_dien_thoai,
        DiaChi=dia_chi,
        MaVaiTro=ma_vai_tro,
        TrangThai=bool(trang_thai)  # ✅ ép kiểu rõ ràng
    )

    try:
        db.session.add(new_user)
        db.session.flush()

        # Nếu là khách hàng
        if int(ma_vai_tro) == 1:
            khach_hang = KHACHHANG(
                UserID=new_user.UserID,
                HoTen=ho_ten,
                SoDienThoai=so_dien_thoai,
                DiaChi=dia_chi or "Chưa cập nhật",
                NgayDangKy=datetime.now()
            )
            db.session.add(khach_hang)

        db.session.commit()
        return jsonify({'message': 'Tạo tài khoản thành công'}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Lỗi hệ thống, vui lòng thử lại'}), 500


