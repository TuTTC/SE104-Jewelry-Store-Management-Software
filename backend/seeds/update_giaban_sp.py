from models.SanPham import SANPHAM
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.DanhMucSanPham import DANHMUC
from database import db
from sqlalchemy import desc
from decimal import Decimal

def cap_nhat_gia_ban_cho_toan_bo_san_pham():
    try:
        san_pham_list = SANPHAM.query.all()

        # Tạo map MaDM -> PhanTramLoiNhuan
        danh_muc_map = {dm.MaDM: Decimal(dm.PhanTramLoiNhuan) for dm in DANHMUC.query.all()}

        for sp in san_pham_list:
            phan_tram_loi_nhuan = danh_muc_map.get(sp.MaDM)
            if phan_tram_loi_nhuan is None:
                print(f"Sản phẩm {sp.TenSP} không xác định được PhanTramLoiNhuan, bỏ qua!")
                continue

            # Lấy lần nhập gần nhất của sản phẩm
            ct_pn = CHITIETPHIEUNHAP.query.filter_by(MaSP=sp.MaSP).order_by(desc(CHITIETPHIEUNHAP.MaPN)).first()
            if not ct_pn:
                print(f"Sản phẩm {sp.TenSP} chưa từng được nhập, bỏ qua!")
                continue

            gia_nhap = Decimal(ct_pn.DonGiaNhap)
            gia_ban = gia_nhap * (Decimal(1) + phan_tram_loi_nhuan / Decimal(100))
            sp.GiaBan = gia_ban.quantize(Decimal('1'))  # Làm tròn đến số nguyên nếu cần

        db.session.commit()
        print("Cập nhật giá bán thành công!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi khi cập nhật giá bán:", e)
