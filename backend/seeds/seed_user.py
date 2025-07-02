# import random
# import unicodedata
# from models.NguoiDung import NGUOIDUNG
# from models.NhanVien import NHANVIEN
# from models.KhachHang import KHACHHANG
# from models.NguoiQuanLy import NGUOIQUANLY
# from models.PhieuNhap import PHIEUNHAP
# from models.VaiTro import VAITRO
# from werkzeug.security import generate_password_hash
# from database import db
# from datetime import datetime, timedelta

# def clear_users():
#     try:
        
#         num_rows_deleted = db.session.query(NGUOIDUNG).delete()
#         db.session.commit()
#         print(f"Đã xóa {num_rows_deleted} người dùng thành công.")
#     except Exception as e:
#         db.session.rollback()
#         print(f"Lỗi khi xóa người dùng: {e}")

# def remove_accents(text):
#     """Loại bỏ dấu tiếng Việt và thay thế ký tự đ, Đ."""
#     text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
#     text = text.replace('đ', 'd').replace('Đ', 'D')
#     return text


# def seed_user():
#     try:
#         # Lấy vai trò
#         admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
#         nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
#         khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

#         if not admin_role or not nhanvien_role or not khachhang_role:
#             print("Chưa có đầy đủ vai trò. Hãy seed VAITRO trước.")
#             return

#         ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi", "Đỗ"]
#         dem_list = ["Văn", "Thị", "Minh", "Quốc", "Ngọc", "Hữu", ""]
#         ten_list = ["An", "Bình", "Hòa", "Dũng", "Tú", "Lan", "Hương", "Hải", "Trang", "Sơn"]

#         roles = [admin_role, nhanvien_role, khachhang_role]

#         if not NGUOIDUNG.query.first():
#             for i in range(1, 21):
#                 ho = random.choice(ho_list)
#                 dem = random.choice(dem_list)
#                 ten = random.choice(ten_list)

#                 ho_ten = f"{ho} {dem} {ten}".strip()
#                 ho_ten_khong_dau = remove_accents(ho_ten).replace(" ", "").lower() + str(random.randint(100, 999))

#                 email = f"{ho_ten_khong_dau}{i}@example.com"
#                 sdt = f"09{random.randint(10000000, 99999999)}"
#                 dia_chi = f"Số {random.randint(1, 100)} Đường {random.choice(ho_list)}"
#                 matkhau = generate_password_hash("123456")
#                 vai_tro = random.choice(roles)

#                 if not NGUOIDUNG.query.filter_by(Email=email).first():
#                     user = NGUOIDUNG(
#                         TenDangNhap=ho_ten_khong_dau,
#                         Email=email,
#                         MatKhau=matkhau,
#                         MaVaiTro=vai_tro.MaVaiTro
#                     )
#                     db.session.add(user)
#                     db.session.flush()  # Lấy UserID sau khi add

#                     if vai_tro.TenVaiTro == "Khách hàng":
#                         khach = KHACHHANG(
#                             UserID=user.UserID,
#                             HoTen=ho_ten,
#                             SoDienThoai=sdt,
#                             DiaChi=dia_chi,
#                             NgayDangKy=datetime.now() - timedelta(days=random.randint(0, 30))
#                         )
#                         db.session.add(khach)

#                     elif vai_tro.TenVaiTro == "Nhân viên":
#                         nhanvien = NHANVIEN(
#                             UserID=user.UserID,
#                             TenNV=ho_ten,
#                             SoDienThoai=sdt,
#                             DiaChi=dia_chi,
#                             NgayVaoLam=datetime.now() - timedelta(days=random.randint(0, 365))
#                         )
#                         db.session.add(nhanvien)

#                     elif vai_tro.TenVaiTro == "Admin":
#                         admin = NGUOIQUANLY(
#                             UserID=user.UserID,
#                             HoTen=ho_ten,
#                             SoDienThoai=sdt,
#                             DiaChi=dia_chi
#                         )
#                         db.session.add(admin)

#             db.session.commit()
#             print("Đã seed 20 người dùng và các bảng liên quan thành công.")

#     except Exception as e:
#         db.session.rollback()
#         print(f"Lỗi khi seed người dùng: {e}")


import random
import unicodedata
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from werkzeug.security import generate_password_hash
from database import db

def clear_users():
    try:
        num_rows_deleted = db.session.query(NGUOIDUNG).delete()
        db.session.commit()
        print(f"✅ Đã xóa {num_rows_deleted} người dùng thành công.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi xóa người dùng: {e}")

def remove_accents(text):
    """Loại bỏ dấu tiếng Việt và thay thế ký tự đ, Đ."""
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    text = text.replace('đ', 'd').replace('Đ', 'D')
    return text

def seed_user():
    try:
        # Lấy vai trò từ DB
        admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
        nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not admin_role or not nhanvien_role or not khachhang_role:
            print("Chưa có đủ vai trò, hãy seed VAITRO trước.")
            return

        ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi", "Đỗ"]
        dem_list = ["Văn", "Thị", "Minh", "Quốc", "Ngọc", "Hữu", ""]
        ten_list = ["An", "Bình", "Hòa", "Dũng", "Tú", "Lan", "Hương", "Hải", "Trang", "Sơn"]

        roles = [admin_role.MaVaiTro, nhanvien_role.MaVaiTro, khachhang_role.MaVaiTro]

        if not NGUOIDUNG.query.first():
            for i in range(1, 16):  # Seed 15 người dùng
                ho = random.choice(ho_list)
                dem = random.choice(dem_list)
                ten = random.choice(ten_list)

                ho_ten = f"{ho} {dem} {ten}".strip()
                ho_ten_khong_dau = remove_accents(ho_ten).replace(" ", "").lower() + str(random.randint(100, 999))

                ten_dang_nhap = f"{ho_ten_khong_dau}{i}"
                email = f"{ho_ten_khong_dau}{i}@example.com"
                sdt = f"09{random.randint(10000000, 99999999)}"
                dia_chi = f"Số {random.randint(1, 100)} Đường ABC, TP XYZ"
                mat_khau = generate_password_hash("123456")
                vai_tro = random.choice(roles)

                if not NGUOIDUNG.query.filter_by(TenDangNhap=ten_dang_nhap).first():
                    user = NGUOIDUNG(
                        TenDangNhap=ten_dang_nhap,
                        Email=email,
                        MatKhau=mat_khau,
                        MaVaiTro=vai_tro,
                        HoTen=ho_ten,
                        SoDienThoai=sdt,
                        DiaChi=dia_chi
                    )
                    db.session.add(user)

            db.session.commit()
            print("Đã seed người dùng thành công!")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed người dùng: {e}")