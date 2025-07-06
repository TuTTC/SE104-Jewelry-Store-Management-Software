from models.DonHang import DONHANG
from models.SanPham import SANPHAM
from models.ChiTietDonHang import CHITIETDONHANG
from database import db
import random

def seed_chi_tiet_don_hang():
    try:
        danh_sach_don_hang = DONHANG.query.all()
        danh_sach_san_pham = SANPHAM.query.filter_by(IsDisabled=False).all()

        if not danh_sach_don_hang or not danh_sach_san_pham:
            print("Cần seed đơn hàng và sản phẩm trước khi seed chi tiết đơn hàng.")
            return

        for dh in danh_sach_don_hang:
            tong_tien = 0
            so_luong_sp = random.randint(1, 5)
            san_pham_duoc_chon = random.sample(danh_sach_san_pham, min(so_luong_sp, len(danh_sach_san_pham)))

            for sp in san_pham_duoc_chon:
                so_luong = random.randint(1, 5)
                gia_ban = float(sp.GiaBan) if sp.GiaBan else round(random.uniform(100_000, 2_000_000), 2)
                thanh_tien = round(so_luong * gia_ban, 2)

                chi_tiet = CHITIETDONHANG(
                    MaDH=dh.MaDH,
                    MaSP=sp.MaSP,
                    SoLuong=so_luong,
                    GiaBan=gia_ban,
                    ThanhTien=thanh_tien
                )
                db.session.add(chi_tiet)
                tong_tien += thanh_tien

            dh.TongTien = round(tong_tien, 2)  # Cập nhật tổng tiền chính xác cho đơn hàng

        db.session.commit()
        print("Seed chi tiết đơn hàng thành công.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed chi tiết đơn hàng:", str(e))
