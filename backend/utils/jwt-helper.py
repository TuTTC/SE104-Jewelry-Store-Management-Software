#Chứa các hàm để tạo và giải mã token JWT.

import jwt
from datetime import datetime, timedelta
from flask import current_app

def create_access_token(user):
    payload = {
        'user_id': user.UserID,
        'role': user.VaiTro,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def decode_access_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
