from models.VaiTro import VAITRO
from database import db

def seed_roles():
    if not VAITRO.query.first():  # Nếu bảng trống
        db.session.add_all([
            VAITRO(TenVaiTro="Khách hàng"),
            VAITRO(TenVaiTro="Admin")
        ])
        db.session.commit()
        print("✅ Đã seed vai trò 'Khách hàng' và 'Admin'")
    else:
        print("✅ Bảng VAITRO đã có dữ liệu, không cần seed")
