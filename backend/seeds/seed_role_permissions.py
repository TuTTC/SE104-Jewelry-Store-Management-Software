from models.VaiTro import VAITRO
from models.Permissions import PERMISSIONS
from models.Relationships import role_permissions
from database import db

def seed_role_permissions():
    try:
        admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
        nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not admin_role or not nhanvien_role or not khachhang_role:
            print("Thiếu dữ liệu Vai Trò, vui lòng seed Vai Trò trước!")
            return

        # Kiểm tra nếu Admin đã có quyền thì không seed lại
        if admin_role.permissions:
            print("Quyền cho các vai trò đã được thiết lập, bỏ qua seed.")
            return

        all_permissions = PERMISSIONS.query.all()
        permissions_dict = {p.TenQuyen: p for p in all_permissions}

        # Gán toàn bộ quyền cho Admin
        admin_role.permissions = list(all_permissions)

        # Nhân viên:
        nhanvien_role.permissions = []
        for quyen in all_permissions:
            # Loại bỏ quyền xem tài khoản
            if quyen.TenQuyen == "accounts:view":
                continue

            # Quyền xem tất cả trừ accounts
            if quyen.TenQuyen.endswith(":view"):
                nhanvien_role.permissions.append(quyen)

            # Quyền edit/add/delete cho các module chỉ định
            for prefix in ["orders", "services", "purchaseOrders", "suppliers", "products"]:
                if quyen.TenQuyen.startswith(f"{prefix}:edit") or \
                   quyen.TenQuyen.startswith(f"{prefix}:add") or \
                   quyen.TenQuyen.startswith(f"{prefix}:delete"):
                    nhanvien_role.permissions.append(quyen)

        # Khách hàng: Xem dashboard, sản phẩm, dịch vụ + xem đơn hàng & dịch vụ của chính mình
        khachhang_role.permissions = []
        for ten_quyen in ["dashboard:view", "products:view", "services:view",
                          "orders:view_own", "services:view_own"]:
            if ten_quyen in permissions_dict:
                khachhang_role.permissions.append(permissions_dict[ten_quyen])

        db.session.commit()
        print("Đã seed quyền cho các vai trò thành công")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed quyền cho vai trò: {e}")
