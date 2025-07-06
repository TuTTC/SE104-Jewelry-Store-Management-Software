from models.DonHang import DONHANG
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from database import db
from datetime import datetime, timedelta
import random

def seed_don_hang():
    try:
        # Tìm vai trò Khách hàng
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()
        if not khachhang_role:
            print("Chưa có vai trò 'Khách hàng', hãy seed VAITRO trước.")
            return

        # Lấy danh sách người dùng là Khách hàng, trạng thái hoạt động
        khach_hang_list = NGUOIDUNG.query.filter_by(MaVaiTro=khachhang_role.MaVaiTro, TrangThai=True).all()

        if not khach_hang_list:
            print("Không có khách hàng hoạt động để seed đơn hàng.")
            return

        for kh in khach_hang_list:
            for _ in range(random.randint(1, 5)):
                ngay_dat = datetime.now() - timedelta(days=random.randint(0, 30))
                tong_tien = round(random.uniform(500_000, 5_000_000), 2)
                trang_thai = random.choice(["Pending", "Paid", "Shipped", "Completed"])

                don_hang = DONHANG(
                    UserID=kh.UserID,
                    NgayDat=ngay_dat,
                    TongTien=tong_tien,
                    TrangThai=trang_thai
                )
                db.session.add(don_hang)

        db.session.commit()
        print("✅ Đã seed đơn hàng thành công!")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi seed đơn hàng: {str(e)}")
