from flask import Blueprint, request, jsonify
from models.NhaCungCap import NHACUNGCAP
from models.PhieuNhap import PHIEUNHAP
from database import db
from flask_jwt_extended import jwt_required
from utils.permissions import permission_required
from sqlalchemy.exc import IntegrityError
supplier_bp = Blueprint('supplier_bp', __name__)

# Lấy tất cả nhà cung cấp
@supplier_bp.route("/", methods=["GET"])
@jwt_required()
@permission_required("suppliers:view")
def get_all_suppliers():
    suppliers = NHACUNGCAP.query.all()
    result = []
    for s in suppliers:
        result.append({
            "MaNCC": s.MaNCC,
            "TenNCC": s.TenNCC,
            "SoDienThoai": s.SoDienThoai,
            "Email": s.Email,
            "DiaChi": s.DiaChi,
            "NgayHopTac": s.NgayHopTac.isoformat() if s.NgayHopTac else None,
            "GhiChu": s.GhiChu
        })
    return jsonify(result), 200


# Thêm nhà cung cấp
@supplier_bp.route("/", methods=["POST"])
@jwt_required()
@permission_required("suppliers:add")
def add_supplier():
    data = request.get_json()

    try:
        new_supplier = NHACUNGCAP(
            TenNCC=data.get("TenNCC"),
            SoDienThoai=data.get("SoDienThoai"),
            Email=data.get("Email"),
            DiaChi=data.get("DiaChi"),
            NgayHopTac=data.get("NgayHopTac"),
            GhiChu=data.get("GhiChu")
        )
        db.session.add(new_supplier)
        db.session.commit()
        return jsonify({"message": "Thêm nhà cung cấp thành công!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Sửa nhà cung cấp
@supplier_bp.route("/<int:ma_ncc>", methods=["PUT"])
@jwt_required()
@permission_required("suppliers:edit")
def update_supplier(ma_ncc):
    data = request.get_json()
    supplier = NHACUNGCAP.query.get(ma_ncc)

    if not supplier:
        return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404

    try:
        supplier.TenNCC = data.get("TenNCC", supplier.TenNCC)
        supplier.SoDienThoai = data.get("SoDienThoai", supplier.SoDienThoai)
        supplier.Email = data.get("Email", supplier.Email)
        supplier.DiaChi = data.get("DiaChi", supplier.DiaChi)
        supplier.NgayHopTac = data.get("NgayHopTac", supplier.NgayHopTac)
        supplier.GhiChu = data.get("GhiChu", supplier.GhiChu)

        db.session.commit()
        return jsonify({"message": "Cập nhật thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Xóa nhà cung cấp
@supplier_bp.route("/<int:ma_ncc>", methods=["DELETE"])
@jwt_required()
@permission_required("suppliers:delete")
def delete_supplier(ma_ncc):
    supplier = NHACUNGCAP.query.get(ma_ncc)

    if not supplier:
        return jsonify({"status": "error", "message": "Nhà cung cấp không tồn tại."}), 404

    if PHIEUNHAP.query.filter_by(MaNCC=ma_ncc).first():
        return jsonify({
            "status": "error",
            "message": "Không thể xóa nhà cung cấp vì đã phát sinh phiếu nhập."
        }), 400    

    try:
        db.session.delete(supplier)
        db.session.commit()
        return jsonify({"status": "success", "message": "Xóa nhà cung cấp thành công."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 400
