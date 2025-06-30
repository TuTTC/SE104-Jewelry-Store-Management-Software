from sqlalchemy import Column, Integer, ForeignKey, Table
from database import db

user_permissions = Table(
    "USER_PERMISSIONS",
    db.Model.metadata,
    Column("UserID", Integer, ForeignKey("NGUOIDUNG.UserID"), primary_key=True),
    Column("PermissionID", Integer, ForeignKey("PERMISSIONS.PermissionID"), primary_key=True)
)
