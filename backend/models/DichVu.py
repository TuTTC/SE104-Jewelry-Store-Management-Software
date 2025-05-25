from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean
from database import db

class DICHVU(db.Model):
    __tablename__ = "DICHVU"

    MaDV = Column(Integer, primary_key=True, autoincrement=True)
    TenDV = Column(String(100), nullable=False)
    DonGia = Column(DECIMAL(10, 2), nullable=False)
    MoTa = Column(Text, nullable=True)
    TrangThai = Column(Boolean, default=True)
