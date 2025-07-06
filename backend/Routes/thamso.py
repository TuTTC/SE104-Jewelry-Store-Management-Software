from flask import Blueprint, request, jsonify
from models.ThamSo import THAMSO
from database import db
from flask_jwt_extended import jwt_required
from utils.permissions import permission_required
thamso_bp = Blueprint("thamso_bp", __name__)

# Lấy tất cả tham số
@thamso_bp.route("/all", methods=["GET"])
@jwt_required()
@permission_required("parameters:view")
def get_all_thamso():
    items = THAMSO.query.all()
    data = [item.to_dict() for item in items]
    return jsonify({"status": "success", "data": data})

# Lấy tham số theo tên
@thamso_bp.route("/thamso/<string:ten>", methods=["GET"])
def get_thamso_by_name(ten):
    ts = THAMSO.query.filter_by(TenThamSo=ten).first()
    if not ts:
        return jsonify({"status": "error", "message": "Không tìm thấy tham số"}), 404
    return jsonify({"status": "success", "data": ts.to_dict()})

# Cập nhật tham số
@thamso_bp.route("/thamso/<string:ten>", methods=["PUT"])
@jwt_required()
@permission_required("services:edit")
def update_thamso(ten):
    data = request.get_json()
    ts = THAMSO.query.filter_by(TenThamSo=ten).first()
    if not ts:
        return jsonify({"status": "error", "message": "Không tìm thấy tham số"}), 404

    ts.GiaTri = data.get("GiaTri", ts.GiaTri)
    ts.MoTa = data.get("MoTa", ts.MoTa)
    ts.KichHoat = data.get("KichHoat", ts.KichHoat)
    db.session.commit()
    return jsonify({"status": "success", "message": "Cập nhật thành công"})