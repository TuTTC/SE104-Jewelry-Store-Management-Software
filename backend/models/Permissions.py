from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import db
from models.Relationships import user_permissions

class PERMISSIONS(db.Model):
    __tablename__ = "PERMISSIONS"

    PermissionID = Column(Integer, primary_key=True, autoincrement=True)
    TenQuyen = Column(String(100), unique=True, nullable=False)
    MoTa = Column(String(255))

    users = relationship(
        "NGUOIDUNG",
        secondary=user_permissions,
        back_populates="permissions"
    )
