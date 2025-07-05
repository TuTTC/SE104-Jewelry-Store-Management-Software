from models.DichVu import DICHVU
from database import db

def seed_dichvu():
    if db.session.query(DICHVU).first():
        print("✅ Bảng DICHVU đã có dữ liệu, không cần seed.")
        return

    ds_dichvu = [
        DICHVU(TenDV="ThayDaQuy", DonGia=500000, MoTa="Thay đá quý theo yêu cầu", TrangThai=True),
        DICHVU(TenDV="CanThuVang", DonGia=100000, MoTa="Cân thử kiếm tra khối lượng vàng", TrangThai=True),
        DICHVU(TenDV="DanhBongVang", DonGia=200000, MoTa="Làm sáng bóng vàng cũ", TrangThai=True),
        DICHVU(TenDV="ChamKhacTheoYeuCau", DonGia=800000, MoTa="Khắc tên hoặc hình ảnh lên nhẫn", TrangThai=True),
        DICHVU(TenDV="GiaCongNuTrang", DonGia=350000, MoTa="Tăng size nhẫn theo tay khách", TrangThai=True),
    ]

    db.session.bulk_save_objects(ds_dichvu)
    db.session.commit()
    print("✅ Seed dữ liệu bảng DICHVU thành công.")
