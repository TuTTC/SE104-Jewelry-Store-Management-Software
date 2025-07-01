from models.VaiTro import VaiTro
from models.Permissions import Permissions
from models.Relationships import user_permissions
from database import db

def seed_role_permissions():
    try:
        # Lấy các Vai Trò
        admin_role = VaiTro.query.filter_by(TenVaiTro="Admin").first()
        khachhang_role = VaiTro.query.filter_by(TenVaiTro="Khách hàng").first()

        # Lấy toàn bộ quyền
        all_permissions = Permissions.query.all()
        permissions_dict = {p.TenQuyen: p for p in all_permissions}

        # Gán toàn bộ quyền cho Admin
        admin_role.permissions = list(all_permissions)

        # Khách hàng: chỉ được xem dashboard, sản phẩm, dịch vụ
        khachhang_role.permissions = []
        for ten_quyen in ["dashboard:view", "products:view", "services:view"]:
            if ten_quyen in permissions_dict:
                khachhang_role.permissions.append(permissions_dict[ten_quyen])

        db.session.commit()
        print("Đã seed quyền cho các vai trò thành công")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed quyền cho vai trò: {e}")