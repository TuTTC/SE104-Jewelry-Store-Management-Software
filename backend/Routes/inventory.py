from flask import Blueprint, jsonify, request
from models.TonKho import TONKHO
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.PhieuNhap import PHIEUNHAP
from models.ChiTietDonHang import CHITIETDONHANG
from models.DonHang import DONHANG
from database import db
from datetime import datetime
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from flask import send_file
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('DejaVu', '../fonts/times.ttf'))

tonkho_bp = Blueprint("tonkho_bp", __name__)

# Giả sử bạn tính tồn đầu tháng = tồn cuối tháng trước
def tinh_ton_dau_thang(ma_sp, month, year):
    try:
        # Xác định tháng trước
        if month == 1:
            prev_month = 12
            prev_year = year - 1
        else:
            prev_month = month - 1
            prev_year = year

        # Tổng số lượng mua vào đến hết tháng trước
        tong_mua_vao = db.session.query(func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0))\
            .join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN)\
            .filter(
                CHITIETPHIEUNHAP.MaSP == ma_sp,
                PHIEUNHAP.TrangThai == "da_nhap",
                func.extract('year', PHIEUNHAP.NgayNhap) < year
            ).scalar() + db.session.query(func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0))\
            .join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN)\
            .filter(
                CHITIETPHIEUNHAP.MaSP == ma_sp,
                PHIEUNHAP.TrangThai == "da_nhap",
                func.extract('year', PHIEUNHAP.NgayNhap) == year,
                func.extract('month', PHIEUNHAP.NgayNhap) <= prev_month
            ).scalar()

        # Tổng số lượng bán ra đến hết tháng trước
        tong_ban_ra = db.session.query(func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0))\
            .join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH)\
            .filter(
                CHITIETDONHANG.MaSP == ma_sp,
                DONHANG.TrangThai == "Completed",
                func.extract('year', DONHANG.NgayDat) < year
            ).scalar() + db.session.query(func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0))\
            .join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH)\
            .filter(
                CHITIETDONHANG.MaSP == ma_sp,
                DONHANG.TrangThai == "Completed",
                func.extract('year', DONHANG.NgayDat) == year,
                func.extract('month', DONHANG.NgayDat) <= prev_month
            ).scalar()

        ton_dau = tong_mua_vao - tong_ban_ra
        return ton_dau
    except Exception as e:
        print("Lỗi tính tồn đầu tháng:", e)
        return 0

# Lấy toàn bộ danh sách tồn kho
@tonkho_bp.route("/", methods=["GET"])
@jwt_required()
@permission_required("inventory:view")
def get_full_tonkho():
    try:
        current_user = get_jwt_identity()
        print("Thông tin user:", current_user)
        # Tự động lấy tháng/năm hiện tại
        now = datetime.now()
        month = now.month
        year = now.year
        tonkho_list = TONKHO.query.all()
        result = []

        stt = 1
        for tk in tonkho_list:
            sanpham = SANPHAM.query.get(tk.MaSP)
            danhmuc = DANHMUC.query.get(sanpham.MaDM) if sanpham and sanpham.MaDM else None
            # Tính tồn đầu theo tháng/năm
            ton_dau = tinh_ton_dau_thang(tk.MaSP, month, year)
            # Tổng số lượng mua vào từ phiếu nhập ĐÃ NHẬP
            so_luong_mua_vao = db.session.query(
                func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0)
            ).join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN) \
            .filter(CHITIETPHIEUNHAP.MaSP == tk.MaSP, PHIEUNHAP.TrangThai == "da_nhap") \
            .scalar()

            # Tổng số lượng bán ra từ đơn hàng COMPLETED
            so_luong_ban_ra = db.session.query(
                func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0)
            ).join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH) \
            .filter(CHITIETDONHANG.MaSP == tk.MaSP, DONHANG.TrangThai == "Completed") \
            .scalar()

            # ton_dau = tk.TonDau if hasattr(tk, "TonDau") else 0
            
            ton_cuoi = ton_dau + so_luong_mua_vao - so_luong_ban_ra

            result.append({
                "STT": stt,
                "TenSP": sanpham.TenSP if sanpham else None,
                "TonDau": ton_dau,
                "SoLuongMuaVao": so_luong_mua_vao,
                "SoLuongBanRa": so_luong_ban_ra,
                "TonCuoi": ton_cuoi,
                "DonViTinh": danhmuc.DonViTinh if danhmuc else None,
                "NgayCapNhat": tk.NgayCapNhat,
                "MucCanhBao": tk.MucCanhBao
            })

            stt += 1

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


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
@jwt_required()
@permission_required("inventory:add")
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
@jwt_required()
@permission_required("inventory:edit")
def update_tonkho(id):
    tk = TONKHO.query.get_or_404(id)
    data = request.get_json()

    try:
        # Cập nhật tồn đầu nếu có
        if "TonDau" in data:
            tk.TonDau = data["TonDau"]

        # Cập nhật số lượng tồn hiện tại nếu có
        if "SoLuongTon" in data:
            tk.SoLuongTon = data["SoLuongTon"]

        # Cập nhật mức cảnh báo nếu có
        if "MucCanhBao" in data:
            tk.MucCanhBao = data["MucCanhBao"]

        db.session.commit()
        return jsonify({"message": "Cập nhật tồn kho thành công"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500



# Xóa tồn kho
@tonkho_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@permission_required("inventory:delete")
def delete_tonkho(id):
    tk = TONKHO.query.get_or_404(id)
    db.session.delete(tk)
    db.session.commit()
    return jsonify({"message": "Xóa tồn kho thành công"})


@tonkho_bp.route("/export", methods=["GET"])
@jwt_required()
@permission_required("inventory:view")
def export_bao_cao_ton_kho():
    try:
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        # Tiêu đề
        c.setFont("DejaVu", 16)
        c.drawCentredString(width / 2, height - 50, "BÁO CÁO TỒN KHO")

        # Ngày tháng
        c.setFont("DejaVu", 12)
        thang = datetime.now().strftime("%m/%Y")
        c.drawString(50, height - 80, f"Tháng: {thang}")

        # Chuẩn bị dữ liệu bảng
        data = [["Stt", "Sản phẩm", "Tồn đầu", "Số lượng mua vào", "Số lượng bán ra", "Tồn cuối", "Đơn vị tính"]]

        tonkho_list = TONKHO.query.all()
        stt = 1

        for tk in tonkho_list:
            sanpham = SANPHAM.query.get(tk.MaSP)
            danhmuc = DANHMUC.query.get(sanpham.MaDM) if sanpham and sanpham.MaDM else None

            # Số lượng mua vào từ phiếu đã nhập
            mua_vao = db.session.query(
                func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0)
            ).join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN) \
            .filter(CHITIETPHIEUNHAP.MaSP == tk.MaSP, PHIEUNHAP.TrangThai == "Đã nhập").scalar()

            # Số lượng bán ra từ đơn hàng Completed
            ban_ra = db.session.query(
                func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0)
            ).join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH) \
            .filter(CHITIETDONHANG.MaSP == tk.MaSP, DONHANG.TrangThai == "Completed").scalar()

            ton_dau = tk.TonDau if hasattr(tk, "TonDau") else 0
            ton_cuoi = ton_dau + mua_vao - ban_ra

            data.append([
                stt,
                sanpham.TenSP if sanpham else "",
                ton_dau,
                mua_vao,
                ban_ra,
                ton_cuoi,
                danhmuc.TenDM if danhmuc else ""
            ])
            stt += 1

        # Vẽ bảng
        table = Table(data, colWidths=[40, 150, 80, 100, 100, 80, 80])
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'DejaVu'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        table.setStyle(style)

        table.wrapOn(c, width, height)
        table.drawOn(c, 40, height - 150 - len(data) * 20)

        c.save()
        buffer.seek(0)

        return send_file(buffer, as_attachment=True, download_name="bao_cao_ton_kho.pdf", mimetype="application/pdf")

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@tonkho_bp.route("/filter-by-month", methods=["GET"])
@jwt_required()
@permission_required("inventory:view")
def filter_tonkho_by_month():
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)

        if not month or not year:
            return jsonify({"message": "Vui lòng cung cấp đầy đủ tháng và năm."}), 400

        tonkho_list = TONKHO.query.all()
        result = []
        stt = 1

        for tk in tonkho_list:
            sanpham = SANPHAM.query.get(tk.MaSP)
            danhmuc = DANHMUC.query.get(sanpham.MaDM) if sanpham and sanpham.MaDM else None

            # Tính tồn đầu theo tháng/năm truyền vào
            ton_dau = tinh_ton_dau_thang(tk.MaSP, month, year)
            # Số lượng mua vào trong tháng đã nhập
            mua_vao = db.session.query(func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0)) \
                .join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN) \
                .filter(
                    CHITIETPHIEUNHAP.MaSP == tk.MaSP,
                    PHIEUNHAP.TrangThai == "da_nhap",
                    func.extract('month', PHIEUNHAP.NgayNhap) == month,
                    func.extract('year', PHIEUNHAP.NgayNhap) == year
                ).scalar()

            # Số lượng bán ra trong tháng đã completed
            ban_ra = db.session.query(func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0)) \
                .join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH) \
                .filter(
                    CHITIETDONHANG.MaSP == tk.MaSP,
                    DONHANG.TrangThai == "Completed",
                    func.extract('month', DONHANG.NgayDat) == month,
                    func.extract('year', DONHANG.NgayDat) == year
                ).scalar()

            # ton_dau = tk.TonDau if hasattr(tk, "TonDau") else 0
            ton_cuoi = ton_dau + mua_vao - ban_ra

            result.append({
                "STT": stt,
                "TenSP": sanpham.TenSP if sanpham else None,
                "TonDau": ton_dau,
                "SoLuongMuaVao": mua_vao,
                "SoLuongBanRa": ban_ra,
                "TonCuoi": ton_cuoi,
                "DonViTinh": danhmuc.TenDM if danhmuc else None,
                "NgayCapNhat": tk.NgayCapNhat,
                "MucCanhBao": tk.MucCanhBao
            })
            stt += 1

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
@tonkho_bp.route("/export-by-month", methods=["GET"])
@jwt_required()
@permission_required("inventory:view")
def export_bao_cao_ton_kho_theo_thang():
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)

        if not month or not year:
            return jsonify({"message": "Vui lòng cung cấp đầy đủ tháng và năm."}), 400

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        # Tiêu đề căn giữa, màu đen
        c.setFont("DejaVu", 16)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 50, "BÁO CÁO TỒN KHO")

        # Ngày tháng căn giữa bên dưới tiêu đề
        c.setFont("DejaVu", 12)
        c.drawCentredString(width / 2, height - 80, f"Tháng: {month}/{year}")

        # Chuẩn bị dữ liệu bảng
        data = [["STT", "Sản phẩm", "Tồn đầu", "Số lượng mua vào", "Số lượng bán ra", "Tồn cuối", "Đơn vị tính"]]

        tonkho_list = TONKHO.query.all()
        stt = 1

        for tk in tonkho_list:
            sanpham = SANPHAM.query.get(tk.MaSP)
            danhmuc = DANHMUC.query.get(sanpham.MaDM) if sanpham and sanpham.MaDM else None

            ton_dau = tinh_ton_dau_thang(tk.MaSP, month, year)
            mua_vao = db.session.query(func.coalesce(func.sum(CHITIETPHIEUNHAP.SoLuong), 0)) \
                .join(PHIEUNHAP, CHITIETPHIEUNHAP.MaPN == PHIEUNHAP.MaPN) \
                .filter(
                    CHITIETPHIEUNHAP.MaSP == tk.MaSP,
                    PHIEUNHAP.TrangThai == "da_nhap",
                    func.extract('month', PHIEUNHAP.NgayNhap) == month,
                    func.extract('year', PHIEUNHAP.NgayNhap) == year
                ).scalar()

            ban_ra = db.session.query(func.coalesce(func.sum(CHITIETDONHANG.SoLuong), 0)) \
                .join(DONHANG, CHITIETDONHANG.MaDH == DONHANG.MaDH) \
                .filter(
                    CHITIETDONHANG.MaSP == tk.MaSP,
                    DONHANG.TrangThai == "Completed",
                    func.extract('month', DONHANG.NgayDat) == month,
                    func.extract('year', DONHANG.NgayDat) == year
                ).scalar()

            # ton_dau = tk.TonDau if hasattr(tk, "TonDau") else 0
            ton_cuoi = ton_dau + mua_vao - ban_ra

            data.append([
                stt,
                sanpham.TenSP if sanpham else "",
                ton_dau,
                mua_vao,
                ban_ra,
                ton_cuoi,
                danhmuc.TenDM if danhmuc else ""
            ])
            stt += 1

        # Tính toán vị trí để bảng căn giữa theo chiều ngang
        table_width = 40 + 150 + 80 + 100 + 100 + 80 + 80
        start_x = (width - table_width) / 2
        start_y = height - 150 - len(data) * 20

        table = Table(data, colWidths=[40, 150, 80, 100, 100, 80, 80])
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'DejaVu'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        table.setStyle(style)

        table.wrapOn(c, width, height)
        table.drawOn(c, start_x, start_y)

        c.save()
        buffer.seek(0)

        return send_file(buffer, as_attachment=True, download_name=f"bao_cao_ton_kho_{month}_{year}.pdf", mimetype="application/pdf")

    except Exception as e:
        return jsonify({"message": str(e)}), 500


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
@jwt_required()
@permission_required("inventory:edit")
def dong_bo_tonkho_tu_sanpham():
    """
    Đồng bộ số lượng tồn từ bảng SANPHAM sang bảng TONKHO
    """
    danh_sach_sanpham = SANPHAM.query.all()

    for sp in danh_sach_sanpham:
        tonkho = TONKHO.query.filter_by(MaSP=sp.MaSP).first()
        
        if tonkho:
            # Nếu đã có tồn kho -> cập nhật lại số lượng tồn
            tonkho.SoLuongTon = sp.SoLuongTon
        else:
            # Nếu chưa có tồn kho -> thêm mới
            new_tonkho = TONKHO(
                MaSP=sp.MaSP,
                SoLuongTon=sp.SoLuongTon
            )
            db.session.add(new_tonkho)

    db.session.commit()

    return jsonify({"message": "Đồng bộ tồn kho từ sản phẩm thành công!"}), 200