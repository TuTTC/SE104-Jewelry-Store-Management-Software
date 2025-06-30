from flask import Blueprint, request, jsonify
from models import ThamSo
from database import db

thamso_bp = Blueprint("thamso_bp", __name__)

# Lấy tất cả tham số
@thamso_bp.route("/thamso", methods=["GET"])
def get_all_thamso():
    items = ThamSo.query.all()
    data = [item.to_dict() for item in items]
    return jsonify({"status": "success", "data": data})

# Lấy tham số theo tên
@thamso_bp.route("/thamso/<string:ten>", methods=["GET"])
def get_thamso_by_name(ten):
    ts = ThamSo.query.filter_by(TenThamSo=ten).first()
    if not ts:
        return jsonify({"status": "error", "message": "Không tìm thấy tham số"}), 404
    return jsonify({"status": "success", "data": ts.to_dict()})

# Cập nhật tham số
@thamso_bp.route("/thamso/<string:ten>", methods=["PUT"])
def update_thamso(ten):
    data = request.get_json()
    ts = ThamSo.query.filter_by(TenThamSo=ten).first()
    if not ts:
        return jsonify({"status": "error", "message": "Không tìm thấy tham số"}), 404

    ts.GiaTri = data.get("GiaTri", ts.GiaTri)
    ts.MoTa = data.get("MoTa", ts.MoTa)
    ts.KichHoat = data.get("KichHoat", ts.KichHoat)
    db.session.commit()
    return jsonify({"status": "success", "message": "Cập nhật thành công"})