import pytest
from main import app as flask_app, db  # import app đúng biến tên
from flask_jwt_extended import create_access_token
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Tạo user mẫu
            user = NGUOIDUNG(
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
            existing = NGUOIDUNG.query.filter_by(TenDangNhap="testuser").first()
            if not existing:
                db.session.add(user)
                db.session.commit()

        yield client

def get_auth_header(user_id=1):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {'Authorization': f'Bearer {token}'}


def test_get_danh_sach_donhang(client):
    res = client.get("/api/donhang", headers=get_auth_header())
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "success"


def test_tao_don_hang(client):
    payload = {
        "UserID": 10,
        "NgayDat": "2025-07-15",
        "TrangThai": "Pending",
        "ChiTiet": [
            {"MaSP": 3, "SoLuong": 2, "GiaBan": 10000, "ThanhTien": 20000}
        ]
    }

    res = client.post(
        "/api/donhang",
        json=payload,
        headers=get_auth_header()
    )

    json_data = res.get_json()
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 200
    assert json_data["status"] == "success"


def test_cap_nhat_trang_thai_don_hang(client):
    # Tạo đơn hàng mới
    payload = {
        "UserID": 10,
        "NgayDat": "2025-07-15",
        "TrangThai": "Pending",
        "ChiTiet": [{"MaSP": 3, "SoLuong": 1, "GiaBan": 10000, "ThanhTien": 10000}]
    }
    res = client.post("/api/donhang", json=payload, headers=get_auth_header())
    order_id = res.get_json()["id"]

    # Cập nhật trạng thái
    res2 = client.put(f"/api/donhang/{order_id}/trangthai", json={"TrangThai": "Paid"}, headers=get_auth_header())
    print(">> Status:", res2.status_code)
    print(">> Response:", res2.get_json())
    assert res2.status_code == 200
    assert res2.get_json()["status"] == "success"

def test_lay_chi_tiet_don_hang(client):
    # Giả định đơn hàng đã tồn tại
    res = client.get("/api/donhang", headers=get_auth_header())
    data = res.get_json()["data"]
    order_id = data[0]["id"]

    res2 = client.get(f"/api/donhang/{order_id}/chitiet", headers=get_auth_header())
    print(">> Status:", res2.status_code)
    print(">> Response:", res2.get_json())
    assert res2.status_code == 200
    assert res2.get_json()["status"] == "success"


def test_cap_nhat_chi_tiet_don_hang(client):
    # Tạo đơn hàng mới
    payload = {
        "UserID": 10,
        "NgayDat": "2025-07-15",
        "TrangThai": "Pending",
        "ChiTiet": [{"MaSP": 3, "SoLuong": 1, "GiaBan": 10000, "ThanhTien": 10000}]
    }
    res = client.post("/api/donhang", json=payload, headers=get_auth_header())
    order_id = res.get_json()["id"]

    # Cập nhật chi tiết
    new_ct = [{"MaSP": 3, "SoLuong": 2, "GiaBan": 15000}]
    res2 = client.post(f"/api/donhang/{order_id}/chitiet", json=new_ct, headers=get_auth_header())
    print(">> Status:", res2.status_code)
    print(">> Response:", res2.get_json())
    assert res2.status_code == 200
    assert res2.get_json()["status"] == "success"

def test_xac_nhan_thanh_toan(client):
    res = client.get("/api/donhang", headers=get_auth_header())
    order_id = res.get_json()["data"][0]["id"]

    res2 = client.post(f"/api/donhang/{order_id}/thanhtoan", headers=get_auth_header())
    print(">> Status:", res2.status_code)
    assert res2.status_code == 200

def test_giao_hang_don_hang(client):
    res = client.get("/api/donhang", headers=get_auth_header())
    order_id = res.get_json()["data"][0]["id"]

    res2 = client.post(f"/api/donhang/{order_id}/giaohang", json={"deliveryMethod": "Giao hàng tận nơi"}, headers=get_auth_header())
    assert res2.status_code == 200

def test_xoa_don_hang(client):
    # Tạo đơn hàng mới
    payload = {
        "UserID": 10,
        "NgayDat": "2025-07-15",
        "TrangThai": "Pending",
        "ChiTiet": [{"MaSP": 3, "SoLuong": 1, "GiaBan": 10000, "ThanhTien": 10000}]
    }
    res = client.post("/api/donhang", json=payload, headers=get_auth_header())
    order_id = res.get_json()["id"]

    res2 = client.delete(f"/api/donhang/{order_id}", headers=get_auth_header())
    assert res2.status_code == 200


def test_in_pdf_donhang(client):
    res = client.get("/api/donhang/1/chitiet/pdf")
    print("DonHang PDF >>", res.status_code)
    assert res.status_code == 200
    assert res.content_type == 'application/pdf'