from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, String
from sqlalchemy.orm import relationship
from database import db

class DONHANG(db.Model):
    __tablename__ = "DONHANG"

    MaDH = Column(Integer, primary_key=True, autoincrement=True)
    MaKH = Column(Integer, ForeignKey("KHACHHANG.MaKH"), nullable=False)
    NgayDat = Column(DateTime, nullable=False)
    TongTien = Column(DECIMAL(10, 2), nullable=False)
    TrangThai = Column(String(50), nullable=False)

    khachhang = relationship("KHACHHANG", backref="donhangs")
