from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Date, String, CheckConstraint
from sqlalchemy.orm import relationship, validates
from database import db

class CHITIETPHIEUDICHVU(db.Model):
    __tablename__ = "CHITIETPHIEUDICHVU"

    MaCT = Column(Integer, primary_key=True, autoincrement=True)
    MaPDV = Column(Integer, ForeignKey("PHIEUDICHVU.MaPDV"), nullable=False)
    MaDV = Column(Integer, ForeignKey("DICHVU.MaDV"), nullable=False)

    DonGiaDichVu = Column(DECIMAL(10, 2), nullable=False)       # Giá gốc lúc lập phiếu
    ChiPhiRieng = Column(DECIMAL(10, 2), default=0)              # Chi phí riêng nếu có
    DonGiaDuocTinh = Column(DECIMAL(10, 2), nullable=False)     # = DonGiaDichVu + ChiPhiRieng

    SoLuong = Column(Integer, nullable=False)
    ThanhTien = Column(DECIMAL(12, 2), nullable=False)          # = SoLuong * DonGiaDuocTinh

    TienTraTruoc = Column(DECIMAL(12, 2), nullable=False)
    TienConLai = Column(DECIMAL(12, 2), nullable=False)

    NgayGiao = Column(Date)
    TinhTrang = Column(String(20), nullable=False)  # "Đã giao" hoặc "Chưa giao"

    # Ràng buộc: Trả trước phải >= 50% thành tiền
    __table_args__ = (
        CheckConstraint('TienTraTruoc >= 0.5 * ThanhTien', name='ck_tientratruoc_50_percent'),
    )

    phieudichvu = relationship("PHIEUDICHVU", back_populates="chitietphieudichvu_list")
    dichvu = relationship("DICHVU", backref="chitietphieudichvu_list")

    @validates('DonGiaDuocTinh', 'ThanhTien', 'TienConLai')
    def validate_derived_fields(self, key, value):
        # Có thể bổ sung kiểm tra chéo nếu cần
        return value
