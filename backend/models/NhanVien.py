from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import db

class NHANVIEN(db.Model):
    __tablename__ = "NHANVIEN"

    MaNV = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID", ondelete="CASCADE"), nullable=False)
    TenNV = Column(String(100), nullable=False)
    SoDienThoai = Column(String(15), nullable=False)
    DiaChi = Column(Text, nullable=True)
    NgayVaoLam = Column(DateTime, default=func.now())

    # Quan hệ ngược tới NGUOIDUNG
    nguoidung = relationship("NGUOIDUNG", backref="nhanvien")
