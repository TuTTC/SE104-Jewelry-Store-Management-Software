# utils/decorators.py

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from functools import wraps
from flask import jsonify
from models import NGUOIDUNG

def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return func(*args, **kwargs)
    return wrapper

def roles_required(*roles):
    @wraps
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = NGUOIDUNG.query.get(user_id)
            if not user or user.vaitro.TenVaiTro not in roles:
                return jsonify({"message": "Không có quyền truy cập"}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Shortcut cụ thể
def admin_required(func):
    return roles_required("admin")(func)
