from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, Text, String
from sqlalchemy.orm import relationship
from models.Relationships import baocao_phieudichvu
from database import db

class PHIEUDICHVU(db.Model):
    __tablename__ = "PHIEUDICHVU"

    MaPDV = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)
    NgayLap = Column(DateTime, nullable=False)
    TongTien = Column(DECIMAL(10, 2), nullable=False)
    TraTruoc = Column(DECIMAL(10, 2), default=0)
    GhiChu = Column(Text, nullable=True)

    # Mặc định là "Chưa hoàn thành" theo QĐ4
    TrangThai = Column(String(50), default='Chưa hoàn thành')

    # Quan hệ với bảng NGUOIDUNG
    khachhang = relationship("NGUOIDUNG", backref="phieudichvu")

    # Quan hệ chi tiết phiếu dịch vụ
    chitietphieudichvu_list = relationship(
        "CHITIETPHIEUDICHVU",
        back_populates="phieudichvu",
        cascade="all, delete-orphan"
    )

    # Nếu có quan hệ với báo cáo thì giữ nguyên phần này
    # bao_caos = relationship(
    #     "BAOCAO",
    #     secondary=baocao_phieudichvu,
    #     back_populates="phieu_dichvus"
    # )

    @property
    def trang_thai_thuc_te(self):
        if all(ct.TinhTrang == 'Đã giao' for ct in self.chitietphieudichvu_list):
            return "Hoàn thành"
        return "Chưa hoàn thành"
