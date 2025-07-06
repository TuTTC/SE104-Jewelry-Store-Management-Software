from models.PhieuDichVu import PHIEUDICHVU
from models.DichVu import DICHVU
from models.ChiTietPhieuDichVu import CHITIETPHIEUDICHVU
from database import db
from datetime import datetime, timedelta
import random

def seed_chi_tiet_phieu_dich_vu():
    try:
        danh_sach_phieu = PHIEUDICHVU.query.all()
        danh_sach_dich_vu = DICHVU.query.filter_by(IsDisable=False).all()

        if not danh_sach_phieu:
            print("Bảng PHIEUDICHVU rỗng, cần seed phiếu dịch vụ trước.")
            return

        if not danh_sach_dich_vu:
            print("Bảng DICHVU rỗng, cần seed dịch vụ trước.")
            return

        for phieu in danh_sach_phieu:
            tong_tien_phieu = 0
            so_dv = random.randint(1, 3)
            dich_vu_duoc_chon = random.sample(danh_sach_dich_vu, min(so_dv, len(danh_sach_dich_vu)))

            for dv in dich_vu_duoc_chon:
                don_gia_dv = float(dv.DonGia)
                chi_phi_rieng = round(random.uniform(0, 500_000), 2)  # Có thể là 0
                don_gia_tinh = round(don_gia_dv + chi_phi_rieng, 2)
                so_luong = random.randint(1, 5)
                thanh_tien = round(don_gia_tinh * so_luong, 2)
                # Đảm bảo trả trước ≥ 50% × Thành tiền
                tien_tra_truoc = round(random.uniform(0.5, 1.0) * thanh_tien, 2)
                tien_con_lai = round(thanh_tien - tien_tra_truoc, 2)
                ngay_giao = datetime.now().date() + timedelta(days=random.randint(1, 10))
                tinh_trang = random.choice(["Đã giao", "Chưa giao"])

                ct = CHITIETPHIEUDICHVU(
                    MaPDV=phieu.MaPDV,
                    MaDV=dv.MaDV,
                    DonGiaDichVu=don_gia_dv,
                    ChiPhiRieng=chi_phi_rieng,
                    DonGiaDuocTinh=don_gia_tinh,
                    SoLuong=so_luong,
                    ThanhTien=thanh_tien,
                    TienTraTruoc=tien_tra_truoc,
                    TienConLai=tien_con_lai,
                    NgayGiao=ngay_giao,
                    TinhTrang=tinh_trang
                )
                db.session.add(ct)
                tong_tien_phieu += thanh_tien

            # Cập nhật tổng tiền và trả trước cho phiếu
            phieu.TongTien = round(tong_tien_phieu, 2)
            phieu.TraTruoc = round(random.uniform(0.5, 1.0) * tong_tien_phieu, 2)

            # Cập nhật trạng thái phiếu theo QĐ4
            all_giao = all(
                ct.TinhTrang == "Đã giao" for ct in phieu.chitietphieudichvu_list
            )
            phieu.TrangThai = "Hoàn thành" if all_giao else "Chưa hoàn thành"

        db.session.commit()
        print("Seed chi tiết phiếu dịch vụ thành công.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed chi tiết phiếu dịch vụ:", str(e))
