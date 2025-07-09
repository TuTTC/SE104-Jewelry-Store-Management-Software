from flask import Blueprint, request, jsonify, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.VaiTro import VAITRO
from models.NguoiDung import NGUOIDUNG
from database import db
from utils.authen import send_otp_email, generate_otp
from oauth import google
from datetime import datetime, timedelta

auth_bp = Blueprint('auth_bp', __name__)


pending_register = {}  # {email: {TenDangNhap, MatKhau, VaiTro, otp, expires}}

# @auth_bp.route('/send-otp-register', methods=['POST'])
# def send_otp_register():
#     data = request.get_json()
#     print("Received data:", data)
#     ten_dang_nhap = data.get('TenDangNhap')
#     email = data.get('Email')
#     mat_khau = data.get('MatKhau')
#     # vai_tro = data.get('VaiTro', 'Khách hàng')
#     role_map = {
#     'customer': 'Khách hàng',
#     'admin': 'Admin'
#     }
#     vai_tro_raw = data.get('VaiTro', 'customer')
#     vai_tro = role_map.get(vai_tro_raw.lower())
#     if not all([ten_dang_nhap, email, mat_khau]):
#         return jsonify({'message': 'Thiếu thông tin đăng ký'}), 400

#     if '@' not in email:    
#         return jsonify({'message': 'Email không hợp lệ'}), 400

#     if vai_tro not in ['Khách hàng', 'Admin']:
#         return jsonify({'message': 'Vai trò không hợp lệ'}), 400

#     otp = generate_otp()
#     expires = datetime.utcnow() + timedelta(minutes=5)

#     # Lưu thông tin tạm
#     pending_register[email] = {
#         'TenDangNhap': ten_dang_nhap,
#         'MatKhau': generate_password_hash(mat_khau),
#         'VaiTro': vai_tro,
#         'otp': otp,
#         'expires': expires
#     }
#     info = pending_register.get(email)
#     if not info:
#         return jsonify({'message': 'Không tìm thấy yêu cầu đăng ký'}), 400
#     try:
#         role = VAITRO.query.filter_by(TenVaiTro=info['VaiTro']).first()
#         if not role:
#             return jsonify({'message': 'Vai trò chưa được cấu hình'}), 500

#         user = NGUOIDUNG(
#             TenDangNhap=info['TenDangNhap'],
#             Email=email,
#             MatKhau=info['MatKhau'],
#             MaVaiTro=role.MaVaiTro
#         )
#         db.session.add(user)
#         db.session.commit()

#         pending_register.pop(email, None)
#         return jsonify({'message': 'Đăng ký thành công'}), 201
#     except IntegrityError:
#         db.session.rollback()
#         return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400
    
    # if send_otp_email(email, otp):
    #     return jsonify({'message': 'Đã gửi OTP đến email'}), 200
    # else:
    #     pending_register.pop(email, None)  # Xoá nếu gửi email thất bại
    #     return jsonify({'message': 'Không gửi được OTP'}), 500
    
    
@auth_bp.route('/send-otp-register', methods=['POST'])
def send_otp_register():
    data = request.get_json()
    print("Received data:", data)

    ten_dang_nhap = data.get('TenDangNhap')
    email = data.get('Email')
    mat_khau = data.get('MatKhau')

    role_map = {
        'customer': 'Khách hàng',
        'admin': 'Admin',
        'employee': 'Nhân viên'
    }
    vai_tro_raw = data.get('VaiTro', 'customer')
    vai_tro = role_map.get(vai_tro_raw.lower())

    if not all([ten_dang_nhap, email, mat_khau]):
        return jsonify({'message': 'Thiếu thông tin đăng ký'}), 400

    if '@' not in email:
        return jsonify({'message': 'Email không hợp lệ'}), 400

    if vai_tro not in ['Khách hàng', 'Admin', 'Nhân viên']:
        return jsonify({'message': 'Vai trò không hợp lệ'}), 400

    if NGUOIDUNG.query.filter((NGUOIDUNG.TenDangNhap == ten_dang_nhap) | (NGUOIDUNG.Email == email)).first():
        return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

    try:
        role = VAITRO.query.filter_by(TenVaiTro=vai_tro).first()
        if not role:
            return jsonify({'message': 'Vai trò chưa được cấu hình'}), 500

        user = NGUOIDUNG(
            TenDangNhap=ten_dang_nhap,
            Email=email,
            MatKhau=generate_password_hash(mat_khau),
            MaVaiTro=role.MaVaiTro,
            HoTen="",  # hoặc lấy từ request nếu muốn
            SoDienThoai="",
            DiaChi=""
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({'message': 'Đăng ký thành công'}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

    



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    ten_dang_nhap = data.get('TenDangNhap')
    mat_khau = data.get('MatKhau')

    if not ten_dang_nhap or not mat_khau:
        return jsonify({'message': 'Vui lòng cung cấp đầy đủ thông tin'}), 400
    
    user = NGUOIDUNG.query.filter_by(TenDangNhap=ten_dang_nhap).first()
    
    if not user:
        return jsonify({'message': 'Tên đăng nhập không tồn tại'}), 404

    if not user.TrangThai:
        return jsonify({'message': 'Tài khoản đã bị khóa hoặc chưa được kích hoạt'}), 403

    if not check_password_hash(user.MatKhau, mat_khau):
        return jsonify({'message': 'Mật khẩu không đúng'}), 401
    
    if user and user.vaitro and check_password_hash(user.MatKhau, mat_khau):
        identity = str(user.UserID)  # Identity chỉ là string hoặc int
        additional_claims = {"role": user.vaitro.TenVaiTro}
        expires = timedelta(days=1)  
        
        access_token = create_access_token(
            identity=identity,
            additional_claims=additional_claims,
            expires_delta=expires
        )

        return jsonify({
            'token': access_token,
            'user': {
                'id': user.UserID,
                'role': user.vaitro.TenVaiTro,
                'name': user.HoTen,
                'username': user.TenDangNhap
            }
        }), 200

    return jsonify({'message': 'Tên đăng nhập hoặc mật khẩu không đúng'}), 401



# @auth_bp.route('/send-otp', methods=['POST'])
# def send_otp():
#     data = request.get_json()
#     email = data.get('Email')

#     if not email:
#         return jsonify({'message': 'Email không được để trống'}), 400

#     if '@' not in email:
#         return jsonify({'message': 'Email không hợp lệ'}), 400

#     otp = generate_otp()

#     if send_otp_email(email, otp):
#         # ✅ Trả về OTP cho frontend nếu bạn đang trong giai đoạn phát triển (KHÔNG DÙNG cho production)
#         return jsonify({'message': 'Đã gửi OTP đến email', 'otp': otp}), 200
#     return jsonify({'message': 'Không gửi được email'}), 500

@auth_bp.route('/confirm-otp-register', methods=['POST'])
def confirm_otp_register():
    data = request.get_json()
    email = data.get('Email')
    otp_input = data.get('otp')

    info = pending_register.get(email)
    if not info:
        return jsonify({'message': 'Không tìm thấy yêu cầu đăng ký'}), 400

    if datetime.utcnow() > info['expires']:
        pending_register.pop(email, None)
        return jsonify({'message': 'OTP đã hết hạn'}), 400

    if otp_input != info['otp']:
        return jsonify({'message': 'OTP không đúng'}), 400

    try:
        role = VAITRO.query.filter_by(TenVaiTro=info['VaiTro']).first()
        if not role:
            return jsonify({'message': 'Vai trò chưa được cấu hình'}), 500

        user = NGUOIDUNG(
            TenDangNhap=info['TenDangNhap'],
            Email=email,
            MatKhau=info['MatKhau'],
            MaVaiTro=role.MaVaiTro
        )
        db.session.add(user)
        db.session.commit()

        pending_register.pop(email, None)
        return jsonify({'message': 'Đăng ký thành công'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

@auth_bp.route('/check', methods=['GET'])
@jwt_required()
def check_auth():
    identity = get_jwt_identity()
    return jsonify({'message': 'Token hợp lệ', 'user': identity}), 200

# Login Google
@auth_bp.route('/login/google')
def google_login():
    redirect_uri = url_for('auth.google_auth_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@auth_bp.route('/login/google/callback')
def google_auth_callback():
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    email = user_info['email']
    ten_dang_nhap = user_info.get('name', email.split('@')[0])

    user = NGUOIDUNG.query.filter_by(Email=email).first()
    if not user:
        role = VAITRO.query.filter_by(TenVaiTro='khachhang').first()
        user = NGUOIDUNG(
            TenDangNhap=ten_dang_nhap,
            Email=email,
            MatKhau='',
            MaVaiTro=role.MaVaiTro
        )
        db.session.add(user)
        db.session.commit()

    identity = {'id': user.UserID, 'role': user.vaitro.TenVaiTro}
    access_token = create_access_token(identity=identity)
    return jsonify({
        'token': access_token,
        'user': identity
    })


forgot_password_requests = {}  # {email: {otp, expires}}

@auth_bp.route('/send-otp-forgot-password', methods=['POST'])
def send_otp_forgot_password():
    data = request.get_json()
    email = data.get('Email')

    if not email:
        return jsonify({'message': 'Email không được để trống'}), 400

    user = NGUOIDUNG.query.filter_by(Email=email).first()
    if not user:
        return jsonify({'message': 'Email chưa được đăng ký'}), 404

    otp = generate_otp()
    expires = datetime.utcnow() + timedelta(minutes=5)

    forgot_password_requests[email] = {
        'otp': otp,
        'expires': expires
    }

    # Gửi email thực tế
    if send_otp_email(email, otp):
        return jsonify({'message': 'Đã gửi OTP đến email'}), 200
    else:
        forgot_password_requests.pop(email, None)
        return jsonify({'message': 'Không gửi được OTP'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('Email')
    otp_input = data.get('otp')
    new_password = data.get('NewPassword')

    if not all([email, otp_input, new_password]):
        return jsonify({'message': 'Thiếu thông tin'}), 400

    info = forgot_password_requests.get(email)
    if not info:
        return jsonify({'message': 'Không tìm thấy yêu cầu đặt lại mật khẩu'}), 400

    if datetime.utcnow() > info['expires']:
        forgot_password_requests.pop(email, None)
        return jsonify({'message': 'OTP đã hết hạn'}), 400

    if otp_input != info['otp']:
        return jsonify({'message': 'OTP không đúng'}), 400

    user = NGUOIDUNG.query.filter_by(Email=email).first()
    if not user:
        return jsonify({'message': 'Người dùng không tồn tại'}), 404

    user.MatKhau = generate_password_hash(new_password)
    db.session.commit()

    forgot_password_requests.pop(email, None)
    return jsonify({'message': 'Đặt lại mật khẩu thành công'}), 200
