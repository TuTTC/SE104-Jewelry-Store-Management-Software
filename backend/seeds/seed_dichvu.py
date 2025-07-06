from models.DichVu import DICHVU
from database import db

def seed_dichvu():
    if db.session.query(DICHVU).first():
        print("Bảng DICHVU đã có dữ liệu, không cần seed.")
        return

    ds_dichvu = [
        DICHVU(TenDV="Thay Đá Quý", DonGia=500000, MoTa="Thay đá quý theo yêu cầu", TrangThai=True, IsDisable=False),
        DICHVU(TenDV="Cân Thử Vàng", DonGia=100000, MoTa="Cân thử kiểm tra khối lượng vàng", TrangThai=True, IsDisable=False),
        DICHVU(TenDV="Đánh Bóng Vàng", DonGia=200000, MoTa="Làm sáng bóng vàng cũ", TrangThai=True, IsDisable=False),
        DICHVU(TenDV="Chạm Khắc Theo Yêu Cầu", DonGia=800000, MoTa="Khắc tên hoặc hình ảnh lên nhẫn", TrangThai=True, IsDisable=False),
        DICHVU(TenDV="Gia Công Nữ Trang", DonGia=350000, MoTa="Tăng size nhẫn theo tay khách", TrangThai=True, IsDisable=False),
    ]

    db.session.bulk_save_objects(ds_dichvu)
    db.session.commit()
    print("Seed dữ liệu bảng DICHVU thành công.")
