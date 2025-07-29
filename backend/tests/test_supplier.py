import pytest
from flask_jwt_extended import create_access_token
from datetime import datetime
from main import app as flask_app, db
from models.TonKho import TONKHO
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    flask_app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    with flask_app.test_client() as client:
        with flask_app.app_context():
            db.create_all()

            # Seed danh mục và sản phẩm
            dm = DANHMUC(TenDM="Thiết bị", DonViTinh="Cái")
            db.session.add(dm)
            db.session.commit()

            sp = SANPHAM(TenSP="Máy in", MaDM=dm.MaDM, SoLuongTon=10)
            db.session.add(sp)
            db.session.commit()

        yield client


def get_auth_header(user_id="1002"):
    with flask_app.app_context():
        token = create_access_token(identity={"user_id": user_id, "permissions": ["inventory:view", "inventory:add", "inventory:edit", "inventory:delete"]})
        return {"Authorization": f"Bearer {token}"}


def test_create_tonkho(client):
    sp = SANPHAM.query.first()
    payload = {
        "MaSP": sp.MaSP,
        "SoLuongTon": 5,
        "MucCanhBao": 2
    }
    res = client.post("/api/tonkho/", json=payload, headers=get_auth_header())
    assert res.status_code == 201
    data = res.get_json()
    assert "MaTK" in data


def test_get_all_tonkho(client):
    test_create_tonkho(client)
    res = client.get("/api/tonkho/", headers=get_auth_header())
    assert res.status_code == 200
    assert isinstance(res.get_json(), list)
    assert res.get_json()[0]["TenSP"] == "Máy in"


def test_get_tonkho_by_id(client):
    test_create_tonkho(client)
    tk = TONKHO.query.first()
    res = client.get(f"/api/tonkho/{tk.MaTK}", headers=get_auth_header())
    assert res.status_code == 200
    data = res.get_json()
    assert data["MaTK"] == tk.MaTK
    assert data["TenSP"] == "Máy in"


def test_update_tonkho(client):
    test_create_tonkho(client)
    tk = TONKHO.query.first()
    res = client.put(f"/api/tonkho/{tk.MaTK}", json={"SoLuongTon": 9, "MucCanhBao": 1}, headers=get_auth_header())
    assert res.status_code == 200
    assert TONKHO.query.get(tk.MaTK).SoLuongTon == 9


def test_delete_tonkho(client):
    test_create_tonkho(client)
    tk = TONKHO.query.first()
    res = client.delete(f"/api/tonkho/{tk.MaTK}", headers=get_auth_header())
    assert res.status_code == 200
    assert TONKHO.query.get(tk.MaTK) is None


def test_filter_tonkho_by_month(client):
    test_create_tonkho(client)
    now = datetime.now()
    res = client.get(f"/api/tonkho/filter-by-month?month={now.month}&year={now.year}", headers=get_auth_header())
    assert res.status_code == 200
    assert isinstance(res.get_json(), list)


def test_dong_bo_tonkho_tu_sanpham(client):
    # Lúc đầu chưa có tồn kho
    assert TONKHO.query.count() == 0
    res = client.put("/api/tonkho/capnhat_all", headers=get_auth_header())
    assert res.status_code == 200
    assert TONKHO.query.count() == SANPHAM.query.count()
