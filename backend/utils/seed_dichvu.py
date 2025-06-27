from models import DichVu
from database import db

def seed_dichvu():
    if db.session.query(DichVu).first():
        print("✅ Bảng DICHVU đã có dữ liệu, không cần seed.")
        return

    ds_dichvu = [
        DichVu(TenDV="Thay đá quý", DonGia=500000, MoTa="Thay đá quý theo yêu cầu", TrangThai=True),
        DichVu(TenDV="Đánh bóng vàng", DonGia=200000, MoTa="Làm sáng bóng vàng cũ", TrangThai=True),
        DichVu(TenDV="Chạm khắc theo yêu cầu", DonGia=800000, MoTa="Khắc tên hoặc hình ảnh lên nhẫn", TrangThai=True),
        DichVu(TenDV="Mở rộng nhẫn", DonGia=350000, MoTa="Tăng size nhẫn theo tay khách", TrangThai=True),
        DichVu(TenDV="Thu nhỏ lắc", DonGia=300000, MoTa="Thu nhỏ lắc tay hoặc lắc chân", TrangThai=True),
        DichVu(TenDV="Gắn đá kim cương", DonGia=1200000, MoTa="Gắn đá kim cương nhân tạo lên sản phẩm", TrangThai=False),
    ]

    db.session.bulk_save_objects(ds_dichvu)
    db.session.commit()
    print("✅ Seed dữ liệu bảng DICHVU thành công.")
