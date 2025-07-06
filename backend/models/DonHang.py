from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, String
from sqlalchemy.orm import relationship
from models.Relationships import baocao_donhang
from database import db

class DONHANG(db.Model):
    __tablename__ = "DONHANG"

    MaDH = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)
    NgayDat = Column(DateTime, nullable=False)
    TongTien = Column(DECIMAL(10, 2), nullable=False)
    TrangThai = Column(String(50), nullable=False)

    # Liên kết với bảng NGUOIDUNG thay vì KHACHHANG
    nguoidung = relationship("NGUOIDUNG", backref="don_hangs")

    # Nếu có liên kết với bảng BAOCAO thì giữ nguyên
    # bao_caos = relationship(
    #     "BAOCAO",
    #     secondary=baocao_donhang,
    #     back_populates="don_hangs"
    # )
