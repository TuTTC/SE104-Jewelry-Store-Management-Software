from sqlalchemy import Column, Integer, Enum, Date, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from database import db

class BaoCao(db.Model):
    __tablename__ = "BAOCAO"

    MaBC = Column(Integer, primary_key=True, autoincrement=True)
    LoaiBaoCao = Column(Enum('Doanh thu', 'Tồn kho', 'Lợi nhuận'), nullable=False)
    ThoiGianBaoCao = Column(Date, nullable=False)
    DuLieu = Column(JSON, nullable=False)
    TaoNgay = Column(DateTime, server_default=func.now())
    NguoiTao = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)

    # Quan hệ: một báo cáo thuộc về một người dùng
    nguoi_tao = relationship("NGUOIDUNG", backref="baocaos")
