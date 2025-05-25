from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import db

class NGUOIQUANLY(db.Model):
    __tablename__ = "NGUOIQUANLY"

    MaQL = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)
    HoTen = Column(String(100), nullable=False)
    SoDienThoai = Column(String(15), nullable=False)
    DiaChi = Column(Text)

    nguoidung = relationship("NGUOIDUNG", backref="nguoi_quan_ly")
