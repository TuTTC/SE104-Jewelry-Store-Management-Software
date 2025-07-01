from models.VaiTro import VaiTro
from database import db

def seed_roles():
    if not VaiTro.query.first():  # Nếu bảng trống
        db.session.add_all([
            VaiTro(TenVaiTro="Khách hàng"),
            VaiTro(TenVaiTro="Admin")
        ])
        db.session.commit()
        print("✅ Đã seed vai trò 'Khách hàng' và 'Admin'")
    else:
        print("✅ Bảng VaiTro đã có dữ liệu, không cần seed")
