from sqlalchemy import Column, String, ForeignKey, Date, DECIMAL, Text, Integer
from sqlalchemy.orm import relationship
from database import db

class PHIEUBANHANG(db.Model):
    __tablename__ = "PHIEUBANHANG"

    MaPhieuBan = Column(String(20), primary_key=True)
    MaDH = Column(Integer, ForeignKey("DONHANG.MaDH"), nullable=False)
    NgayLap = Column(Date, nullable=False)
    TongTien = Column(DECIMAL(15, 2), nullable=False)
    PhuongThucThanhToan = Column(String(50), nullable=False)
    GhiChu = Column(Text, nullable=True)

    # Quan hệ
    donhang = relationship("DonHang", backref="phieubanhang_entries")
    