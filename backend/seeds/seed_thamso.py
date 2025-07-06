from database import db
from models.ThamSo import THAMSO

def seed_thamso():
    thamso_data = [
        # Sản phẩm - phần trăm lợi nhuận
        {"TenThamSo": "Tỉ lệ trả trước", "GiaTri": "50", "MoTa": "Tiền trả trước không được nhỏ hơn 50%"},
    ]
    if not THAMSO.query.first():
        for ts in thamso_data:
            existing = THAMSO.query.filter_by(TenThamSo=ts["TenThamSo"]).first()
            if not existing:
                db.session.add(THAMSO(**ts))
        db.session.commit()
        print("Seed tham số thành công!")