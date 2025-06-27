from sqlalchemy import Column, Integer, String, DECIMAL, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import db

class SANPHAM(db.Model):
    __tablename__ = "SANPHAM"

    MaSP = Column(Integer, primary_key=True, autoincrement=True)
    TenSP = Column(String(255), nullable=False)
    MaDM = Column(Integer, ForeignKey("DANHMUC.MaDM"), nullable=False)
    MaNCC = Column(Integer, ForeignKey("NHACUNGCAP.MaNCC"), nullable=False)
    GiaBan = Column(DECIMAL(10, 2), nullable=False)
    SoLuongTon = Column(Integer, nullable=False)
    MoTa = Column(Text, nullable=True)
    HinhAnh = Column(String(255), nullable=True)

    danhmuc = relationship("DANHMUC", backref="sanphams")
    nhacungcap = relationship("NhaCungCap", backref="sanphams")
