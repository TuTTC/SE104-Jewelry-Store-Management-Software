# import random
# from datetime import datetime
# from database import db
# from models import PhieuNhap, ChiTietPhieuNhap
# from models.SanPham import SANPHAM
# from models.NhaCungCap import NHACUNGCAP

# def seed_phieu_nhap():
#     try:
#         # Seed nhà cung cấp (tên bắt đầu T, kết thúc A)
#         for i in range(1, 6):
#             if not NHACUNGCAP.query.get(i):
#                 ncc = NHACUNGCAP(
#                     MaNCC=i,
#                     TenNCC= random.choice([
#                         "Nhà Cung Cấp Thái An",
#                         "Nhà Cung Cấp Bình Minh",
#                         "Nhà Cung Cấp Phú Quý",
#                         "Nhà Cung Cấp Kim Long",
#                         "Nhà Cung Cấp Hòa Phát",
#                         "Nhà Cung Cấp Tân Thành",
#                         "Nhà Cung Cấp An Phúc",
#                         "Nhà Cung Cấp Thành Đạt",
#                         "Nhà Cung Cấp Đại Lộc",
#                         "Nhà Cung Cấp Hưng Thịnh"
#                     ]),
#                     DiaChi=random.choice([
#                         "Quận 1, TP. Hồ Chí Minh",
#                         "Quận Bình Thạnh, TP. Hồ Chí Minh",
#                         "Huyện Củ Chi, TP. Hồ Chí Minh",
#                         "Quận Hoàn Kiếm, Hà Nội",
#                         "Quận Thanh Xuân, Hà Nội",
#                         "Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu",
#                         "Thành phố Biên Hòa, Đồng Nai",
#                         "Thành phố Thủ Dầu Một, Bình Dương",
#                         "Thành phố Long Xuyên, An Giang",
#                         "Thành phố Cần Thơ"
#                     ]),
#                     SDT=f"090{i}123456"
#                 )
#                 db.session.add(ncc)

#         # Seed sản phẩm thuộc danh mục Trang sức vàng bạc đá quý
#         for i in range(1, 11):
#             if not SANPHAM.query.get(i):
#                 sp = SANPHAM(
#                     MaSP=i,
#                     TenSP=random.choice([
#                         "Nhẫn Vàng 24K",
#                         "Vòng Tay Bạc",
#                         "Dây Chuyền Đá Quý",
#                         "Bông Tai Kim Cương",
#                         "Nhẫn Bạc Đính Đá",
#                         "Vòng Cổ Vàng",
#                         "Lắc Tay Bạc",
#                         "Bông Tai Ngọc Trai",
#                         "Dây Chuyền Vàng Trắng",
#                         "Nhẫn Đá Ruby"
#                     ]),
#                     MaDM=1,  # Danh mục trang sức vàng bạc đá quý
#                     MaNCC=random.randint(1, 5),
#                     GiaBan=random.randint(1000000, 5000000),
#                     SoLuongTon=0,
#                     MoTa="Sản phẩm trang sức cao cấp",
#                     HinhAnh=""
#                 )
#                 db.session.add(sp)

#         db.session.commit()

#         # Tạo 50 phiếu nhập
#         for _ in range(50):
#             ma_ncc = random.randint(1, 5)
#             phieu = PhieuNhap(
#                 MaNCC=ma_ncc,
#                 UserID=1,  # Giả sử user có ID = 1
#                 NgayNhap=datetime.now(),
#                 TongTien=0,
#                 TrangThai="Đã nhập",
#                 GhiChu=""
#             )
#             db.session.add(phieu)
#             db.session.flush()  # Lấy MaPN

#             tong_tien = 0
#             for _ in range(random.randint(1, 5)):
#                 ma_sp = random.randint(1, 10)
#                 so_luong = random.randint(1, 20)
#                 don_gia_nhap = random.randint(500000, 3000000)

#                 product = SANPHAM.query.get(ma_sp)
#                 product.SoLuongTon += so_luong

#                 ct = ChiTietPhieuNhap(
#                     MaPN=phieu.MaPN,
#                     MaSP=ma_sp,
#                     SoLuong=so_luong,
#                     DonGiaNhap=don_gia_nhap,
#                     ThanhTien=so_luong * don_gia_nhap
#                 )
#                 db.session.add(ct)
#                 tong_tien += so_luong * don_gia_nhap

#             phieu.TongTien = tong_tien

#         db.session.commit()
#         print("Seed phiếu nhập trang sức thành công!")

#     except Exception as e:
#         db.session.rollback()
#         print("Lỗi seed dữ liệu:", e)
