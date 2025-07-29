import pytest
from flask_jwt_extended import create_access_token
from main import app as flask_app, db
from models.NguoiDung import NGUOIDUNG
from models.VaiTro import VAITRO
from models.SanPham import SANPHAM
from models.DonHang import DONHANG
from models.DanhMucSanPham import DANHMUC
from models.NhaCungCap import NHACUNGCAP
from models.ChiTietDonHang import CHITIETDONHANG

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Thêm khách hàng có ID = 10
            existing_khach = NGUOIDUNG.query.get(10)
            if not existing_khach:
                khach = NGUOIDUNG(
                    UserID=10,
                    HoTen="Khách hàng test",
                    TenDangNhap="khachhang",
                    MatKhau="abc123",
                    SoDienThoai="0987654321",
                    DiaChi="123 Đường ABC",
                    TaoNgay="2024-01-01",
                    Email="khach@test.com",
                    TrangThai=True,
                    MaVaiTro=1  # vai trò khách hàng
                )
                db.session.add(khach)
                
            # Role + User
            existing_role = VAITRO.query.filter_by(TenVaiTro="Admin").first()
            if not existing_role:
                role = VAITRO(MaVaiTro=2, TenVaiTro="Admin")
                db.session.add(role)

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
            # DANHMUC
            if not DANHMUC.query.get(1):
                dm = DANHMUC(MaDM=1, TenDM="Nhẫn", DonViTinh="Chiếc")
                db.session.add(dm)

            # NHACUNGCAP
            if not NHACUNGCAP.query.get(1):
                ncc = NHACUNGCAP(MaNCC=1, TenNCC="NCC A", DiaChi="123 ABC", SoDienThoai="0123456789")
                db.session.add(ncc)
            # Product
            ex_sp = SANPHAM.query.filter_by(TenSP="Test Product").first()
            if not ex_sp:
                sp = SANPHAM(
                    MaSP=1,
                    TenSP="Test Product",
                    MaDM=1,
                    MaNCC=1,
                    GiaBan=50000,
                    SoLuongTon=0,
                    MoTa="Test product"
                )
                db.session.add(sp)
            # Order
            ex_dh = DONHANG.query.filter_by(MaDH=1).first()
            if not ex_dh:
                    
                dh = DONHANG(MaDH=1, UserID=10, NgayDat="2024-07-01", TrangThai="Completed", TongTien=100000)
                db.session.add(dh)

            # ChiTietDonHang
            ex_ct = CHITIETDONHANG.query.filter_by(MaDH=1, MaSP=1).first()
            if not ex_ct:
                    
                ct = CHITIETDONHANG(MaDH=1, MaSP=1, SoLuong=2, GiaBan=50000, ThanhTien=100000)
                db.session.add(ct)

            db.session.commit()

        yield client


def get_auth_header(user_id=10):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}

def test_create_return_request(client):
    payload = {
        "OrderID": 1,
        "UserID": 10,
        "Type": "refund",
        "Reason": "Hàng lỗi",
        "RefundMethod": "Chuyển khoản",
        "ReturnAddr": "123/abc",
        "Items": [
            {"ProductID": 1, "Quantity": 1, "Amount": 50000, "IsNewItem": False}
        ]
    }
    res = client.post("/api/return", json=payload)
    print(">> Status:", res.status_code)
    print(">> Response:", res.get_json())
    assert res.status_code == 201
    assert res.get_json()["status"] == "success"
    return res.get_json()["RequestID"]


def test_get_return_request(client):
    request_id = test_create_return_request(client)
    res = client.get(f"/api/return/{request_id}")
    assert res.status_code == 200
    data = res.get_json()
    assert data["RequestID"] == request_id
    assert data["Items"][0]["ProductID"] == 1


def test_get_return_summary(client):
    # Lấy số lượng đã trả trước đó (nếu có)
    res_before = client.get("/api/return/summary/1")
    assert res_before.status_code == 200
    data_before = res_before.get_json()
    summary_before = {int(k): v for k, v in data_before["data"].items()}
    old_qty = summary_before.get(1, 0)

    # Thực hiện trả hàng mới
    payload = {
        "OrderID": 1,
        "UserID": 10,
        "Type": "refund",
        "Reason": "Hàng lỗi",
        "RefundMethod": "Chuyển khoản",
        "ReturnAddr": "123/abc",
        "Items": [{"ProductID": 1, "Quantity": 1, "Amount": 50000}]
    }
    res_create = client.post("/api/return", json=payload)
    assert res_create.status_code == 201

    # Gọi lại API để lấy summary
    res_after = client.get("/api/return/summary/1")
    assert res_after.status_code == 200
    data_after = res_after.get_json()
    summary_after = {int(k): v for k, v in data_after["data"].items()}

    assert summary_after[1] == old_qty + 1


def test_list_return_requests(client):
    request_id = test_create_return_request(client)
    res = client.get("/api/return/order/1")
    assert res.status_code == 200
    data = res.get_json()
    assert any(r["RequestID"] == request_id for r in data["data"])
