from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify
from models.NguoiDung import NGUOIDUNG
from models.Relationships import user_permissions
from models.Permissions import PERMISSIONS
from sqlalchemy import select
from database import db

def permission_required(permission_name):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = NGUOIDUNG.query.get(current_user_id)

            if not user:
                return jsonify({"msg": "Người dùng không tồn tại."}), 401

            # Lấy quyền mặc định từ vai trò
            role_permissions = {p.TenQuyen for p in user.vaitro.permissions}

            # Lấy quyền riêng của user từ bảng user_permissions
            stmt = select(
                user_permissions.c.PermissionID,
                user_permissions.c.IsGranted
            ).where(user_permissions.c.UserID == user.UserID)

            result = db.session.execute(stmt).all()

            # Map permission_id -> TenQuyen
            all_permissions = {p.PermissionID: p.TenQuyen for p in PERMISSIONS.query.all()}

            granted = set()
            revoked = set()

            for perm_id, is_granted in result:
                ten_quyen = all_permissions.get(perm_id)
                if not ten_quyen:
                    continue
                if is_granted:
                    granted.add(ten_quyen)
                else:
                    revoked.add(ten_quyen)

            # Tính quyền cuối cùng:
            final_permissions = (role_permissions | granted) - revoked

            # Admin luôn được phép làm mọi thứ
            if user.vaitro.TenVaiTro == "Admin" or permission_name in final_permissions:
                return f(*args, **kwargs)
            else:
                return jsonify({"msg": "Bạn không có quyền thực hiện thao tác này."}), 403

        return wrapper
    return decorator
