from sqlalchemy import Column, Integer, String, Text
from database import db

class DANHMUC(db.Model):
    __tablename__ = "DANHMUC"

    MaDM = Column(Integer, primary_key=True, autoincrement=True)
    TenDM = Column(String(255), nullable=False)
    MoTa = Column(Text, nullable=True)
