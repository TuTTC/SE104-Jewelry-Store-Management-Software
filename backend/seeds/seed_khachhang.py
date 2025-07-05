from models.KhachHang import KHACHHANG
from models.NguoiDung import NGUOIDUNG
from database import db
from datetime import datetime

def seed_khach_hang():
    try:
        khach_hang_users = NGUOIDUNG.query.filter_by(MaVaiTro=1).all()

        if not khach_hang_users:
            print("Không có người dùng nào có vai trò KHÁCH HÀNG (MaVaiTro = 1).")
            return

        for user in khach_hang_users:
            existing = KHACHHANG.query.filter_by(UserID=user.UserID).first()
            if existing:
                continue

            kh = KHACHHANG(
                UserID = user.UserID,
                HoTen = user.HoTen,
                SoDienThoai = user.SoDienThoai,
                DiaChi = user.DiaChi or "Chưa cập nhật",
                NgayDangKy = datetime.now()
            )
            db.session.add(kh)

        db.session.commit()
        print("Seed bảng KHACHHANG thành công.")

    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed KHACHHANG:", str(e))
