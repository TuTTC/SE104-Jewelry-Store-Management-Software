from models.DonHang import DONHANG
from models.KhachHang import KHACHHANG
from database import db
from datetime import datetime, timedelta
import random

def seed_don_hang():
    try:
        khach_hang_list = KHACHHANG.query.all()
        if not khach_hang_list:
            print("Bảng KHACHHANG rỗng, cần seed trước khi tạo đơn hàng.")
            return

        for kh in khach_hang_list:
            # Tạo 1–2 đơn hàng mỗi khách
            for _ in range(random.randint(1, 2)):
                ngay_dat = datetime.now() - timedelta(days=random.randint(0, 30))
                tong_tien = round(random.uniform(500_000, 5_000_000), 2)
                trang_thai = random.choice(["Pending", "Paid", "Shipped", "Completed"])

                don_hang = DONHANG(
                    MaKH=kh.MaKH,
                    NgayDat=ngay_dat,
                    TongTien=tong_tien,
                    TrangThai=trang_thai
                )
                db.session.add(don_hang)

        db.session.commit()
        print("Seed đơn hàng thành công.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed đơn hàng:", str(e))
