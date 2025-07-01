from database import db
from models.DanhMucSanPham import DANHMUC

def seed_danh_muc():
    try:
        danh_muc_data = [
            {"TenDM": "Vòng tay", "MoTa": "Các loại vòng tay vàng, bạc, đá quý..."},
            {"TenDM": "Nhẫn", "MoTa": "Nhẫn vàng, bạc, đá quý các loại..."},
            {"TenDM": "Vòng cổ", "MoTa": "Dây chuyền, vòng cổ vàng, bạc, đá quý..."},
            {"TenDM": "Bông tai", "MoTa": "Bông tai vàng, bạc, đá quý..."},
            {"TenDM": "Đá quý", "MoTa": "Các loại đá quý như ruby, sapphire, kim cương..."}
        ]


#         existing_count = DANHMUC.query.count()
#         if existing_count >= len(danh_muc_data):
#             print("✅ Bảng DANHMUC đã có dữ liệu, không cần seed.")
#             return

#         for dm in danh_muc_data:
#             existing_dm = DANHMUC.query.filter_by(TenDM=dm["TenDM"]).first()
#             if existing_dm:
#                 existing_dm.MoTa = dm["MoTa"]  # Cập nhật mô tả mới nếu cần
#                 print(f"🔄 Cập nhật mô tả cho danh mục '{dm['TenDM']}'.")
#             else:
#                 danh_muc = DANHMUC(TenDM=dm["TenDM"], MoTa=dm["MoTa"])
#                 db.session.add(danh_muc)
#                 print(f"➕ Đã thêm danh mục '{dm['TenDM']}'.")

#         db.session.commit()
#         print("✅ Seed bảng DANHMUC hoàn tất!")

#     except Exception as e:
#         db.session.rollback()
#         print("❌ Lỗi khi seed DANHMUC:", e)

        if not DANHMUC.query.first():
            for dm in danh_muc_data:
                existing_dm = DANHMUC.query.filter_by(TenDM=dm["TenDM"]).first()
                if existing_dm:
                    existing_dm.MoTa = dm["MoTa"]  # Cập nhật mô tả mới
                    print(f"Cập nhật mô tả cho danh mục '{dm['TenDM']}'.")
                else:
                    danh_muc = DANHMUC(TenDM=dm["TenDM"], MoTa=dm["MoTa"])
                    db.session.add(danh_muc)
                    print(f"Đã thêm danh mục '{dm['TenDM']}'.")

        db.session.commit()
        print("Seed danh mục hoàn tất!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi:", e)

