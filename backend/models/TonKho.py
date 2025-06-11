from sqlalchemy import Column, Integer, ForeignKey, DateTime, CheckConstraint, func
from sqlalchemy.orm import relationship
from database import db
from sqlalchemy.orm import relationship


class TONKHO(db.Model):
    __tablename__ = "TONKHO"

    MaTK = Column(Integer, primary_key=True, autoincrement=True)
    MaSP = Column(Integer, ForeignKey("SANPHAM.MaSP"), nullable=False)
    SoLuongTon = Column(Integer, default=0, nullable=False)
    NgayCapNhat = Column(DateTime, server_default=func.now(), onupdate=func.now())
    MucCanhBao = Column(Integer, default=10, nullable=False)

    __table_args__ = (
        CheckConstraint('SoLuongTon >= 0', name='check_soluongton_nonnegative'),
    )

    # Quan hệ
    sanpham = relationship("SANPHAM", backref="tonkho_entries")
