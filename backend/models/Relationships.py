from sqlalchemy import Column, Integer, ForeignKey, Table
from database import db

# Gán quyền theo vai trò
role_permissions = Table(
    "ROLE_PERMISSIONS",
    db.Model.metadata,
    Column("MaVaiTro", Integer, ForeignKey("VAITRO.MaVaiTro", ondelete="CASCADE"), primary_key=True),
    Column("PermissionID", Integer, ForeignKey("PERMISSIONS.PermissionID"), primary_key=True)
)


user_permissions = Table(
    "USER_PERMISSIONS",
    db.Model.metadata,
    Column("UserID", Integer, ForeignKey("NGUOIDUNG.UserID", ondelete="CASCADE"), primary_key=True),
    Column("PermissionID", Integer, ForeignKey("PERMISSIONS.PermissionID"), primary_key=True),
    Column("IsGranted", db.Boolean, nullable=False, default=True)  # Cột mới
)

# Liên kết báo cáo và đơn hàng
baocao_donhang = Table(
    "baocao_donhang",
    db.Model.metadata,
    Column("MaBC", Integer, ForeignKey("BAOCAO.MaBC"), primary_key=True),
    Column("MaDH", Integer, ForeignKey("DONHANG.MaDH"), primary_key=True)
)

# Liên kết báo cáo và phiếu dịch vụ
baocao_phieudichvu = Table(
    "baocao_phieudichvu",
    db.Model.metadata,
    Column("MaBC", Integer, ForeignKey("BAOCAO.MaBC"), primary_key=True),
    Column("MaPDV", Integer, ForeignKey("PHIEUDICHVU.MaPDV"), primary_key=True)
)

# Liên kết báo cáo và phiếu nhập (để phục vụ tính lợi nhuận)
baocao_phieunhap = Table(
    "baocao_phieunhap",
    db.Model.metadata,
    Column("MaBC", Integer, ForeignKey("BAOCAO.MaBC"), primary_key=True),
    Column("MaPN", Integer, ForeignKey("PHIEUNHAP.MaPN"), primary_key=True)
)