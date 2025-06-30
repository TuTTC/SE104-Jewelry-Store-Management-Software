from models.VaiTro import VAITRO
from database import db

def seed_roles():
    roles_to_add = ["Khách hàng", "Admin", "Nhân viên", "Quản lý kho"]  # Thêm vai trò mới vào đây

    for role_name in roles_to_add:
        existing_role = VAITRO.query.filter_by(TenVaiTro=role_name).first()
        if not existing_role:
            db.session.add(VAITRO(TenVaiTro=role_name))
            print(f"✅ Đã thêm vai trò '{role_name}'")

    db.session.commit()
    print("✅ Seed vai trò hoàn tất")
