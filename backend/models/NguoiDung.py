# from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
# from sqlalchemy.orm import relationship, validates
# from database import db
# from models.Relationships import user_permissions  # Import bảng liên kết từ file riêng

# class NGUOIDUNG(db.Model):
#     __tablename__ = "NGUOIDUNG"

#     UserID = Column(Integer, primary_key=True, autoincrement=True)
#     TenDangNhap = Column(String(100), unique=True, nullable=False)
#     Email = Column(String(100), unique=True, nullable=False)
#     MatKhau = Column(String(255), nullable=False)
#     MaVaiTro = Column(Integer, ForeignKey("VAITRO.MaVaiTro"), nullable=False)
#     TaoNgay = Column(DateTime, default=func.now())

#     # Quan hệ với vai trò
#     vaitro = relationship("VAITRO", backref="nguoidungs")

#     # Quan hệ nhiều-nhiều với bảng PERMISSIONS
#     permissions = relationship(
#         "PERMISSIONS",
#         secondary=user_permissions,
#         back_populates="users"
#     )

#     @validates('Email')
#     def validate_email(self, key, email):
#         assert '@' in email, "Email không hợp lệ"
#         return email

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship, validates
from database import db
from models.Relationships import user_permissions

class NGUOIDUNG(db.Model):
    __tablename__ = "NGUOIDUNG"

    UserID = Column(Integer, primary_key=True, autoincrement=True)
    TenDangNhap = Column(String(100), unique=True, nullable=False)
    Email = Column(String(100), unique=True, nullable=False)
    MatKhau = Column(String(255), nullable=False)
    MaVaiTro = Column(Integer, ForeignKey("VAITRO.MaVaiTro"), nullable=False)
    TaoNgay = Column(DateTime, default=func.now())

    # Thông tin cá nhân bổ sung
    HoTen = Column(String(100), nullable=False)
    SoDienThoai = Column(String(15), nullable=False)
    DiaChi = Column(Text)
    
    # Quan hệ với vai trò
    vaitro = relationship("VAITRO", backref="nguoidungs")

    # Quan hệ nhiều-nhiều với bảng PERMISSIONS
    permissions = relationship(
        "PERMISSIONS",
        secondary=user_permissions,
        back_populates="users"
    )

    @validates('Email')
    def validate_email(self, key, email):
        assert '@' in email, "Email không hợp lệ"
        return email
