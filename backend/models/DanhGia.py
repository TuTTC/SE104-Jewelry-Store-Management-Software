from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime, CheckConstraint, func
from sqlalchemy.orm import relationship
from database import db

class DANHGIA(db.Model):
    __tablename__ = "DANHGIA"

    MaDG = Column(Integer, primary_key=True, autoincrement=True)
    MaSP = Column(Integer, ForeignKey("SANPHAM.MaSP"))
    MaKH = Column(Integer, ForeignKey("KHACHHANG.MaKH"))
    XepHang = Column(Integer, nullable=False)
    TieuDe = Column(String(255), nullable=False)
    NoiDung = Column(Text, nullable=False)
    NgayDANHGIA = Column(DateTime, default=func.now())
    HinhAnh = Column(String(255))

    __table_args__ = (
        CheckConstraint('XepHang BETWEEN 1 AND 5', name='check_xephang_range'),
    )

    # Quan hệ với SANPHAM và KHACHHANG (nếu cần)
    sanpham = relationship("SANPHAM", backref="danhgia_list")
    khachhang = relationship("KHACHHANG", backref="danhgia_list")
