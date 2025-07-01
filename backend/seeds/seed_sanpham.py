from models.SanPham import SANPHAM
from database import db
import random

def seed_sanpham():
    try:
        # Lấy danh sách nhà cung cấp từ DB
        from models.NhaCungCap import NhaCungCap
        nha_cung_cap_list = NhaCungCap.query.all()

        if not nha_cung_cap_list:
            print("Vui lòng seed nhà cung cấp trước!")
            return

        if SANPHAM.query.first():
            print("✅ Bảng SANPHAM đã có dữ liệu, không cần seed.")
            return

        sanpham_data = [
            # Vòng tay
            {"TenSP": "Vòng tay vàng 24K", "MaDM": 1, "MoTa": "Vòng tay vàng 24K cao cấp", "HinhAnh": "https://example.com/vongtay1.jpg"},
            {"TenSP": "Vòng tay bạc nữ tính", "MaDM": 1, "MoTa": "Vòng tay bạc thời trang", "HinhAnh": "https://example.com/vongtay2.jpg"},
            
            # Nhẫn
            {"TenSP": "Nhẫn kim cương sang trọng", "MaDM": 2, "MoTa": "Nhẫn kim cương tinh xảo", "HinhAnh": "https://example.com/nhan1.jpg"},
            {"TenSP": "Nhẫn bạc đơn giản", "MaDM": 2, "MoTa": "Nhẫn bạc kiểu dáng thanh lịch", "HinhAnh": "https://example.com/nhan2.jpg"},
            
            # Vòng cổ
            {"TenSP": "Vòng cổ vàng trắng", "MaDM": 3, "MoTa": "Vòng cổ vàng trắng sang trọng", "HinhAnh": "https://example.com/vongco1.jpg"},
            {"TenSP": "Dây chuyền bạc đính đá", "MaDM": 3, "MoTa": "Dây chuyền bạc đính đá thời trang", "HinhAnh": "https://example.com/vongco2.jpg"},
            
            # Bông tai
            {"TenSP": "Bông tai vàng 24K", "MaDM": 4, "MoTa": "Bông tai vàng tinh tế", "HinhAnh": "https://example.com/bongtai1.jpg"},
            {"TenSP": "Bông tai bạc đính đá", "MaDM": 4, "MoTa": "Bông tai bạc sang trọng", "HinhAnh": "https://example.com/bongtai2.jpg"},
            
            # Đá quý
            {"TenSP": "Đá quý Ruby thiên nhiên", "MaDM": 5, "MoTa": "Đá Ruby tự nhiên chất lượng cao", "HinhAnh": "https://example.com/daquy1.jpg"},
            {"TenSP": "Đá Sapphire xanh biển", "MaDM": 5, "MoTa": "Đá Sapphire xanh cao cấp", "HinhAnh": "https://example.com/daquy2.jpg"},
        ]

        if not SANPHAM.query.first():
            for sp in sanpham_data:
                sp_obj = SANPHAM(
                    TenSP=sp["TenSP"],
                    MaDM=sp["MaDM"],
                    MaNCC=random.choice(nha_cung_cap_list).MaNCC,
                    GiaBan=0,  # Set giá bán = 0
                    SoLuongTon=random.randint(10, 100),
                    MoTa=sp["MoTa"],
                    HinhAnh=sp["HinhAnh"]
                )
                db.session.add(sp_obj)

            db.session.commit()
            print("Seed sản phẩm thành công!")

    except Exception as e:
        db.session.rollback()
        print("Lỗi khi seed sản phẩm:", e)