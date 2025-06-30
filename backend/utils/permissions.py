from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from models.NguoiDung import NGUOIDUNG
from utils.permissions_utils import get_user_permissions

def permission_required(permission_name):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            user = NGUOIDUNG.query.get(identity['UserID'])
            
            if not user:
                return jsonify({'message': 'Người dùng không tồn tại'}), 404

            quyen_thuc_te = get_user_permissions(user)

            if permission_name not in quyen_thuc_te:
                return jsonify({'message': 'Bạn không có quyền thực hiện chức năng này'}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator
