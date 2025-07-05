from models.SanPham import SANPHAM
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from database import db
from sqlalchemy import func

def cap_nhat_so_luong_ton_cho_toan_bo_san_pham():
    try:
        # Lặp qua toàn bộ sản phẩm
        san_pham_list = SANPHAM.query.all()

        for sp in san_pham_list:
            # Tính tổng số lượng nhập của sản phẩm này từ ChiTietPhieuNhap
            tong_nhap = db.session.query(func.sum(CHITIETPHIEUNHAP.SoLuong)).filter_by(MaSP=sp.MaSP).scalar() or 0

            # Cập nhật lại SoLuongTon
            sp.SoLuongTon = tong_nhap

        db.session.commit()
        print("Cập nhật số lượng tồn cho toàn bộ sản phẩm thành công!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi khi cập nhật số lượng tồn:", e)
