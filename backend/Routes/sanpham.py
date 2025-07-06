from flask import Blueprint, jsonify
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC

sanpham_bp = Blueprint("sanpham", __name__)

@sanpham_bp.route("/sanpham/<int:id>", methods=["GET"])
def get_sanpham_by_id(id):
    sp = SANPHAM.query.get(id)
    dm = DANHMUC.query.get(sp.MaDM) if sp else None
    if not sp:
        return jsonify({"status": "error", "message": "Không tìm thấy sản phẩm"}), 404

    return jsonify({
        "status": "success",
        "data": {
            "maSP": sp.MaSP,
            "tenSP": sp.TenSP,
            "maDM": sp.MaDM,
            "tenDM": dm.TenDM if dm else None,
            "maNCC": sp.MaNCC,
            "soLuongTon": sp.SoLuongTon,
            "donGia": float(sp.GiaBan),
            "moTa": sp.MoTa
        }
    })