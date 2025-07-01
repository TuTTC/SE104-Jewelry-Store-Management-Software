from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.Permissions import PERMISSIONS
from models.NguoiDung import NGUOIDUNG
from database import db

permission_bp = Blueprint("permission_bp", __name__)


# 1. Lấy tất cả quyền
@permission_bp.route("/", methods=["GET"])
# @jwt_required()
def get_all_permissions():
    permissions = PERMISSIONS.query.all()
    data = [
        {   
            "PermissionID": p.PermissionID,
            "TenQuyen": p.TenQuyen,
            "MoTa": p.MoTa
        } for p in permissions
    ]
    return jsonify(data), 200


# 2. Lấy quyền riêng của người dùng + tất cả quyền
@permission_bp.route("/user/<int:user_id>", methods=["GET"])
# @jwt_required()
def get_user_permissions(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    
    print("User:", user)
    print("Quyen rieng:", user.permissions)

    quyen_rieng_ids = [q.PermissionID for q in user.permissions]

    permissions = PERMISSIONS.query.all()
    tat_ca_quyen = [
        {
            "PermissionID": p.PermissionID,
            "TenQuyen": p.TenQuyen,
            "MoTa": p.MoTa
        } for p in permissions
    ]

    return jsonify({
        "QuyenRiengIDs": quyen_rieng_ids,
        "TatCaQuyen": tat_ca_quyen
    }), 200


# 3. Cập nhật quyền riêng của người dùng
@permission_bp.route("/user/<int:user_id>", methods=["PUT"])
# @jwt_required()
def update_user_permissions(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()
    permission_ids = data.get("permissions", [])

    # Lấy danh sách đối tượng quyền từ DB
    selected_permissions = PERMISSIONS.query.filter(PERMISSIONS.PermissionID.in_(permission_ids)).all()

    # Gán lại quyền riêng
    user.permissions = selected_permissions
    db.session.commit()

    return jsonify({"message": "Cập nhật quyền thành công"}), 200
