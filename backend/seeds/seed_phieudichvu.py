# from models.PhieuDichVu import PHIEUDICHVU
# from models.NguoiDung import NGUOIDUNG
# from database import db
# from datetime import datetime, timedelta
# import random

def cap_nhat_trang_thai_phieu(ma_pdv):
    phieu = PHIEUDICHVU.query.get(ma_pdv)
    if not phieu:
        return

    da_giao_het = all(
        ct.TinhTrang == "Đã giao"
        for ct in phieu.chitietphieudichvu_list
    )

    phieu.TrangThai = "Hoàn thành" if da_giao_het else "Chưa hoàn thành"
    db.session.commit()

def cap_nhat_trang_thai_tat_ca_phieu():
    try:
        danh_sach_phieu = PHIEUDICHVU.query.all()
        if not danh_sach_phieu:
            print("Không có phiếu dịch vụ nào trong hệ thống.")
            return

        for phieu in danh_sach_phieu:
            if not phieu.chitietphieudichvu_list:
                continue  # Nếu phiếu chưa có chi tiết thì bỏ qua

            da_giao_het = all(
                ct.TinhTrang == "Đã giao"
                for ct in phieu.chitietphieudichvu_list
            )

            phieu.TrangThai = "Hoàn thành" if da_giao_het else "Chưa hoàn thành"

        db.session.commit()
        print("Đã cập nhật trạng thái tất cả phiếu dịch vụ.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi cập nhật trạng thái phiếu dịch vụ:", e)

# def seed_phieu_dich_vu():
#     try:
#         # Lọc người dùng có vai trò là Khách hàng và trạng thái hoạt động
#         khach_hang_list = NGUOIDUNG.query.filter_by(VaiTro="Khách hàng", TrangThai=True).all()
        
#         if not khach_hang_list:
#             print("Không có người dùng nào có vai trò 'Khách hàng' và trạng thái hoạt động.")
#             return

#         for kh in khach_hang_list:
#             so_phieu = random.randint(1, 6)  # Mỗi khách có thể có 1–2 phiếu
#             for _ in range(so_phieu):
#                 ngay_lap = datetime.now() - timedelta(days=random.randint(0, 30))
#                 tong_tien = round(random.uniform(500_000, 5_000_000), 2)
                
#                 tra_truoc = round(tong_tien * random.uniform(0.5, 1.0), 2)

#                 ghi_chu = random.choice([
#                     "", 
#                     "Khách yêu cầu giao sớm", 
#                     "Sản phẩm cần đóng gói cẩn thận", 
#                     "Đã liên hệ khách"
#                 ])

#                 phieu = PHIEUDICHVU(
#                     UserID=kh.UserID,
#                     NgayLap=ngay_lap,
#                     TongTien=tong_tien,
#                     TraTruoc=tra_truoc,
#                     GhiChu=ghi_chu,
#                     TrangThai="Chưa hoàn thành"
#                 )

#                 db.session.add(phieu)

#         db.session.commit()
#         print("Seed dữ liệu bảng PHIEUDICHVU thành công.")
#     except Exception as e:
#         db.session.rollback()
#         print("Lỗi khi seed phiếu dịch vụ:", str(e))


import random
from datetime import datetime, timedelta
from database import db
from models.PhieuDichVu import PHIEUDICHVU
from models.ChiTietPhieuDichVu import CHITIETPHIEUDICHVU
from models.NguoiDung import NGUOIDUNG
from models.DichVu import DICHVU
from models.VaiTro import VAITRO

def seed_phieudichvu():
    try:
        # Chỉ lấy người dùng là khách hàng và đang hoạt động
        # Lọc người dùng có vai trò "Khách hàng" và trạng thái hoạt động
        khach_hangs = db.session.query(NGUOIDUNG).join(VAITRO).filter(
            VAITRO.TenVaiTro == "Khách hàng",
            NGUOIDUNG.TrangThai == True
        ).all()
        # Chỉ lấy dịch vụ đang hoạt động
        dich_vus = DICHVU.query.filter_by(TrangThai=True).all()

        if not khach_hangs or not dich_vus:
            print("Chưa có dữ liệu người dùng (vai trò khách hàng) hoặc dịch vụ hoạt động.")
            return

        if PHIEUDICHVU.query.first():
            print("Bảng PHIEUDICHVU đã có dữ liệu, không cần seed.")
            return

        for _ in range(60):  # Seed khoảng 60 phiếu dịch vụ
            kh = random.choice(khach_hangs)
            dv = random.choice(dich_vus)

            so_luong = random.randint(1, 5)
            don_gia = float(dv.DonGia)
            chi_phi_rieng = round(random.uniform(0, don_gia * 0.2), 2)
            don_gia_duoc_tinh = round(don_gia + chi_phi_rieng, 2)
            thanh_tien = round(don_gia_duoc_tinh * so_luong, 2)
            tien_tra_truoc = round(thanh_tien * random.uniform(0.5, 0.9), 2)
            tien_con_lai = round(thanh_tien - tien_tra_truoc, 2)
            ngay_lap = datetime.today() - timedelta(days=random.randint(30, 400))
            ngay_giao = ngay_lap + timedelta(days=random.randint(2, 10))
            tinh_trang = random.choice(["Đã giao", "Chưa giao"])

            # Tạo phiếu dịch vụ
            pdv = PHIEUDICHVU(
                UserID=kh.UserID,
                NgayLap=ngay_lap,
                TongTien=thanh_tien,
                TraTruoc=tien_tra_truoc,
                TrangThai="Chờ xử lý"
            )
            db.session.add(pdv)
            db.session.flush()  # Lấy MaPDV tự tăng

            # Tạo chi tiết phiếu dịch vụ
            ct = CHITIETPHIEUDICHVU(
                MaPDV=pdv.MaPDV,
                MaDV=dv.MaDV,
                DonGiaDichVu=don_gia,
                ChiPhiRieng=chi_phi_rieng,
                DonGiaDuocTinh=don_gia_duoc_tinh,
                SoLuong=so_luong,
                ThanhTien=thanh_tien,
                TienTraTruoc=tien_tra_truoc,
                TienConLai=tien_con_lai,
                NgayGiao=ngay_giao,
                TinhTrang=tinh_trang
            )
            db.session.add(ct)

        db.session.commit()
        print("Đã seed PHIEUDICHVU và CHITIETPHIEUDICHVU thành công.")
        cap_nhat_trang_thai_tat_ca_phieu()
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed PHIEUDICHVU:", e)
