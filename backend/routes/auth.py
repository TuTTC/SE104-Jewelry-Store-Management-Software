from flask import Blueprint, request, jsonify, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.VaiTro import VAITRO
from models.NguoiDung import NGUOIDUNG
from database import db
from utils.authen import send_otp_email, generate_otp
from main import google  # cần import từ nơi đăng ký oauth
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        ten_dang_nhap = data['TenDangNhap']
        email = data['Email']
        mat_khau = generate_password_hash(data['MatKhau'])
        vai_tro = data.get('VaiTro', 'khachhang')

        role = VAITRO.query.filter_by(TenVaiTro=vai_tro).first()
        if not role:
            return jsonify({'message': 'Vai trò không hợp lệ'}), 400

        user = NGUOIDUNG(TenDangNhap=ten_dang_nhap, Email=email, MatKhau=mat_khau, MaVaiTro=role.MaVaiTro)
        db.session.add(user)
        db.session.commit()

        return jsonify({'message': 'Đăng ký thành công'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Tên đăng nhập hoặc email đã tồn tại'}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = NGUOIDUNG.query.filter_by(TenDangNhap=data['TenDangNhap']).first()

    if user and check_password_hash(user.MatKhau, data['MatKhau']):
        identity = {'id': user.UserID, 'role': user.vaitro.TenVaiTro}
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=identity, expires_delta=expires)
        return jsonify({
            'token': access_token,
            'user': identity
        }), 200
    return jsonify({'message': 'Tên đăng nhập hoặc mật khẩu không đúng'}), 401

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data['Email']
    otp = generate_otp()

    if send_otp_email(email, otp):
        return jsonify({'message': 'Đã gửi OTP đến email'}), 200
    return jsonify({'message': 'Không gửi được email'}), 500

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
