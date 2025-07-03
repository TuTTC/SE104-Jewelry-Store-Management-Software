from flask import Flask
from flask_migrate import Migrate
from database import db, Config
from flask_jwt_extended import JWTManager
from Routes.auth import auth_bp
from Routes.user import user_bp
from Routes.product import product_bp
from Routes.category import category_bp
from oauth import oauth
from utils.roles import seed_roles
from extensions import mail
from flask_cors import CORS
from seeds.seed_danhmuc import seed_danh_muc
from seeds.seed_user import seed_user, clear_users
from seeds.seed_nhacungcap import seed_nhacungcap
from seeds.seed_sanpham import seed_sanpham
from seeds.seed_phieunhap import seed_phieu_nhap
from seeds.seed_permissions import seed_permissions
from seeds.seed_role_permissions import seed_role_permissions
from seeds.update_giaban_sp import cap_nhat_gia_ban_cho_toan_bo_san_pham
from seeds.seed_thamso import seed_thamso
# Thêm dòng này để load biến môi trường từ .env
from dotenv import load_dotenv
load_dotenv()  # ← Tải biến môi trường từ file .env

# Khởi tạo app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

app.config.from_object(Config)
mail.init_app(app)
jwt = JWTManager(app)
# Khởi tạo db và migrate
db.init_app(app)
migrate = Migrate(app, db)
oauth.init_app(app)


@app.route('/hello')
def hello():
    return 'Hello World'


# Đăng ký blueprint
# app.register_blueprint(auth_bp)
# app.register_blueprint(user_bp)
# app.register_blueprint(product_bp)
# app.register_blueprint(category_bp)

# Import models để Flask-Migrate nhận biết

from models import DichVu, NguoiDung, NguoiQuanLy, KhachHang, NhaCungCap, ChiTietPhieuDichVu, PhieuDichVu, ChiTietDonHang, DonHang, SanPham, DanhGia, DanhMucSanPham, ThamSo, TonKho, BangGia, PhieuNhap, ChiTietPhieuNhap, PhieuBanHang, BaoCao,VaiTro, Permissions

with app.app_context():
    db.create_all()
    #seed_roles()
    # seed_danh_muc()
    #seed_user()
    # seed_nhacungcap()
    # clear_users()
    # seed_sanpham()
    # seed_phieu_nhap()
    # seed_permissions()
    # seed_role_permissions()
    # cap_nhat_gia_ban_cho_toan_bo_san_pham()
    seed_thamso()

from Routes import register_routes
register_routes(app)

