from models.Permissions import PERMISSIONS
from database import db
from models.VaiTro import VAITRO
from models.Permissions import PERMISSIONS
from models.NguoiDung import NGUOIDUNG
from models.Relationships import user_permissions

def seed_permissions():
    try:
        modules = [
            {"prefix": "dashboard", "mo_ta": "Tổng quan Dashboard"},
            {"prefix": "accounts", "mo_ta": "Tài khoản người dùng"},
            {"prefix": "products", "mo_ta": "Sản phẩm"},
            {"prefix": "categories", "mo_ta": "Danh mục"},
            {"prefix": "orders", "mo_ta": "Đơn hàng"},
            {"prefix": "services", "mo_ta": "Dịch vụ"},
            {"prefix": "purchaseOrders", "mo_ta": "Phiếu nhập hàng"},
            {"prefix": "suppliers", "mo_ta": "Nhà cung cấp"},
            {"prefix": "inventory", "mo_ta": "Tồn kho"},
            {"prefix": "reports", "mo_ta": "Báo cáo & thống kê"},
        ]

        permissions = []
        for m in modules:
            permissions.append({
                "TenQuyen": f"{m['prefix']}:view",
                "MoTa": f"Xem {m['mo_ta']}"
            })
            permissions.append({
                "TenQuyen": f"{m['prefix']}:edit",
                "MoTa": f"Thêm, sửa, xóa {m['mo_ta']}"
            })

        # Seed vào DB nếu chưa có
        for p in permissions:
            if not PERMISSIONS.query.filter_by(TenQuyen=p["TenQuyen"]).first():
                db.session.add(PERMISSIONS(**p))

        db.session.commit()
        print("Seed quyền thành công!")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed quyền: {e}")



# def gan_quyen_cho_vai_tro():
#     try:
#         # Tìm các vai trò
#         admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
#         nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
#         khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

#         # Lấy tất cả quyền
#         all_permissions = PERMISSIONS.query.all()
#         permissions_dict = {p.TenQuyen: p for p in all_permissions}

#         ### Gán quyền cho Admin - tất cả quyền
#         admin_users = NGUOIDUNG.query.filter_by(VaiTroID=admin_role.VaiTroID).all()
#         for user in admin_users:
#             user.permissions = list(all_permissions)

#         ### Gán quyền cho Nhân viên - view tất cả, edit sản phẩm & đơn hàng
#         nhanvien_users = NGUOIDUNG.query.filter_by(VaiTroID=nhanvien_role.VaiTroID).all()
#         for user in nhanvien_users:
#             user.permissions = []
#             for ten_quyen, quyen_obj in permissions_dict.items():
#                 if ":view" in ten_quyen or ten_quyen.startswith("products:edit") or ten_quyen.startswith("orders:edit"):
#                     user.permissions.append(quyen_obj)

#         ### Gán quyền cho Khách hàng - chỉ được xem dashboard, sản phẩm, dịch vụ
#         khachhang_users = NGUOIDUNG.query.filter_by(VaiTroID=khachhang_role.VaiTroID).all()
#         for user in khachhang_users:
#             user.permissions = []
#             for ten_quyen in ["dashboard:view", "products:view", "services:view"]:
#                 if ten_quyen in permissions_dict:
#                     user.permissions.append(permissions_dict[ten_quyen])

#         db.session.commit()
#         print("✅ Đã gán quyền cho các vai trò")

#     except Exception as e:
#         db.session.rollback()
#         print(f"❌ Lỗi khi gán quyền: {e}")

