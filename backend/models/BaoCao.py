from sqlalchemy import Column, Integer, Enum, Date, DateTime, DECIMAL, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from database import db

class BaoCao(db.Model):
    __tablename__ = "BAOCAO"

    MaBC          = Column(Integer, primary_key=True, autoincrement=True)
    LoaiBaoCao    = Column(Enum('Doanh thu', 'Tồn kho', 'Lợi nhuận'), nullable=False)
    ThoiGianBaoCao= Column(Date, nullable=False)
    DoanhThu      = Column(DECIMAL(14,2), nullable=False)
    MoTa          = Column(Text, nullable=True) 
    TaoNgay       = Column(DateTime, server_default=func.now())
    NguoiTao      = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)

    nguoi_tao     = relationship("NGUOIDUNG", backref="baocaos")
