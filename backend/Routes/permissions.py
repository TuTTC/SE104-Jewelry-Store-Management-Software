from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.Permissions import PERMISSIONS
from models.NguoiDung import NGUOIDUNG
from database import db
from models.Relationships import user_permissions
from flask_jwt_extended import jwt_required
from utils.permissions import permission_required
permission_bp = Blueprint("permission_bp", __name__)


# 1. Lấy tất cả quyền
@permission_bp.route("/", methods=["GET"])
@jwt_required()
@permission_required("accounts:view")
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


@permission_bp.route("/user/<int:user_id>/permissions-detail", methods=["GET"])
@jwt_required()
@permission_required("accounts:view")
def get_user_permissions_detail(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)

    from sqlalchemy import select

    # Join thủ công để lấy thông tin từ bảng USER_PERMISSIONS
    result = db.session.execute(
        select(user_permissions.c.PermissionID, user_permissions.c.IsGranted)
        .where(user_permissions.c.UserID == user_id)
    ).all()

    granted = [row.PermissionID for row in result if row.IsGranted]
    denied = [row.PermissionID for row in result if not row.IsGranted]

    all_permissions = PERMISSIONS.query.all()
    all_permissions_data = [{
        "PermissionID": p.PermissionID,
        "TenQuyen": p.TenQuyen,
        "MoTa": p.MoTa
    } for p in all_permissions]

    return jsonify({
        "GrantedPermissionIDs": granted,
        "DeniedPermissionIDs": denied,
        "AllPermissions": all_permissions_data
    }), 200



# # 3. Cập nhật quyền riêng của người dùng
# @permission_bp.route("/user/<int:user_id>", methods=["PUT"])
# # @jwt_required()
# def update_user_permissions(user_id):
#     user = NGUOIDUNG.query.get_or_404(user_id)
#     data = request.get_json()
#     permission_ids = data.get("permissions", [])

#     # Lấy danh sách đối tượng quyền từ DB
#     selected_permissions = PERMISSIONS.query.filter(PERMISSIONS.PermissionID.in_(permission_ids)).all()

#     # Gán lại quyền riêng
#     user.permissions = selected_permissions
#     db.session.commit()

#     return jsonify({"message": "Cập nhật quyền thành công"}), 200

# 4. Lấy quyền mặc định theo vai trò của người dùng
@permission_bp.route("/user/<int:user_id>/role-permissions", methods=["GET"])
@jwt_required()
@permission_required("accounts:view")
def get_role_permissions_of_user(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    
    if not user.vaitro:
        return jsonify({"message": "Người dùng chưa được gán vai trò."}), 400

    role_permissions = user.vaitro.permissions
    permission_ids = [p.PermissionID for p in role_permissions]

    return jsonify({
        "RolePermissionIDs": permission_ids
    }), 200

@permission_bp.route("/user/<int:user_id>/permissions", methods=["PUT"])
@jwt_required()
@permission_required("accounts:edit")
def update_user_permissions(user_id):
    user = NGUOIDUNG.query.get_or_404(user_id)
    data = request.get_json()

    granted = data.get("granted", [])
    denied = data.get("denied", [])

    if not isinstance(granted, list) or not isinstance(denied, list):
        return jsonify({"message": "Dữ liệu không hợp lệ."}), 400

    # Xóa hết quyền riêng cũ của user
    db.session.execute(user_permissions.delete().where(user_permissions.c.UserID == user_id))

    # Thêm quyền riêng được cấp
    for permission_id in granted:
        db.session.execute(user_permissions.insert().values(
            UserID=user_id,
            PermissionID=permission_id,
            IsGranted=True
        ))

    # Thêm quyền riêng bị từ chối
    for permission_id in denied:
        db.session.execute(user_permissions.insert().values(
            UserID=user_id,
            PermissionID=permission_id,
            IsGranted=False
        ))

    db.session.commit()

    return jsonify({"message": "Cập nhật quyền riêng thành công."}), 200