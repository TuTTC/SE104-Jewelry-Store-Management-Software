from sqlalchemy import Column, Integer, String, Text, Boolean
from database import db

class THAMSO(db.Model):
    __tablename__ = "THAMSO"

    MaThamSo = Column(Integer, primary_key=True, autoincrement=True)
    TenThamSo = Column(String(100), nullable=False, unique=True)
    GiaTri = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    KichHoat = Column(Boolean, default=True)
