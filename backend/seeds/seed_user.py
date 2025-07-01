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
        print(f"Đã xóa {num_rows_deleted} người dùng thành công.")
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi xóa người dùng: {e}")

def remove_accents(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

def seed_user():
    try:
        # Lấy vai trò
        admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
        nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not admin_role or not nhanvien_role or not khachhang_role:
            print("Chưa có đầy đủ vai trò. Hãy seed VAITRO trước.")
            return

        ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi", "Đỗ"]
        dem_list = ["Văn", "Thị", "Minh", "Quốc", "Ngọc", "Hữu", ""]
        ten_list = ["An", "Bình", "Hòa", "Dũng", "Tú", "Lan", "Hương", "Hải", "Trang", "Sơn"]

        roles = [admin_role.MaVaiTro, nhanvien_role.MaVaiTro, khachhang_role.MaVaiTro]
        if not NGUOIDUNG.query.first():
            for i in range(1, 11):  # Seed 20 người
                ho = random.choice(ho_list)
                dem = random.choice(dem_list)
                ten = random.choice(ten_list)

                ho_ten = f"{ho} {dem} {ten}".strip()
                ho_ten_khong_dau = remove_accents(ho_ten).replace(" ", "").lower()
                
                email = f"{ho_ten_khong_dau}{i}@example.com"
                sdt = f"09{random.randint(10000000, 99999999)}"
                matkhau = generate_password_hash("123456")
                vai_tro = random.choice(roles)

                if not NGUOIDUNG.query.filter_by(Email=email).first():
                    user = NGUOIDUNG(
                        TenDangNhap=ho_ten_khong_dau,
                        Email=email,
                        MatKhau=matkhau,
                        MaVaiTro=vai_tro
                    )
                    db.session.add(user)

            db.session.commit()
            print("Đã seed 10 người dùng thành công.")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed người dùng: {e}")
