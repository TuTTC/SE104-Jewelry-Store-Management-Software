from models.DonHang import DonHang
from models.KhachHang import KhachHang
from database import db
from datetime import datetime
import random

def seed_donhang():
    try:
        if DonHang.query.first():
            print("Bang DONHANG da co du lieu, khong can seed.")
            return

        khachhangs = KhachHang.query.all()
        if not khachhangs:
            print("Khong tim thay khach hang de tao don hang.")
            return

        for i in range(5):
            khach = random.choice(khachhangs)
            donhang = DonHang(
                MaKH=khach.MaKH,
                NgayDat=datetime(2025, 6, 20 + i),
                TongTien=round(random.uniform(500000, 5000000), 2),
                TrangThai=random.choice(["Pending", "Paid", "Shipped", "Completed"])
            )
            db.session.add(donhang)

        db.session.commit()
        print("Da seed du lieu bang DONHANG.")
    except Exception as e:
        db.session.rollback()
        print(f"Loi khi seed DONHANG: {e}")