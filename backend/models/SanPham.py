from sqlalchemy import Column, Integer, String, DECIMAL, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import db

class SANPHAM(db.Model):
    __tablename__ = "SANPHAM"

    MaSP = Column(Integer, primary_key=True, autoincrement=True)
    TenSP = Column(String(255), nullable=False)
    MaDM = Column(Integer, ForeignKey("DANHMUC.MaDM"), nullable=False)
    MaNCC = Column(Integer, ForeignKey("NHACUNGCAP.MaNCC"), nullable=False)
    GiaBan = Column(DECIMAL(10, 2), nullable=True)
    SoLuongTon = Column(Integer, nullable=False, default=0)
    MoTa = Column(Text, nullable=True)
    HinhAnh = Column(String(255), nullable=True)
    IsDisabled = Column(Boolean, nullable=False, default=False)  # Trường ẩn sản phẩm

    danhmuc = relationship("DANHMUC", backref="sanphams")
    nhacungcap = relationship("NHACUNGCAP", backref="sanphams")
