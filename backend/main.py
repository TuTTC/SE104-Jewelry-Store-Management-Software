from flask import Flask
from flask_migrate import Migrate
from database import db, Config

# 💡 Thêm dòng này để load biến môi trường từ .env
from dotenv import load_dotenv
load_dotenv()  # ← Tải biến môi trường từ file .env

# Khởi tạo app
app = Flask(__name__)
app.config.from_object(Config)

# Khởi tạo db và migrate
db.init_app(app)
migrate = Migrate(app, db)

# Import models để Flask-Migrate nhận biết
from models import DichVu, NguoiDung, NguoiQuanLy, KhachHang, NhaCungCap, ChiTietPhieuDichVu, PhieuDichVu, ChiTietDonHang, DonHang, SanPham, DanhGia, DanhMucSanPham, ThamSo, TonKho, BangGia, PhieuNhap, ChiTietPhieuNhap, PhieuBanHang, BaoCao
