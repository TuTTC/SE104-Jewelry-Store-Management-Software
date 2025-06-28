import random
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from werkzeug.security import generate_password_hash
from database import db

def seed_user():
    try:
        # Lấy vai trò
        admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
        nhanvien_role = VAITRO.query.filter_by(TenVaiTro="Nhân viên").first()
        khachhang_role = VAITRO.query.filter_by(TenVaiTro="Khách hàng").first()

        if not admin_role or not nhanvien_role or not khachhang_role:
            print("⚠️ Chưa có đầy đủ vai trò. Hãy seed VAITRO trước.")
            return

        ho_list = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đặng", "Bùi", "Đỗ"]
        dem_list = ["Văn", "Thị", "Minh", "Quốc", "Ngọc", "Hữu", ""]
        ten_list = ["An", "Bình", "Hòa", "Dũng", "Tú", "Lan", "Hương", "Hải", "Trang", "Sơn"]

        roles = [admin_role.MaVaiTro, nhanvien_role.MaVaiTro, khachhang_role.MaVaiTro]

        for i in range(1, 11):
            ho = random.choice(ho_list)
            dem = random.choice(dem_list)
            ten = random.choice(ten_list)

            ho_ten = f"{ho} {dem} {ten}".strip()
            email = f"{ho.lower()}.{ten.lower()}{i}@example.com".replace(" ", "")
            sdt = f"09{random.randint(10000000, 99999999)}"
            matkhau = generate_password_hash("123456")
            vai_tro = random.choice(roles)

            if not NGUOIDUNG.query.filter_by(Email=email).first():
                user = NGUOIDUNG(
                    TenDangNhap=email.split("@")[0],
                    Email=email,
                    MatKhau=matkhau,
                    MaVaiTro=vai_tro
                )
                db.session.add(user)

        db.session.commit()
        print("Đã seed 20 người dùng thành công.")

    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi seed người dùng: {e}")
