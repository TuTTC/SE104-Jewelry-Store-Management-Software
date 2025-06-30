from models.VaiTro import VAITRO
from models.Permissions import PERMISSIONS
from models.Relationships import role_permissions
from database import db

def seed_role_permissions():
    try:
        # Lấy các Vai Trò
        admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
        nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        # Lấy toàn bộ quyền
        all_permissions = PERMISSIONS.query.all()
        permissions_dict = {p.TenQuyen: p for p in all_permissions}

        # Gán toàn bộ quyền cho Admin
        admin_role.permissions = list(all_permissions)

        # Nhân viên: View tất cả + Edit sản phẩm và đơn hàng
        nhanvien_role.permissions = []
        for quyen in all_permissions:
            if ":view" in quyen.TenQuyen or quyen.TenQuyen.startswith("products:edit") or quyen.TenQuyen.startswith("orders:edit"):
                nhanvien_role.permissions.append(quyen)

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
