from sqlalchemy import Column, Integer, String
from database import db

class VAITRO(db.Model):
    __tablename__ = "VAITRO"

    MaVaiTro = Column(Integer, primary_key=True, autoincrement=True)
    TenVaiTro = Column(String(50), unique=True, nullable=False)
