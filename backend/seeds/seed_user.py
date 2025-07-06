import random
import unicodedata
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from werkzeug.security import generate_password_hash
from database import db

def clear_users():
    """Xóa toàn bộ người dùng trong hệ thống."""
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
    """Seed người dùng với đầy đủ thông tin theo bảng mới."""
    try:
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
            for i in range(1, 16):
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
                trang_thai = random.choice([True, False])  # Random trạng thái hoạt động

                if not NGUOIDUNG.query.filter_by(TenDangNhap=ten_dang_nhap).first():
                    user = NGUOIDUNG(
                        TenDangNhap=ten_dang_nhap,
                        Email=email,
                        MatKhau=mat_khau,
                        MaVaiTro=vai_tro,
                        HoTen=ho_ten,
                        SoDienThoai=sdt,
                        DiaChi=dia_chi,
                        TrangThai=trang_thai
                    )
                    db.session.add(user)

            db.session.commit()
            print("Đã seed người dùng Admin, Nhân viên, Khách hàng thành công!")
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed người dùng: {e}")

def seed_them_khach_hang(so_luong=30):
    """Seed thêm n khách hàng đầy đủ thông tin, có trạng thái."""
    try:
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not khachhang_role:
            print("❌ Chưa có vai trò Khách hàng, hãy seed VAITRO trước.")
            return

        ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi", "Đỗ"]
        dem_list = ["Văn", "Thị", "Minh", "Quốc", "Ngọc", "Hữu", ""]
        ten_list = ["An", "Bình", "Hòa", "Dũng", "Tú", "Lan", "Hương", "Hải", "Trang", "Sơn"]

        for i in range(so_luong):
            ho = random.choice(ho_list)
            dem = random.choice(dem_list)
            ten = random.choice(ten_list)

            ho_ten = f"{ho} {dem} {ten}".strip()
            ho_ten_khong_dau = remove_accents(ho_ten).replace(" ", "").lower() + str(random.randint(100, 999))

            ten_dang_nhap = f"{ho_ten_khong_dau}{random.randint(1, 999)}"
            email = f"{ho_ten_khong_dau}@example.com"
            sdt = f"09{random.randint(10000000, 99999999)}"
            dia_chi = f"Số {random.randint(1, 100)} Đường ABC, TP XYZ"
            mat_khau = generate_password_hash("123456")
            trang_thai = random.choice([True, False])  # Random trạng thái hoạt động

            if not NGUOIDUNG.query.filter_by(TenDangNhap=ten_dang_nhap).first():
                user = NGUOIDUNG(
                    TenDangNhap=ten_dang_nhap,
                    Email=email,
                    MatKhau=mat_khau,
                    MaVaiTro=khachhang_role.MaVaiTro,
                    HoTen=ho_ten,
                    SoDienThoai=sdt,
                    DiaChi=dia_chi,
                    TrangThai=trang_thai
                )
                db.session.add(user)

        db.session.commit()
        print(f"✅ Đã seed thêm {so_luong} khách hàng thành công!")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Lỗi khi seed khách hàng: {e}")
