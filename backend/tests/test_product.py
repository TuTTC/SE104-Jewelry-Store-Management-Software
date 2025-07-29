import pytest
from flask_jwt_extended import create_access_token
from main import app as flask_app, db
from models.VaiTro import VAITRO
from models.NguoiDung import NGUOIDUNG
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC
from models.NhaCungCap import NHACUNGCAP
from models.TonKho import TONKHO

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            if not VAITRO.query.get(2):
                db.session.add(VAITRO(MaVaiTro=2, TenVaiTro="Admin"))
                db.session.flush()

            if not NGUOIDUNG.query.get(1002):
                db.session.add(NGUOIDUNG(
                    UserID=1002,
                    HoTen="Test Admin",
                    TenDangNhap="admin",
                    MatKhau="123",
                    SoDienThoai="123456789",
                    DiaChi="Test St",
                    TaoNgay="2020-01-01",
                    Email="admin@test.com",
                    TrangThai=True,
                    MaVaiTro=2
                ))
                db.session.flush()

            if not DANHMUC.query.get(1):
                db.session.add(DANHMUC(MaDM=1, TenDM="Trang sức", DonViTinh="Chiếc", PhanTramLoiNhuan=10, IsDisabled=False))

            if not NHACUNGCAP.query.get(1):
                db.session.add(NHACUNGCAP(MaNCC=1, TenNCC="NCC A", SoDienThoai="0123", DiaChi="Địa chỉ NCC"))

            db.session.commit()
        yield client

def get_auth_header(user_id=1002):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}

def create_sample_product(client):
    payload = {
        "TenSP": "Vòng tay test",
        "MaDM": 1,
        "MaNCC": 1,
        "GiaBan": 100000,
        "SoLuongTon": 5,
        "MoTa": "Sản phẩm test",
        "HinhAnh": None
    }
    res = client.post("/api/product/", json=payload, headers=get_auth_header())
    assert res.status_code == 201
    return res.get_json()["MaSP"]

def test_add_product(client):
    payload = {
        "TenSP": "Vòng tay test",
        "MaDM": 1,
        "MaNCC": 1,
        "GiaBan": 100000,
        "SoLuongTon": 5,
        "MoTa": "Sản phẩm test",
        "HinhAnh": None
    }
    res = client.post("/api/product/", json=payload, headers=get_auth_header())
    print(">> Add:", res.status_code, res.get_json())
    assert res.status_code == 201
    data = res.get_json()
    assert data["status"] == "success"
    assert "MaSP" in data


def test_get_product_by_id(client):
    ma_sp = create_sample_product(client)
    res = client.get(f"/api/product/{ma_sp}")
    print(">> Get by ID:", res.status_code, res.get_json())
    assert res.status_code == 200


def test_update_product(client):
    ma_sp = create_sample_product(client)
    payload = {
        "TenSP": "Vòng tay đã sửa",
        "GiaBan": 150000,
        "SoLuongTon": 10
    }
    res = client.put(f"/api/product/{ma_sp}", json=payload, headers=get_auth_header())
    print(">> Update:", res.status_code, res.get_json())
    assert res.status_code == 200


def test_delete_product(client):
    ma_sp = create_sample_product(client)
    res = client.delete(f"/api/product/{ma_sp}", headers=get_auth_header())
    print(">> Delete:", res.status_code, res.get_json())
    assert res.status_code == 200
