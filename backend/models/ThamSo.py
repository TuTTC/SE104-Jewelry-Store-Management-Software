from sqlalchemy import Column, Integer, String, Text, Boolean
from database import db

class ThamSo(db.Model):
    __tablename__ = "THAMSO"

    MaThamSo = Column(Integer, primary_key=True, autoincrement=True)
    TenThamSo = Column(String(100), nullable=False, unique=True)
    GiaTri = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
    KichHoat = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "MaThamSo": self.MaThamSo,
            "TenThamSo": self.TenThamSo,
            "GiaTri": self.GiaTri,
            "MoTa": self.MoTa,
            "KichHoat": self.KichHoat,
        }
