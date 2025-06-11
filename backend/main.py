from flask import Flask
from flask_migrate import Migrate
from database import db, Config
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.user import user_bp
from routes.product import product_bp
from routes.category import category_bp
from routes.service import service_bp

# 💡 Thêm dòng này để load biến môi trường từ .env
from dotenv import load_dotenv
load_dotenv()  # ← Tải biến môi trường từ file .env

# Khởi tạo app
app = Flask(__name__)
app.config.from_object(Config)
jwt = JWTManager(app)
# Khởi tạo db và migrate
db.init_app(app)
migrate = Migrate(app, db)

@app.route('/hello')
def hello():
    return 'Hello World'


# Đăng ký blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(product_bp)
app.register_blueprint(category_bp)
app.register_blueprint(service_bp)
# Import models để Flask-Migrate nhận biết

from models import DichVu, NguoiDung, NguoiQuanLy, KhachHang, NhaCungCap, ChiTietPhieuDichVu, PhieuDichVu, ChiTietDonHang, DonHang, SanPham, DanhGia, DanhMucSanPham, ThamSo, TonKho, BangGia, PhieuNhap, ChiTietPhieuNhap, PhieuBanHang, BaoCao

from Routes import register_routes
register_routes(app)

