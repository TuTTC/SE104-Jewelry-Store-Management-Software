from database import db
from models.ThamSo import THAMSO

def seed_thamso():
    thamso_data = [
        # Sản phẩm - phần trăm lợi nhuận
        {"TenThamSo": "LoiNhuan_Nhan", "GiaTri": "5", "MoTa": "Lợi nhuận (%) cho nhẫn"},
        {"TenThamSo": "LoiNhuan_VongTay", "GiaTri": "4", "MoTa": "Lợi nhuận (%) cho vòng tay"},
        {"TenThamSo": "LoiNhuan_KhuyenTai", "GiaTri": "3", "MoTa": "Lợi nhuận (%) cho khuyên tai"},
        {"TenThamSo": "LoiNhuan_DayChuyen", "GiaTri": "6", "MoTa": "Lợi nhuận (%) cho dây chuyền"},
        {"TenThamSo": "LoiNhuan_DaQuy", "GiaTri": "7", "MoTa": "Lợi nhuận (%) cho đá quý"},

        # Dịch vụ - phần trăm phụ thu
        {"TenThamSo": "PhuThu_ThayDaQuy", "GiaTri": "2", "MoTa": "Phụ thu (%) cho thay đá quý"},
        {"TenThamSo": "PhuThu_CanVang", "GiaTri": "1", "MoTa": "Phụ thu (%) cho cân thử vàng"},
        {"TenThamSo": "PhuThu_DanhBong", "GiaTri": "3", "MoTa": "Phụ thu (%) cho đánh bóng vàng"},
        {"TenThamSo": "PhuThu_ChamKhac", "GiaTri": "4", "MoTa": "Phụ thu (%) cho chạm khắc theo yêu cầu"},
        {"TenThamSo": "PhuThu_MoRongNhan", "GiaTri": "2", "MoTa": "Phụ thu (%) mở rộng nhẫn"},
        {"TenThamSo": "PhuThu_ThuNhoLac", "GiaTri": "2", "MoTa": "Phụ thu (%) thu nhỏ lắc"},
        {"TenThamSo": "PhuThu_GanDaKimCuong", "GiaTri": "5", "MoTa": "Phụ thu (%) gắn đá kim cương"},
    ]
    if not THAMSO.query.first():
        for ts in thamso_data:
            existing = THAMSO.query.filter_by(TenThamSo=ts["TenThamSo"]).first()
            if not existing:
                db.session.add(THAMSO(**ts))
        db.session.commit()
        print("Seed tham số thành công!")