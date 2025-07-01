import random
from datetime import datetime
from models.KhachHang import KhachHang
from models.NguoiDung import NGUOIDUNG
from database import db

def seed_khachhang():
    try:
        if KhachHang.query.first():
            print("✅ Bảng KHACHHANG đã có dữ liệu, không cần seed.")
            return

        users = NGUOIDUNG.query.filter_by(MaVaiTro=1).all()  # Giả định 1 là vai trò Khách hàng
        if not users:
            print("⚠️ Không có người dùng với vai trò khách hàng.")
            return

        ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng"]
        ten_list = ["An", "Bình", "Hòa", "Dũng", "Lan", "Trang"]
        dia_chi_list = [
            "123 Đường A, Quận 1, TP.HCM",
            "456 Đường B, Quận 3, TP.HCM",
            "789 Đường C, Quận 5, TP.HCM",
        ]

        for user in users:
            kh = KhachHang(
                UserID=user.UserID,
                HoTen=f"{random.choice(ho_list)} {random.choice(ten_list)}",
                SoDienThoai=f"09{random.randint(10000000, 99999999)}",
                DiaChi=random.choice(dia_chi_list),
                NgayDangKy=datetime.now()
            )
            db.session.add(kh)

        db.session.commit()
        print(f"✅ Đã seed {len(users)} khách hàng thành công.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi seed KHACHHANG: {e}")
