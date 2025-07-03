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
                "MoTa": f"Sửa {m['mo_ta']}"
            })
            permissions.append({
                "TenQuyen": f"{m['prefix']}:delete",
                "MoTa": f"Xóa {m['mo_ta']}"
            })
            permissions.append({
                "TenQuyen": f"{m['prefix']}:add",
                "MoTa": f"Thêm {m['mo_ta']}"
            })

        # Seed vào DB nếu chưa có
        if not PERMISSIONS.query.first():
            for p in permissions:
                if not PERMISSIONS.query.filter_by(TenQuyen=p["TenQuyen"]).first():
                    db.session.add(PERMISSIONS(**p))

            db.session.commit()
            print("Seed quyền thành công!")
        else:
            print("Dữ liệu quyền đã tồn tại, bỏ qua seed.")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed quyền: {e}")

