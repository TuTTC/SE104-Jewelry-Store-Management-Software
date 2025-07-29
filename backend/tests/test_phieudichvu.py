import pytest
from main import app as flask_app, db
from flask_jwt_extended import create_access_token
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from models.DichVu import DICHVU
from models.ThamSo import THAMSO

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Tạo vai trò Admin nếu chưa có
            admin_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
            if not admin_role:
                admin_role = VAITRO(MaVaiTro=2, TenVaiTro="Admin")
                db.session.add(admin_role)
                db.session.commit()

            # Tạo user Admin nếu chưa có
            existing_admin = NGUOIDUNG.query.filter_by(TenDangNhap="testuser").first()
            if not existing_admin:
                admin_user = NGUOIDUNG(
                    HoTen="Test User",
                    TenDangNhap="testuser",
                    MatKhau="testpass",
                    SoDienThoai="123456789",
                    DiaChi="123 Test St",
                    TaoNgay="2000-01-01",
                    Email="test@example.com",
                    TrangThai=True,
                    MaVaiTro=2
                )
                db.session.add(admin_user)
                db.session.commit()

            # Tạo dịch vụ mẫu
            dv = DICHVU(TenDV="Rửa nữ trang", DonGia=100000, MoTa="Test", TrangThai=True)
            db.session.add(dv)

            # Tạo tham số trả trước nếu chưa có
            existing_ts = THAMSO.query.filter_by(TenThamSo="Tỉ lệ trả trước").first()
            if not existing_ts:
                thamso = THAMSO(TenThamSo="Tỉ lệ trả trước", GiaTri="30", KichHoat=True)
                db.session.add(thamso)

            db.session.commit()

        yield client

def get_auth_header(user_id=1002):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}
    

def test_create_phieu_dich_vu(client):
    payload = {
        "UserID": 10,
        "MaDV": 1,
        "TraTruoc": 300000
    }

    res = client.post(
        "/api/phieudichvu",
        json=payload,
        headers=get_auth_header()
    )

    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())

    assert res.status_code == 201
    assert res.get_json()["status"] == "success"

def test_list_phieu_dich_vu(client):
    res = client.get("/api/phieudichvu", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_detail_phieu_dich_vu(client):
    # Tạo phiếu trước
    payload = {"UserID": 10, "MaDV": 1, "TraTruoc": 500000}
    create = client.post("/api/phieudichvu", json=payload, headers=get_auth_header())
    assert create.status_code == 201
    ma_pdv = create.get_json()["data"]["MaPDV"]

    res = client.get(f"/api/phieudichvu/{ma_pdv}", headers=get_auth_header())
    print(">> Detail:", res.status_code, res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"


def test_update_chi_tiet_dich_vu(client):
    # Tạo phiếu trước
    payload = {"UserID": 10, "MaDV": 1, "TraTruoc": 500000}
    res = client.post("/api/phieudichvu", json=payload, headers=get_auth_header())
    ma_pdv = res.get_json()["data"]["MaPDV"]

    # Lấy chi tiết để sửa
    ct_res = client.get(f"/api/phieudichvu/{ma_pdv}", headers=get_auth_header())
    ma_ct = ct_res.get_json()["data"]["ChiTiet"][0]["MaCT"]

    update_payload = {
        "SoLuong": 2,
        "TienTraTruoc": 1000000,
        "TinhTrang": "Đã giao",
        "DonGiaDichVu": 500000,
        "ChiPhiRieng": 0
    }

    res = client.put(f"/api/phieudichvu/chitiet/{ma_ct}", json=update_payload, headers=get_auth_header())
    print(">> Update CT:", res.status_code, res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"


def test_delete_chi_tiet_dich_vu(client):
    payload = {"UserID": 10, "MaDV": 1, "TraTruoc": 500000}
    res = client.post("/api/phieudichvu", json=payload, headers=get_auth_header())
    ma_pdv = res.get_json()["data"]["MaPDV"]

    ct_res = client.get(f"/api/phieudichvu/{ma_pdv}", headers=get_auth_header())
    ma_ct = ct_res.get_json()["data"]["ChiTiet"][0]["MaCT"]

    res = client.delete(f"/api/phieudichvu/chitiet/{ma_ct}", headers=get_auth_header())
    print(">> Delete CT:", res.status_code, res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_update_phieu_dich_vu(client):
    payload = {"UserID": 10, "MaDV": 1, "TraTruoc": 500000}
    res = client.post("/api/phieudichvu", json=payload, headers=get_auth_header())
    ma_pdv = res.get_json()["data"]["MaPDV"]

    update_payload = {
        "UserID": 10,
        "NgayLap": "2025-07-15",
        "GhiChu": "Sửa phiếu",
        "TrangThai": "Đang xử lý",
        "ChiTiet": [{
            "MaDV": 1,
            "DonGia": 500000,
            "ChiPhiRieng": 0,
            "SoLuong": 1,
            "TienTraTruoc": 500000,
            "TinhTrang": "Chưa giao"
        }]
    }

    res = client.put(f"/api/phieudichvu/{ma_pdv}", json=update_payload, headers=get_auth_header())
    print(">> Update PDV:", res.status_code, res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_delete_phieu_dich_vu(client):
    payload = {"UserID": 10, "MaDV": 1, "TraTruoc": 500000}
    res = client.post("/api/phieudichvu", json=payload, headers=get_auth_header())
    ma_pdv = res.get_json()["data"]["MaPDV"]

    res = client.delete(f"/api/phieudichvu/{ma_pdv}", headers=get_auth_header())
    print(">> Delete PDV:", res.status_code, res.get_json())
    assert res.status_code == 200
    assert res.get_json()["status"] == "success"


