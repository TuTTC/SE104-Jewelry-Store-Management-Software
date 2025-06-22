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



# 💡 Thêm dòng này để load biến môi trường từ .env
from dotenv import load_dotenv
load_dotenv()  # ← Tải biến môi trường từ file .env

# Khởi tạo app
app = Flask(__name__)
CORS(app)
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

from models import DichVu, NguoiDung, NguoiQuanLy, KhachHang, NhaCungCap, ChiTietPhieuDichVu, PhieuDichVu, ChiTietDonHang, DonHang, SanPham, DanhGia, DanhMucSanPham, ThamSo, TonKho, BangGia, PhieuNhap, ChiTietPhieuNhap, PhieuBanHang, BaoCao,VaiTro

with app.app_context():
    db.create_all()
    seed_roles()

from Routes import register_routes
register_routes(app)

