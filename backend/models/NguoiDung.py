from sqlalchemy import Column, Integer, String, DateTime, Enum, func
from sqlalchemy.orm import validates
from database import db

class NGUOIDUNG(db.Model):
    __tablename__ = "NGUOIDUNG"

    UserID = Column(Integer, primary_key=True, autoincrement=True)
    TenDangNhap = Column(String(100), unique=True, nullable=False)
    Email = Column(String(100), unique=True, nullable=False)
    MatKhau = Column(String(255), nullable=False)
    VaiTro = Column(Enum("admin", "customer"), nullable=False)
    TaoNgay = Column(DateTime, default=func.now())

    @validates('Email')
    def validate_email(self, key, email):
        assert '@' in email, "Email không hợp lệ"
        return email
