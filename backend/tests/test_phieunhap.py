import pytest
from main import app as flask_app, db
from flask_jwt_extended import create_access_token
from models import NGUOIDUNG, VAITRO, NHACUNGCAP, SANPHAM

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Tạo vai trò Admin
            admin_role = VAITRO(MaVaiTro=2, TenVaiTro="Admin")
            existing_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
            if not existing_role:
                db.session.add(admin_role)
                db.session.commit()
            # Tạo user test
            user = NGUOIDUNG(
                UserID=1002,
                HoTen="Test Admin",
                TenDangNhap="admin",
                MatKhau="123",
                SoDienThoai="123",
                DiaChi="ABC",
                TaoNgay="2020-01-01",
                Email="admin@test.com",
                TrangThai=True,
                MaVaiTro=2
            )
            existing = NGUOIDUNG.query.filter_by(TenDangNhap="testuser").first()
            if not existing:
                db.session.add(user)
                db.session.commit()
        yield client

def get_auth_header(user_id=1002):
    with flask_app.app_context(): 
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}


def test_create_phieu_nhap(client):
    payload = {
        "MaNCC": 1,
        "NgayNhap": "2025-07-15",
        "TrangThai": "Da_nhap",
        "ChiTiet": [
            {"MaSP": 3, "SoLuong": 2, "DonGiaNhap": 50000}
        ]
    }
    res = client.post("/api/phieunhap", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 201
    assert res.get_json()["status"] == "success"


def test_get_phieu_nhap_list(client):
    res = client.get("/api/phieunhap", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_detail_phieu_nhap(client):
    # tạo trước phiếu
    test_create_phieu_nhap(client)
    res = client.get("/api/phieunhap/1", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"


def test_update_phieu_nhap(client):
    test_create_phieu_nhap(client)
    res = client.put("/api/phieunhap/1", json={"GhiChu": "Gấp", "TrangThai": "da_nhap"}, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json()["message"] == "Cập nhật phiếu nhập thành công"


def test_export_phieu_nhap_pdf(client):
    test_create_phieu_nhap(client)
    res = client.get("/api/phieunhap/1/export", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.content_type == "application/pdf"
