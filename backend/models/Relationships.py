from sqlalchemy import Column, Integer, ForeignKey, Table
from database import db

# Gán quyền theo vai trò
role_permissions = Table(
    "ROLE_PERMISSIONS",
    db.Model.metadata,
    Column("MaVaiTro", Integer, ForeignKey("VAITRO.MaVaiTro"), primary_key=True),
    Column("PermissionID", Integer, ForeignKey("PERMISSIONS.PermissionID"), primary_key=True)
)


user_permissions = Table(
    "USER_PERMISSIONS",
    db.Model.metadata,
    Column("UserID", Integer, ForeignKey("NGUOIDUNG.UserID"), primary_key=True),
    Column("PermissionID", Integer, ForeignKey("PERMISSIONS.PermissionID"), primary_key=True)
)
