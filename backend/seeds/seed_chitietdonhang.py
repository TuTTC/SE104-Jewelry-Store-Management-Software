from models.ChiTietDonHang import ChiTietDonHang
from models.DonHang import DonHang
from models.SanPham import SANPHAM
from database import db
import random

def seed_chitietdonhang():
    try:
        # Nếu đã có dữ liệu chi tiết đơn hàng → bỏ qua
        if ChiTietDonHang.query.first():
            print("✅ Bảng CHITIETDONHANG đã có dữ liệu, không cần seed.")
            return

        # Lấy dữ liệu đơn hàng và sản phẩm
        donhangs = DonHang.query.all()
        sanphams = SANPHAM.query.all()

        if not donhangs or not sanphams:
            print("⚠️ Chưa có dữ liệu trong bảng DONHANG hoặc SANPHAM.")
            return

        for dh in donhangs:
            # Mỗi đơn có 1–3 sản phẩm
            so_san_pham = random.randint(1, 3)
            sanphams_chon = random.sample(sanphams, min(so_san_pham, len(sanphams)))

            for sp in sanphams_chon:
                so_luong = random.randint(1, 5)
                gia_ban = float(sp.GiaBan)
                thanh_tien = round(gia_ban * so_luong, 2)

                ct = ChiTietDonHang(
                    MaDH=dh.MaDH,
                    MaSP=sp.MaSP,
                    SoLuong=so_luong,
                    GiaBan=gia_ban,
                    ThanhTien=thanh_tien
                )
                db.session.add(ct)

        db.session.commit()
        print("✅ Đã seed bảng CHITIETDONHANG thành công.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi seed CHITIETDONHANG: {e}")
