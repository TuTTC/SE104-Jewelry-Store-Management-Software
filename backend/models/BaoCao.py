from sqlalchemy import Column, Integer, Enum, Date, DateTime, String, ForeignKey, func
from models.Relationships import baocao_donhang, baocao_phieudichvu, baocao_phieunhap
from sqlalchemy.orm import relationship
from database import db

class BAOCAO(db.Model):
    __tablename__ = "BAOCAO"

    MaBC = Column(Integer, primary_key=True, autoincrement=True)
    LoaiBaoCao = Column(Enum('Doanh thu', 'Lợi nhuận', name="loaibaocao_enum"), nullable=False)
    TuNgay = Column(Date, nullable=False)
    DenNgay = Column(Date, nullable=False)
    MoTa = Column(String(255))
    TaoNgay = Column(DateTime, server_default=func.now())
    NguoiTao = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)

    # # Quan hệ với người tạo
    # nguoi_tao = relationship("NGUOIDUNG", back_populates="baocaos")

    # # Liên kết đơn hàng
    # don_hangs = relationship(
    #     "DONHANG",
    #     secondary=baocao_donhang,
    #     back_populates="bao_caos"
    # )

    # # Liên kết phiếu dịch vụ
    # phieu_dichvus = relationship(
    #     "PHIEUDICHVU",
    #     secondary=baocao_phieudichvu,
    #     back_populates="bao_caos"
    # )

    # # Liên kết phiếu nhập
    # phieu_nhaps = relationship(
    #     "PHIEUNHAP",
    #     secondary=baocao_phieunhap,
    #     back_populates="bao_caos"
    # )
