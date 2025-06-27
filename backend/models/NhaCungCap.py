from sqlalchemy import Column, Integer, String, Text, Date, UniqueConstraint
from database import db

class NhaCungCap(db.Model):
    __tablename__ = "NHACUNGCAP"

    MaNCC = Column(Integer, primary_key=True, autoincrement=True)
    TenNCC = Column(String(255), nullable=False)
    SoDienThoai = Column(String(15))
    Email = Column(String(100), unique=True)
    DiaChi = Column(Text, nullable=False)
    NgayHopTac = Column(Date)
    GhiChu = Column(Text)
