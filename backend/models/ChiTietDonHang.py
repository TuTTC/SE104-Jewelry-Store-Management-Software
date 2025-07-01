from sqlalchemy import Column, Integer, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from database import db

class ChiTietDonHang(db.Model):
    __tablename__ = "CHITIETDONHANG"

    MaCTDH = Column(Integer, primary_key=True, autoincrement=True)
    MaDH = Column(Integer, ForeignKey("DONHANG.MaDH"), nullable=False)
    MaSP = Column(Integer, ForeignKey("SANPHAM.MaSP"), nullable=False)
    SoLuong = Column(Integer, nullable=False)
    GiaBan = Column(DECIMAL(10, 2), nullable=False)
    ThanhTien = Column(DECIMAL(10, 2), nullable=False)

    # Quan hệ (nếu cần)
    donhang = relationship("DonHang", backref="chitietdonhang_list")
    sanpham = relationship("SANPHAM", backref="chitietdonhang_list")
