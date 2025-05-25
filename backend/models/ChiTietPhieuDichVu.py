from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Date, String
from sqlalchemy.orm import relationship
from database import db

class CHITIETPHIEUDICHVU(db.Model):
    __tablename__ = "CHITIETPHIEUDICHVU"

    MaCT = Column(Integer, primary_key=True, autoincrement=True)
    MaPDV = Column(Integer, ForeignKey("PHIEUDICHVU.MaPDV"), nullable=False)
    MaDV = Column(Integer, ForeignKey("DICHVU.MaDV"), nullable=False)
    DonGiaDichVu = Column(DECIMAL(10, 2))
    DonGiaDuocTinh = Column(DECIMAL(10, 2))
    SoLuong = Column(Integer)
    ThanhTien = Column(DECIMAL(12, 2))
    TienTraTruoc = Column(DECIMAL(12, 2))
    TienConLai = Column(DECIMAL(12, 2))
    NgayGiao = Column(Date)
    TinhTrang = Column(String(255))

    # Quan hệ
    phieudichvu = relationship("PHIEUDICHVU", backref="chitietphieudichvu_list")
    dichvu = relationship("DICHVU", backref="chitietphieudichvu_list")
