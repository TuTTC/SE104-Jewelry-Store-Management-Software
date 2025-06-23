from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import decode_access_token
from models.nguoidung import NGUOIDUNG

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({'message': 'Token không tồn tại'}), 401
        
        data = decode_access_token(token)
        if not data:
            return jsonify({'message': 'Token không hợp lệ hoặc đã hết hạn'}), 401

        user = NGUOIDUNG.query.get(data['user_id'])
        if not user:
            return jsonify({'message': 'Người dùng không tồn tại'}), 401

        request.user = user  # Gắn user vào request
        return f(*args, **kwargs)
    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = get_token_from_header()
            if not token:
                return jsonify({'message': 'Token không tồn tại'}), 401
            
            data = decode_access_token(token)
            if not data or data['role'] not in roles:
                return jsonify({'message': 'Không có quyền truy cập'}), 403
            
            request.user = NGUOIDUNG.query.get(data['user_id'])
            return f(*args, **kwargs)
        return decorated
    return decorator

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None
