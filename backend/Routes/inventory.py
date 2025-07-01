from flask import Blueprint, jsonify, request
from models.TonKho import TONKHO
from models.SanPham import SANPHAM
from database import db
from datetime import datetime

tonkho_bp = Blueprint("tonkho_bp", __name__)


# Lấy toàn bộ danh sách tồn kho
@tonkho_bp.route("/", methods=["GET"])
def get_all_tonkho():
    tonkho_list = TONKHO.query.all()
    result = []
    for tk in tonkho_list:
        result.append({
            "MaTK": tk.MaTK,
            "MaSP": tk.MaSP,
            "TenSP": tk.sanpham.TenSP if tk.sanpham else None,
            "SoLuongTon": tk.SoLuongTon,
            "NgayCapNhat": tk.NgayCapNhat,
            "MucCanhBao": tk.MucCanhBao
        })
    return jsonify(result)


# Lấy tồn kho theo ID
@tonkho_bp.route("/<int:id>", methods=["GET"])
def get_tonkho_by_id(id):
    tk = TONKHO.query.get_or_404(id)
    return jsonify({
        "MaTK": tk.MaTK,
        "MaSP": tk.MaSP,
        "TenSP": tk.sanpham.TenSP if tk.sanpham else None,
        "SoLuongTon": tk.SoLuongTon,
        "NgayCapNhat": tk.NgayCapNhat,
        "MucCanhBao": tk.MucCanhBao
    })


# Thêm mới tồn kho
@tonkho_bp.route("/", methods=["POST"])
def create_tonkho():
    data = request.get_json()

    if not data or "MaSP" not in data:
        return jsonify({"error": "Thiếu thông tin MaSP"}), 400

    # Kiểm tra sản phẩm tồn tại
    sanpham = SANPHAM.query.get(data["MaSP"])
    if not sanpham:
        return jsonify({"error": "Sản phẩm không tồn tại"}), 404

    new_tonkho = TONKHO(
        MaSP=data["MaSP"],
        SoLuongTon=data.get("SoLuongTon", 0),
        MucCanhBao=data.get("MucCanhBao", 10)
    )
    db.session.add(new_tonkho)
    db.session.commit()

    return jsonify({"message": "Thêm tồn kho thành công", "MaTK": new_tonkho.MaTK}), 201


# Cập nhật tồn kho
@tonkho_bp.route("/<int:id>", methods=["PUT"])
def update_tonkho(id):
    tk = TONKHO.query.get_or_404(id)
    data = request.get_json()

    if "SoLuongTon" in data:
        tk.SoLuongTon = data["SoLuongTon"]
    if "MucCanhBao" in data:
        tk.MucCanhBao = data["MucCanhBao"]

    db.session.commit()
    return jsonify({"message": "Cập nhật tồn kho thành công"})


# Xóa tồn kho
@tonkho_bp.route("/<int:id>", methods=["DELETE"])
def delete_tonkho(id):
    tk = TONKHO.query.get_or_404(id)
    db.session.delete(tk)
    db.session.commit()
    return jsonify({"message": "Xóa tồn kho thành công"})


# @tonkho_bp.route("/capnhat_all", methods=["PUT"])
# def capnhat_toan_bo_tonkho():
#     """
#     Cập nhật toàn bộ bảng tồn kho một lượt
#     Expect JSON dạng:
#     [
#         { "MaSP": 1, "SoLuongTon": 100 },
#         { "MaSP": 2, "SoLuongTon": 50 },
#         ...
#     ]
#     """
#     data = request.get_json()
#     if not data or not isinstance(data, list):
#         return jsonify({"error": "Dữ liệu không hợp lệ, cần gửi danh sách"}), 400

#     try:
#         for item in data:
#             masp = item.get("MaSP")
#             soluongton_moi = int(item.get("SoLuongTon", -1))

#             if masp is None or soluongton_moi < 0:
#                 continue  # Bỏ qua sản phẩm lỗi dữ liệu

#             sanpham = SANPHAM.query.get(masp)
#             if not sanpham:
#                 continue  # Bỏ qua sản phẩm không tồn tại

#             sanpham.SoLuongTon = soluongton_moi

#             tonkho = TONKHO.query.filter_by(MaSP=masp).first()
#             if tonkho:
#                 tonkho.SoLuongTon = soluongton_moi
#             else:
#                 tonkho = TONKHO(MaSP=masp, SoLuongTon=soluongton_moi)
#                 db.session.add(tonkho)

#         db.session.commit()
#         return jsonify({"message": "Cập nhật toàn bộ tồn kho thành công"})
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# API cập nhật số lượng tồn trong sản phẩm và đồng bộ sang bảng tồn kho
# API cập nhật số lượng tồn kho hàng loạt và đồng bộ bảng TONKHO
# API đồng bộ tồn kho từ bảng SANPHAM
@tonkho_bp.route("/capnhat_all", methods=["PUT"])
def dong_bo_tonkho_tu_sanpham():
    """
    Lấy toàn bộ dữ liệu từ bảng SANPHAM,
    Đồng bộ sang bảng TONKHO (thêm mới hoặc cập nhật)
    """
    danh_sach_sp = SANPHAM.query.all()

    for sp in danh_sach_sp:
        masp = sp.MaSP
        soluongton = sp.SoLuongTon

        tonkho = TONKHO.query.filter_by(MaSP=masp).first()
        if tonkho:
            tonkho.SoLuongTon = soluongton
            tonkho.NgayCapNhat = datetime.utcnow()
        else:
            tonkho = TONKHO(
                MaSP=masp,
                SoLuongTon=soluongton,
                NgayCapNhat=datetime.utcnow()
            )
            db.session.add(tonkho)

    db.session.commit()

    return jsonify({"message": "Đồng bộ tồn kho thành công từ bảng sản phẩm"}), 200