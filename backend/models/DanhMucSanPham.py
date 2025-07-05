from sqlalchemy import Column, Integer, String, Text, Float, Boolean
from database import db

class DANHMUC(db.Model):
    __tablename__ = "DANHMUC"

    MaDM = Column(Integer, primary_key=True, autoincrement=True)
    TenDM = Column(String(255), nullable=False)
    DonViTinh = Column(String(50), nullable=False)
    MoTa = Column(Text, nullable=True)
    PhanTramLoiNhuan = Column(Float, nullable=False, default=0.0)
    IsDisabled = Column(Boolean, nullable=False, default=False)  # Xóa mềm
