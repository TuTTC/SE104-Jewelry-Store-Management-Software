from flask import Blueprint, request, jsonify
from models.NhaCungCap import NHACUNGCAP
from database import db

supplier_bp = Blueprint('supplier_bp', __name__)

# Lấy tất cả nhà cung cấp
@supplier_bp.route("/", methods=["GET"])
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
def delete_supplier(ma_ncc):
    supplier = NHACUNGCAP.query.get(ma_ncc)

    if not supplier:
        return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404

    try:
        db.session.delete(supplier)
        db.session.commit()
        return jsonify({"message": "Xóa thành công!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
