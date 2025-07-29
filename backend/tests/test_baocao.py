import pytest
from main import app as flask_app, db
from models.VaiTro import VAITRO
from models.NguoiDung import NGUOIDUNG
from models.BaoCao import BAOCAO
from flask_jwt_extended import create_access_token
from datetime import datetime

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Tạo vai trò Admin
            admin_role = VAITRO(MaVaiTro=1, TenVaiTro="Admin")
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
    

def test_tao_bao_cao(client):
    payload = {
        "LoaiBaoCao": "Doanh thu",
        "TuNgay": "2024-01-01",
        "DenNgay": "2024-01-31",
        "MoTa": "Test tháng 1",
        "NguoiTao": 1002
    }

    res = client.post("/api/baocao", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())

    assert res.status_code == 201
    assert res.get_json()["status"] == "success"

def test_update_bao_cao(client):
    # Tạo sẵn một báo cáo để sửa
    with flask_app.app_context():
        bc = BAOCAO(
            LoaiBaoCao="Doanh thu",
            TuNgay=datetime(2024, 1, 1).date(),
            DenNgay=datetime(2024, 1, 31).date(),
            MoTa="Ban đầu",
            NguoiTao=1002
        )
        db.session.add(bc)
        db.session.commit()
        ma_bc = bc.MaBC

    payload = {
        "MoTa": "Cập nhật mô tả"
    }

    res = client.put(f"/api/baocao/{ma_bc}", json=payload, headers=get_auth_header())
    print(">> Update Status:", res.status_code)
    print(">> Response:", res.get_json())

    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_delete_bao_cao(client):
    with flask_app.app_context():
        bc = BAOCAO(
            LoaiBaoCao="Lợi nhuận",
            TuNgay=datetime(2024, 2, 1).date(),
            DenNgay=datetime(2024, 2, 29).date(),
            MoTa="Sẽ bị xóa",
            NguoiTao=1002
        )
        db.session.add(bc)
        db.session.commit()
        ma_bc = bc.MaBC

    res = client.delete(f"/api/baocao/{ma_bc}", headers=get_auth_header())
    print(">> Delete Status:", res.status_code)
    print(">> Response:", res.get_json())

    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_get_danh_sach_baocao(client):
    res = client.get("/api/baocao", headers=get_auth_header())
    print(">> List Status:", res.status_code)
    print(">> Response:", res.get_json())

    assert res.status_code == 200
    assert res.get_json()["status"] == "success"

def test_print_bao_cao_pdf(client):
    with flask_app.app_context():
        bc = BAOCAO(
            LoaiBaoCao="Doanh thu",
            TuNgay=datetime(2024, 1, 1).date(),
            DenNgay=datetime(2024, 1, 31).date(),
            MoTa="Test in PDF",
            NguoiTao=1002
        )
        db.session.add(bc)
        db.session.commit()
        ma_bc = bc.MaBC

    res = client.get(f"/api/baocao/{ma_bc}/print", headers=get_auth_header())
    print(">> Print PDF Status:", res.status_code)

    assert res.status_code == 200
    assert res.headers["Content-Type"] == "application/pdf"
