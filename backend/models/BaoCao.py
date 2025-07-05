from sqlalchemy import Column, Integer, Enum, Date, DateTime, JSON, ForeignKey, String, func
from sqlalchemy.orm import relationship
from database import db
from models.NguoiDung import NGUOIDUNG
from sqlalchemy import JSON

class BAOCAO(db.Model):
    __tablename__ = "BAOCAO"

    MaBC = Column(Integer, primary_key=True, autoincrement=True)
    LoaiBaoCao = Column(Enum('Doanh thu', 'Tồn kho', 'Lợi nhuận'), nullable=False)
    TuNgay = Column(Date, nullable=False)
    DenNgay = Column(Date, nullable=False)
    MoTa = Column(String(255))
    TaoNgay = Column(DateTime, server_default=func.now())
    NguoiTao = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)

    # Quan hệ: một báo cáo thuộc về một người dùng
    nguoi_tao = relationship("NGUOIDUNG", backref="baocaos")