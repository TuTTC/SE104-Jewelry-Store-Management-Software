from database import db
from models.DanhMucSanPham import DANHMUC
from decimal import Decimal

def seed_danh_muc():
    try:
        danh_muc_data = [
            {"TenDM": "Vòng tay", "DonViTinh": "Chiếc", "MoTa": "Các loại vòng tay vàng, bạc, đá quý...", "LoiNhuan": 15, "isDisabled": False},
            {"TenDM": "Nhẫn", "DonViTinh": "Chiếc", "MoTa": "Nhẫn vàng, bạc, đá quý các loại...", "LoiNhuan": 20, "isDisabled": False},
            {"TenDM": "Vòng cổ", "DonViTinh": "Sợi", "MoTa": "Dây chuyền, vòng cổ vàng, bạc, đá quý...", "LoiNhuan": 18, "isDisabled": False},
            {"TenDM": "Bông tai", "DonViTinh": "Đôi", "MoTa": "Bông tai vàng, bạc, đá quý...", "LoiNhuan": 12, "isDisabled": False},
            {"TenDM": "Đá quý", "DonViTinh": "Viên", "MoTa": "Các loại đá quý như ruby, sapphire, kim cương...", "LoiNhuan": 25, "isDisabled": False}
        ]

        for dm in danh_muc_data:
            existing_dm = DANHMUC.query.filter_by(TenDM=dm["TenDM"]).first()
            if existing_dm:
                existing_dm.MoTa = dm["MoTa"]
                existing_dm.DonViTinh = dm["DonViTinh"]
                existing_dm.PhanTramLoiNhuan = Decimal(dm["LoiNhuan"])
                existing_dm.isDisabled = dm["isDisabled"]
                print(f"Cập nhật danh mục '{dm['TenDM']}'.")
            else:
                danh_muc = DANHMUC(
                    TenDM=dm["TenDM"],
                    MoTa=dm["MoTa"],
                    DonViTinh=dm["DonViTinh"],
                    LoiNhuan=Decimal(dm["LoiNhuan"]),
                    isDisabled=dm["isDisabled"]
                )
                db.session.add(danh_muc)
                print(f"Đã thêm danh mục '{dm['TenDM']}'.")

        db.session.commit()
        print("Seed danh mục hoàn tất!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi:", e)
