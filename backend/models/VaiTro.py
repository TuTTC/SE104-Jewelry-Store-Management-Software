from sqlalchemy import Column, Integer, String
from database import db
from models.Relationships import role_permissions

class VAITRO(db.Model):
    __tablename__ = "VAITRO"

    MaVaiTro = Column(Integer, primary_key=True, autoincrement=True)
    TenVaiTro = Column(String(50), unique=True, nullable=False)

    permissions = db.relationship(
        "PERMISSIONS",
        secondary=role_permissions,
        backref="roles"
    )

    