import pytest
from main import app as flask_app, db
from flask_jwt_extended import create_access_token
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from models import DICHVU

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Tạo vai trò mẫu
            role = VAITRO(TenVaiTro="Admin", MaVaiTro=2)
            existing_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
            if not existing_role:
                db.session.add(role)
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

def get_auth_header(user_id=1):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {'Authorization': f'Bearer {token}'}


def test_get_all_dichvu(client):
    res = client.get("/api/dichvu", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"

def test_create_dichvu(client):
    payload = {
        "TenDV": "Làm sạch vàng",
        "DonGia": 150000,
        "MoTa": "Dịch vụ làm sạch trang sức",
        "TrangThai": True
    }

    res = client.post("/api/dichvu", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 201
    json_data = res.get_json()
    assert json_data["status"] == "success"


def test_update_dichvu(client):
    # Thêm trước
    with flask_app.app_context():
        dv = DICHVU(TenDV="Thử", DonGia=50000, TrangThai=True)
        db.session.add(dv)
        db.session.commit()
        dv_id = dv.MaDV

    payload = {
        "TenDV": "Vệ sinh đá quý",
        "DonGia": 200000,
        "MoTa": "Cập nhật mô tả",
        "TrangThai": False
    }

    res = client.put(f"/api/dichvu/{dv_id}", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["status"] == "success"


def test_delete_dichvu(client):
    # Thêm trước
    with flask_app.app_context():
        dv = DICHVU(TenDV="Xóa thử", DonGia=100000, TrangThai=True)
        db.session.add(dv)
        db.session.commit()
        dv_id = dv.MaDV

    res = client.delete(f"/api/dichvu/{dv_id}", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    json_data = res.get_json()
    assert json_data["status"] == "success"