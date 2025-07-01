from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, Text, String, func
from sqlalchemy.orm import relationship
from database import db

class PhieuDichVu(db.Model):
    __tablename__ = "PHIEUDICHVU"

    MaPDV = Column(Integer, primary_key=True, autoincrement=True)
    MaKH = Column(Integer, ForeignKey("KHACHHANG.MaKH"), nullable=False)
    NgayLap = Column(DateTime, nullable=False)
    TongTien = Column(DECIMAL(10, 2), nullable=False)
    TraTruoc = Column(DECIMAL(10, 2), default=0)
    GhiChu = Column(Text, nullable=True)
    TrangThai = Column(String(50), default='Chờ xử lý')

    khachhang = relationship("KHACHHANG", backref="phieudichvu")
