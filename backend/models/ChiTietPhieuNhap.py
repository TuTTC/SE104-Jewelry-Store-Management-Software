from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, CheckConstraint
from sqlalchemy.orm import relationship
from database import db

class ChiTietPhieuNhap(db.Model):
    __tablename__ = "CHITIETPHIEUNHAP"

    MaCTPN = Column(Integer, primary_key=True, autoincrement=True)
    MaPN = Column(Integer, ForeignKey("PHIEUNHAP.MaPN"), nullable=False)
    MaSP = Column(Integer, ForeignKey("SANPHAM.MaSP"), nullable=False)
    SoLuong = Column(Integer, nullable=False)
    DonGiaNhap = Column(DECIMAL(18, 2), nullable=False)
    ThanhTien = Column(DECIMAL(18, 2), nullable=False)

    __table_args__ = (
        CheckConstraint('SoLuong > 0', name='check_soluong_positive'),
    )

    # Quan hệ
    phieunhap = relationship("PhieuNhap", backref="chitietphieunhap_list")
    sanpham = relationship("SANPHAM", backref="chitietphieunhap_list")

    
    def to_dict(self):
        return {
            "MaSP": self.MaSP,
            "SoLuong": self.SoLuong,
            "DonGiaNhap": float(self.DonGiaNhap)  # Đảm bảo trả về kiểu float
        }
