from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import db

class KHACHHANG(db.Model):
    __tablename__ = "KHACHHANG"

    MaKH = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)
    HoTen = Column(String(100), nullable=False)
    SoDienThoai = Column(String(15), nullable=False)
    DiaChi = Column(Text, nullable=False)
    NgayDangKy = Column(DateTime, default=func.now())

    nguoidung = relationship("NGUOIDUNG", backref="khachhang")
