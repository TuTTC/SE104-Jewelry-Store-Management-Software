from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, validates
from database import db

class NGUOIDUNG(db.Model):
    __tablename__ = "NGUOIDUNG"

    UserID = Column(Integer, primary_key=True, autoincrement=True)
    TenDangNhap = Column(String(100), unique=True, nullable=False)
    Email = Column(String(100), unique=True, nullable=False)
    MatKhau = Column(String(255), nullable=False)
    MaVaiTro = Column(Integer, ForeignKey("VAITRO.MaVaiTro"), nullable=False)
    TaoNgay = Column(DateTime, default=func.now())

    vaitro = relationship("VAITRO", backref="nguoidungs")

    @validates('Email')
    def validate_email(self, key, email):
        assert '@' in email, "Email không hợp lệ"
        return email
