import random
from datetime import datetime
from database import db
from models.PhieuNhap import PHIEUNHAP
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.SanPham import SANPHAM
from models.NhaCungCap import NHACUNGCAP
from models.NguoiDung import NGUOIDUNG
from models.PhieuNhap import TrangThaiPhieuNhapEnum

def seed_phieu_nhap():
    try:
        ncc_list = NHACUNGCAP.query.all()
        sp_list = SANPHAM.query.all()
        user_list = NGUOIDUNG.query.all()
        random_user = random.choice(user_list)
        if not ncc_list or not sp_list:
            print("Vui lòng chắc chắn đã có dữ liệu nhà cung cấp và sản phẩm trước khi seed phiếu nhập!")
            return
        if not PHIEUNHAP.query.first():
            # Tạo 20 phiếu nhập
            for _ in range(20):
                ncc = random.choice(ncc_list)

                phieu = PHIEUNHAP(
                    MaNCC=ncc.MaNCC,
                    UserID=random_user.UserID,  # Giả sử user có ID = 1
                    NgayNhap=datetime.now(),
                    TongTien=0,
                    TrangThai= "da_nhap",
                    GhiChu=""
                )
                db.session.add(phieu)
                db.session.flush()  # Lấy MaPN sau khi insert

                tong_tien = 0
                so_luong_sp = random.randint(1, 5)
                sp_chon = random.sample(sp_list, k=so_luong_sp)  # Chọn ngẫu nhiên các sản phẩm không trùng

                for sp in sp_chon:
                    so_luong = random.randint(1, 20)
                    don_gia_nhap = random.randint(500000, 3000000)

                    sp.SoLuongTon += so_luong

                    ct = CHITIETPHIEUNHAP(
                        MaPN=phieu.MaPN,
                        MaSP=sp.MaSP,
                        SoLuong=so_luong,
                        DonGiaNhap=don_gia_nhap,
                        ThanhTien=so_luong * don_gia_nhap
                    )
                    db.session.add(ct)
                    tong_tien += so_luong * don_gia_nhap

                phieu.TongTien = tong_tien

            db.session.commit()
            print("Seed phiếu nhập thành công!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi seed dữ liệu:", e)
