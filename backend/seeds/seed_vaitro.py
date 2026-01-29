from models.VaiTro import VaiTro
from database import db

def seed_roles():
    if not VaiTro.query.first():  # Nếu bảng trống
        db.session.add_all([
            VaiTro(TenVaiTro="Khách hàng"),
            VaiTro(TenVaiTro="Admin")
        ])
        db.session.commit()
        print("Da seed vai tro 'Khach hang' va 'Admin'")
    else:
        print("Bang VaiTro da co du lieu, khong can seed")
