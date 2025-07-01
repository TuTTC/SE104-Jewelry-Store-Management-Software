from models.ThamSo import THAMSO
from models.SanPham import SANPHAM
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.DanhMucSanPham import DANHMUC
from database import db
from sqlalchemy import desc
from decimal import Decimal

def cap_nhat_gia_ban_cho_toan_bo_san_pham():
    try:
        san_pham_list = SANPHAM.query.all()
        danh_muc_map = {dm.MaDM: dm.TenDM for dm in DANHMUC.query.all()}

        # Ánh xạ Tên Danh Mục sang Tên Tham Số lợi nhuận
        tham_so_map = {
            "Vòng tay": "LoiNhuan_VongTay",
            "Nhẫn": "LoiNhuan_Nhan",
            "Vòng cổ": "LoiNhuan_DayChuyen",
            "Bông tai": "LoiNhuan_KhuyenTai",
            "Đá quý": "LoiNhuan_DaQuy",
        }

        for sp in san_pham_list:
            ten_dm = danh_muc_map.get(sp.MaDM)
            if not ten_dm:
                print(f"Sản phẩm {sp.TenSP} không xác định được Danh Mục!")
                continue

            ten_tham_so = tham_so_map.get(ten_dm)
            if not ten_tham_so:
                print(f"Thiếu ánh xạ tham số cho Danh Mục: {ten_dm}")
                continue

            tham_so = THAMSO.query.filter_by(TenThamSo=ten_tham_so).first()
            if not tham_so:
                print(f"Thiếu tham số {ten_tham_so} trong bảng ThamSo")
                continue

            # Lấy lần nhập gần nhất của sản phẩm
            ct_pn = CHITIETPHIEUNHAP.query.filter_by(MaSP=sp.MaSP).order_by(desc(CHITIETPHIEUNHAP.MaPN)).first()
            if not ct_pn:
                print(f"Sản phẩm {sp.TenSP} chưa từng được nhập, bỏ qua!")
                continue

            try:
                phan_tram_loi_nhuan = Decimal(tham_so.GiaTri)
            except:
                print(f"Tham số {ten_tham_so} có giá trị không hợp lệ: {tham_so.GiaTri}")
                continue

            gia_ban = ct_pn.DonGiaNhap + (ct_pn.DonGiaNhap * phan_tram_loi_nhuan / Decimal(100))
            sp.GiaBan = gia_ban.quantize(Decimal('1'))  # Làm tròn đến số nguyên nếu cần

        db.session.commit()
        print("Cập nhật giá bán thành công!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi khi cập nhật giá bán:", e)
