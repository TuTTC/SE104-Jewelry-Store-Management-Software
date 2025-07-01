from models.NhaCungCap import NhaCungCap
from database import db
import random
from datetime import date, timedelta

def random_date(start_date, end_date):
    """Hàm random ngày hợp tác"""
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)



def seed_nhacungcap():
    try:
        ten_ncc_list = [
            "Nhà Cung Cấp Thái An",
            "Nhà Cung Cấp Bình Minh",
            "Nhà Cung Cấp Phú Quý",
            "Nhà Cung Cấp Kim Long",
            "Nhà Cung Cấp Hòa Phát",
            "Nhà Cung Cấp Tân Thành",
            "Nhà Cung Cấp An Phúc",
            "Nhà Cung Cấp Thành Đạt",
            "Nhà Cung Cấp Đại Lộc",
            "Nhà Cung Cấp Hưng Thịnh"
        ]

        email_list = [
            "nhacungcapthaian@gmail.com",
            "nhacungcapbinhminh@gmail.com",
            "nhacungcapphuquy@gmail.com",
            "nhacungcapkimlong@gmail.com",
            "nhacungcaphoaphat@gmail.com",
            "nhacungcaptanthanh@gmail.com",
            "nhacungcapanphuc@gmail.com",
            "nhacungcapthanhdat@gmail.com",
            "nhacungcapdailoc@gmail.com",
            "nhacungcaphungthinh@gmail.com"
        ]

        if NhaCungCap.query.first():
            print("✅ Bảng NHACUNGCAP đã có dữ liệu, không cần seed.")
            return


        for i, ten_ncc in enumerate(ten_ncc_list):
            existing_ncc = NhaCungCap.query.filter_by(TenNCC=ten_ncc).first()
            if not existing_ncc:
                ncc = NhaCungCap(
                    TenNCC=ten_ncc,
                    DiaChi=random.choice([
                        "Quận 1, TP. Hồ Chí Minh",
                        "Quận Bình Thạnh, TP. Hồ Chí Minh",
                        "Huyện Củ Chi, TP. Hồ Chí Minh",
                        "Quận Hoàn Kiếm, Hà Nội",
                        "Quận Thanh Xuân, Hà Nội",
                        "TP. Vũng Tàu",
                        "TP. Biên Hòa",
                        "TP. Thủ Dầu Một",
                        "TP. Long Xuyên",
                        "TP. Cần Thơ"
                    ]),
                    SoDienThoai=f"090{random.randint(1000000,9999999)}",
                    Email=email_list[i],
                    NgayHopTac=random_date(date(2015, 1, 1), date.today()),
                    GhiChu=random.choice(["", "Đối tác lâu năm", "Ưu tiên giao dịch"])
                )
                db.session.add(ncc)
                print(f"Đã thêm nhà cung cấp '{ten_ncc}'.")

        db.session.commit()
        print("Seed nhà cung cấp hoàn tất!")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed nhà cung cấp: {e}")