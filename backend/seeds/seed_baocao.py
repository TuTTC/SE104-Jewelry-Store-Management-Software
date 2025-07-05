from models.BaoCao import BAOCAO
from models.NguoiDung import NGUOIDUNG
from database import db
from datetime import datetime, timedelta
import random

def seed_bao_cao():
    try:
        nguoi_dung_list = NGUOIDUNG.query.filter(NGUOIDUNG.MaVaiTro.in_([2, 3])).all()
        if not nguoi_dung_list:
            print("⚠️ Không có người dùng nào có vai trò admin hoặc nhân viên.")
            return

        loai_bao_cao_list = ['Doanh thu', 'Tồn kho', 'Lợi nhuận']
        
        for _ in range(10):
            loai = random.choice(loai_bao_cao_list)
            den_ngay = datetime.now().date() - timedelta(days=random.randint(0, 10))
            tu_ngay = den_ngay - timedelta(days=random.randint(3, 10))
            mo_ta = f"Báo cáo {loai.lower()} từ {tu_ngay} đến {den_ngay}"
            nguoi_tao = random.choice(nguoi_dung_list).UserID

            bc = BAOCAO(
                LoaiBaoCao = loai,
                TuNgay     = tu_ngay,
                DenNgay    = den_ngay,
                MoTa       = mo_ta,
                NguoiTao   = nguoi_tao
            )
            db.session.add(bc)

        db.session.commit()
        print("Seed bảng BAOCAO thành công.")
    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed báo cáo:", str(e))
