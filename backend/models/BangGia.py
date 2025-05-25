from sqlalchemy import Column, Integer, DECIMAL, DateTime, Enum, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from database import db

class BANGGIA(db.Model):
    __tablename__ = "BANGGIA"

    MaBG = Column(Integer, primary_key=True, autoincrement=True)
    MaSP = Column(Integer, ForeignKey("SANPHAM.MaSP"), nullable=False)
    GiaBan = Column(DECIMAL(18, 2), nullable=False)
    GiaNhap = Column(DECIMAL(18, 2))
    NgayCapNhat = Column(DateTime, default=func.now())
    NguonCapNhat = Column(Enum("Thủ công", "API"), default="Thủ công")

    # Ràng buộc kiểm tra giá không âm
    __table_args__ = (
        CheckConstraint("GiaBan >= 0", name="check_giaban_non_negative"),
        CheckConstraint("GiaNhap >= 0", name="check_gianhap_non_negative"),
    )

    # Quan hệ với bảng SANPHAM
    sanpham = relationship("SANPHAM", backref="banggia_list")
