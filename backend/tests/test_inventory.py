import pytest
from flask_jwt_extended import create_access_token
from main import app as flask_app, db
from models.TonKho import TONKHO
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC
from models.NhaCungCap import NHACUNGCAP
import uuid
from datetime import datetime


@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    ctx = flask_app.app_context()
    ctx.push()

    with flask_app.test_client() as client:
        db.create_all()
        yield client

    ctx.pop()


def get_auth_header(user_id="1002"):
    with flask_app.app_context():
        token = create_access_token(identity=str(user_id))
        return {"Authorization": f"Bearer {token}"}


def tao_san_pham_cho_test():
    dm = DANHMUC(TenDM="DanhMucTest", DonViTinh="Chiếc")
    db.session.add(dm)
    db.session.commit()

    ncc = NHACUNGCAP(
        TenNCC="NCC Test",
        SoDienThoai="0123456789",
        Email=f"ncc_{uuid.uuid4().hex[:6]}@example.com",
        DiaChi="123 Test St",
        NgayHopTac="2023-01-01",
        GhiChu="Test NCC"
    )
    db.session.add(ncc)
    db.session.commit()

    ten_sp = f"SP Test - {uuid.uuid4().hex[:6]}"
    sp = SANPHAM(TenSP=ten_sp, MaDM=dm.MaDM, MaNCC=ncc.MaNCC, SoLuongTon=10)
    db.session.add(sp)
    db.session.commit()

    return sp


def test_create_tonkho(client):
    sp = tao_san_pham_cho_test()
    payload = {"MaSP": sp.MaSP, "SoLuongTon": 5, "MucCanhBao": 2}
    res = client.post("/api/inventory/", json=payload, headers=get_auth_header())

    assert res.status_code == 201
    data = res.get_json()
    assert "MaTK" in data


def test_get_all_tonkho(client):
    sp = tao_san_pham_cho_test()
    ten_sp = sp.TenSP

    payload = {"MaSP": sp.MaSP, "SoLuongTon": 5, "MucCanhBao": 2}
    client.post("/api/inventory/", json=payload, headers=get_auth_header())

    res = client.get("/api/inventory/", headers=get_auth_header())
    assert res.status_code == 200
    ds = res.get_json()
    assert isinstance(ds, list)
    assert any(ten_sp in row["TenSP"] for row in ds)


def test_get_tonkho_by_id(client):
    sp = tao_san_pham_cho_test()
    ten_sp = sp.TenSP

    payload = {"MaSP": sp.MaSP, "SoLuongTon": 7, "MucCanhBao": 3}
    post_res = client.post("/api/inventory/", json=payload, headers=get_auth_header())
    ma_tk = post_res.get_json()["MaTK"]

    get_res = client.get(f"/api/inventory/{ma_tk}", headers=get_auth_header())
    assert get_res.status_code == 200
    data = get_res.get_json()
    assert data["MaTK"] == ma_tk
    assert ten_sp in data["TenSP"]


def test_update_tonkho(client):
    sp = tao_san_pham_cho_test()

    payload = {"MaSP": sp.MaSP, "SoLuongTon": 4, "MucCanhBao": 1}
    post_res = client.post("/api/inventory/", json=payload, headers=get_auth_header())
    ma_tk = post_res.get_json()["MaTK"]

    update_res = client.put(
        f"/api/inventory/{ma_tk}",
        json={"SoLuongTon": 9, "MucCanhBao": 2},
        headers=get_auth_header()
    )
    assert update_res.status_code == 200
    tonkho = TONKHO.query.get(ma_tk)
    assert tonkho.SoLuongTon == 9
    assert tonkho.MucCanhBao == 2


def test_delete_tonkho(client):
    sp = tao_san_pham_cho_test()
    payload = {"MaSP": sp.MaSP, "SoLuongTon": 8, "MucCanhBao": 3}
    post_res = client.post("/api/inventory/", json=payload, headers=get_auth_header())
    ma_tk = post_res.get_json()["MaTK"]

    delete_res = client.delete(f"/api/inventory/{ma_tk}", headers=get_auth_header())
    assert delete_res.status_code == 200
    assert TONKHO.query.get(ma_tk) is None


def test_filter_tonkho_by_month(client):
    sp = tao_san_pham_cho_test()
    payload = {"MaSP": sp.MaSP, "SoLuongTon": 10, "MucCanhBao": 5}
    client.post("/api/inventory/", json=payload, headers=get_auth_header())

    now = datetime.now()
    res = client.get(
        f"/api/inventory/filter-by-month?month={now.month}&year={now.year}",
        headers=get_auth_header()
    )
    assert res.status_code == 200
    assert isinstance(res.get_json(), list)


def test_dong_bo_tonkho_tu_sanpham(client):
    sp = tao_san_pham_cho_test()

    # Xóa hết tồn kho trước khi test
    TONKHO.query.delete()
    db.session.commit()

    assert TONKHO.query.filter_by(MaSP=sp.MaSP).first() is None

    res = client.put("/api/inventory/capnhat_all", headers=get_auth_header())
    assert res.status_code == 200

    # Sau khi đồng bộ, tồn kho phải có
    assert TONKHO.query.filter_by(MaSP=sp.MaSP).first() is not None
