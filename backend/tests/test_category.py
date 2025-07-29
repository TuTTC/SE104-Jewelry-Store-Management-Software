import pytest
from flask_jwt_extended import create_access_token
from main import app as flask_app, db
from models.DanhMucSanPham import DANHMUC
from models.VaiTro import VAITRO
from models.NguoiDung import NGUOIDUNG


@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            if not VAITRO.query.get(2):
                role = VAITRO(MaVaiTro=2, TenVaiTro="Admin")
                db.session.add(role)

        
            if not NGUOIDUNG.query.get(1002):
                admin = NGUOIDUNG(
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
                db.session.add(admin)

            db.session.commit()

        yield client


def get_auth_header(user_id=1002):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}


import uuid

def test_add_category(client):
    unique_name = f"Nhẫn_{uuid.uuid4().hex[:6]}"
    payload = {
        "TenDM": unique_name,
        "DonViTinh": "Chiếc",
        "PhanTramLoiNhuan": 10.0,
        "MoTa": "Trang sức tay"
    }
    res = client.post("/api/categories/", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 201
    assert res.get_json()["message"] == "Tạo danh mục thành công"


def test_add_duplicate_category(client):
    test_add_category(client)
    payload = {
        "TenDM": "nhẫn 1",  # giống tên, khác chữ hoa/thường
        "DonViTinh": "Chiếc",
        "PhanTramLoiNhuan": 15.0,
        "MoTa": "Duplicate test"
    }
    res = client.post("/api/categories/", json=payload, headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 400
    assert "đã tồn tại" in res.get_json()["error"]


def test_get_categories(client):
    test_add_category(client)
    res = client.get("/api/categories/", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    data = res.get_json()
    assert isinstance(data, list)
    assert any(c["TenDM"].lower() == "nhẫn" for c in data)


def test_update_category(client):
    payload = {
        "TenDM": "Danh mục cập nhật",
        "DonViTinh": "Chiếc",
        "PhanTramLoiNhuan": 8.5,
        "MoTa": "Trước khi cập nhật"
    }
    create_res = client.post("/api/categories/", json=payload, headers=get_auth_header())
    assert create_res.status_code == 201
    cat_id = create_res.get_json()["MaDM"]

    # Cập nhật
    res = client.put(f"/api/categories/{cat_id}", json={
        "MoTa": "Cập nhật mô tả",
        "PhanTramLoiNhuan": 12.5
    }, headers=get_auth_header())

    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json()["message"] == "Cập nhật danh mục thành công"


def test_delete_category(client):
    payload = {
        "TenDM": "Danh mục xóa",
        "DonViTinh": "Chiếc",
        "PhanTramLoiNhuan": 5.0,
        "MoTa": "Đang thử xóa"
    }
    create_res = client.post("/api/categories/", json=payload, headers=get_auth_header())
    assert create_res.status_code == 201
    cat_id = create_res.get_json()["MaDM"]

    res = client.delete(f"/api/categories/{cat_id}", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert "ẩn" in res.get_json()["message"]

    # Kiểm tra danh mục đã bị ẩn
    hidden = DANHMUC.query.get(cat_id)
    assert hidden.IsDisabled is True
