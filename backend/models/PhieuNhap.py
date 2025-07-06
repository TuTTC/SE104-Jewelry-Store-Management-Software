from sqlalchemy import Column, Integer, ForeignKey, DateTime, DECIMAL, Enum, Text, func
from sqlalchemy.orm import relationship
from models.Relationships import baocao_phieunhap
import enum
from database import db

class TrangThaiPhieuNhapEnum(enum.Enum):
    da_nhap = 'Đã nhập'
    dang_xu_ly = 'Đang xử lý'
    huy = 'Hủy'

class PHIEUNHAP(db.Model):
    __tablename__ = "PHIEUNHAP"

    MaPN = Column(Integer, primary_key=True, autoincrement=True)
    MaNCC = Column(Integer, ForeignKey("NHACUNGCAP.MaNCC"), nullable=False)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID", ondelete="CASCADE"), nullable=False)
    NgayNhap = Column(DateTime, server_default=func.now())
    TongTien = Column(DECIMAL(18, 2), default=0)
    TrangThai = Column(Enum(TrangThaiPhieuNhapEnum), nullable=False)
    GhiChu = Column(Text)

    # Quan hệ
    nhacungcap = relationship("NHACUNGCAP", backref="phieunhaps")
    nguoitao = relationship("NGUOIDUNG", backref="phieunhaps")

    def to_dict(self):
        return {
            "MaPN": self.MaPN,
            "MaNCC": self.MaNCC,
            "TenNCC": self.nhacungcap.TenNCC if self.nhacungcap else "",
            "UserID": self.UserID,
            "TenNguoiNhap": self.nguoitao.HoTen if self.nguoitao else "",
            "NgayNhap": self.NgayNhap.strftime("%Y-%m-%d") if self.NgayNhap else None,
            "TongTien": float(self.TongTien),
            "TrangThai": self.TrangThai.value if self.TrangThai else None,
            "GhiChu": self.GhiChu
        }

    # bao_caos = relationship(
    # "BAOCAO",
    # secondary=baocao_phieunhap,
    # back_populates="phieunhaps"
    # )