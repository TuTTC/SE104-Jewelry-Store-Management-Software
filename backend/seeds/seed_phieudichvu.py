from models.PhieuDichVu import PHIEUDICHVU
from models.KhachHang import KHACHHANG
from database import db
from datetime import datetime, timedelta
import random

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


def seed_phieu_dich_vu():
    try:
        khach_hang_list = KHACHHANG.query.all()
        if not khach_hang_list:
            print("Bảng KHACHHANG rỗng, cần seed trước khi tạo phiếu dịch vụ.")
            return

        for kh in khach_hang_list:
            so_phieu = random.randint(1, 2)  # Mỗi khách có thể có 1–2 phiếu
            for _ in range(so_phieu):
                ngay_lap = datetime.now() - timedelta(days=random.randint(0, 30))
                tong_tien = round(random.uniform(500_000, 5_000_000), 2)
                
                # Tối thiểu trả trước là 0, tối đa là toàn bộ
                tra_truoc = round(tong_tien * random.uniform(0.5, 1.0), 2)

                ghi_chu = random.choice([
                    "", 
                    "Khách yêu cầu giao sớm", 
                    "Sản phẩm cần đóng gói cẩn thận", 
                    "Đã liên hệ khách"
                ])

                # Gắn trạng thái hợp lệ ban đầu là "Chờ xử lý"
                phieu = PHIEUDICHVU(
                    MaKH=kh.MaKH,
                    NgayLap=ngay_lap,
                    TongTien=tong_tien,
                    TraTruoc=tra_truoc,
                    GhiChu=ghi_chu,
                    TrangThai="Chưa hoàn thành"  # QĐ4: Cập nhật sau dựa trên tình trạng giao dịch
                )

                db.session.add(phieu)

        db.session.commit()
        print("Seed dữ liệu bảng PHIEUDICHVU thành công.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed phiếu dịch vụ:", str(e))
