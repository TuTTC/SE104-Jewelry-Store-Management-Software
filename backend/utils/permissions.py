from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify
from models.NguoiDung import NGUOIDUNG
from models.Relationships import user_permissions
from models.Permissions import PERMISSIONS
from sqlalchemy import select
from database import db

def permission_required(*permission_name):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()

            user = NGUOIDUNG.query.get(user_id)
            if not user:
                return jsonify({"msg": "Người dùng không tồn tại."}), 401

            # Lấy quyền mặc định từ vai trò
            role_permissions = {p.TenQuyen for p in user.vaitro.permissions}

            # Lấy quyền riêng của user
            stmt = select(user_permissions.c.PermissionID, user_permissions.c.IsGranted)\
                .where(user_permissions.c.UserID == user.UserID)
            result = db.session.execute(stmt).all()
            all_permissions = {p.PermissionID: p.TenQuyen for p in PERMISSIONS.query.all()}

            granted = set()
            revoked = set()
            for perm_id, is_granted in result:
                name = all_permissions.get(perm_id)
                if not name:
                    continue
                (granted if is_granted else revoked).add(name)

            final_permissions = (role_permissions | granted) - revoked

            # ✅ Gán vào g để các hàm khác sử dụng
            from flask import g
            g.current_user = user
            g.permissions = final_permissions

            print(f"[PERMISSION] {user.HoTen} - Quyền hiện tại: {final_permissions}")
            print(f"[PERMISSION] Đang kiểm tra: {permission_name}")

            # ✅ Đây là dòng QUAN TRỌNG bạn thiếu
            if user.vaitro.TenVaiTro == "Admin" or any(p in final_permissions for p in permission_name):
                return f(*args, **kwargs)
            else:
                return jsonify({"msg": "Bạn không có quyền thực hiện thao tác này."}), 403

        return wrapper
    return decorator
