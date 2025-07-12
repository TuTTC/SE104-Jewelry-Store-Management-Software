from flask import Blueprint, request, jsonify, make_response, send_file
from sqlalchemy import extract, func, desc
from datetime import datetime, date, timedelta
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.BaoCao import BAOCAO
from models.DonHang import DONHANG
from models.PhieuDichVu import PHIEUDICHVU
from models.PhieuNhap import PHIEUNHAP
from database import db

reports_bp = Blueprint("reports_bp", __name__)

def tao_baocao_dong(loai_baocao, tu_ngay, den_ngay, mo_ta, nguoi_tao_id):
    if loai_baocao not in ["Doanh thu", "Lợi nhuận"]:
        raise ValueError("Loại báo cáo không hợp lệ.")

    baocao = BAOCAO(
        LoaiBaoCao=loai_baocao,
        TuNgay=tu_ngay,
        DenNgay=den_ngay,
        MoTa=mo_ta,
        NguoiTao=nguoi_tao_id
    )

    don_hangs = DONHANG.query.filter(
        DONHANG.NgayDat.between(tu_ngay, den_ngay),
        DONHANG.TrangThai == "Hoàn thành"
    ).all()

    phieu_dichvus = PHIEUDICHVU.query.filter(
        PHIEUDICHVU.NgayLap.between(tu_ngay, den_ngay),
        PHIEUDICHVU.TrangThai == "Hoàn thành"
    ).all()

    baocao.don_hangs.extend(don_hangs)
    baocao.phieu_dichvus.extend(phieu_dichvus)

    if loai_baocao == "Lợi nhuận":
        phieu_nhaps = PHIEUNHAP.query.filter(
            PHIEUNHAP.NgayNhap.between(tu_ngay, den_ngay),
            PHIEUNHAP.TrangThai == "Đã nhập"
        ).all()
        baocao.phieu_nhaps.extend(phieu_nhaps)

    db.session.add(baocao)
    db.session.commit()

    return baocao

def cap_nhat_baocao_thang_tu_dong():
    """
    Tự động kiểm tra và tạo báo cáo cho các tháng đã kết thúc mà chưa có báo cáo.
    """
    try:
        today = datetime.today()
        current_month = today.month
        current_year = today.year

        # Duyệt từ tháng 1 đến tháng trước của năm hiện tại
        for month in range(1, current_month):
            tu_ngay = datetime(current_year, month, 1)
            
            # Ngày cuối cùng của tháng
            if month == 12:
                den_ngay = datetime(current_year, 12, 31)
            else:
                den_ngay = datetime(current_year, month + 1, 1) - timedelta(days=1)

            # Kiểm tra đã có báo cáo Doanh thu tháng đó chưa
            baocao_dt = BAOCAO.query.filter(
                func.extract("year", BAOCAO.TuNgay) == current_year,
                func.extract("month", BAOCAO.TuNgay) == month,
                BAOCAO.LoaiBaoCao == "Doanh thu"
            ).first()

            if not baocao_dt:
                print(f"Tạo báo cáo Doanh thu tháng {month}/{current_year}")
                tao_baocao_dong("Doanh thu", tu_ngay, den_ngay, f"Báo cáo doanh thu tháng {month}/{current_year}", 1)

            # Kiểm tra đã có báo cáo Lợi nhuận tháng đó chưa
            baocao_ln = BAOCAO.query.filter(
                func.extract("year", BAOCAO.TuNgay) == current_year,
                func.extract("month", BAOCAO.TuNgay) == month,
                BAOCAO.LoaiBaoCao == "Lợi nhuận"
            ).first()

            if not baocao_ln:
                print(f"Tạo báo cáo Lợi nhuận tháng {month}/{current_year}")
                tao_baocao_dong("Lợi nhuận", tu_ngay, den_ngay, f"Báo cáo lợi nhuận tháng {month}/{current_year}", 1)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print(e)


@reports_bp.route("/filter", methods=["GET"])
@jwt_required()
def filter_baocao():
    try:
        month = request.args.get("month", type=int)
        year = request.args.get("year", type=int)
        loai_baocao = request.args.get("loai_baocao")

        if not year:
            return jsonify({"message": "Vui lòng cung cấp năm!"}), 400

        query = BAOCAO.query.filter(extract("year", BAOCAO.TuNgay) == year)

        if month:
            query = query.filter(extract("month", BAOCAO.TuNgay) == month)

        if loai_baocao:
            query = query.filter(BAOCAO.LoaiBaoCao == loai_baocao)

        bao_caos = query.order_by(BAOCAO.TaoNgay.desc()).all()

        result = []
        for bc in bao_caos:
            result.append({
                "MaBC": bc.MaBC,
                "LoaiBaoCao": bc.LoaiBaoCao.value if hasattr(bc.LoaiBaoCao, "value") else bc.LoaiBaoCao,
                "TuNgay": bc.TuNgay.strftime("%Y-%m-%d"),
                "DenNgay": bc.DenNgay.strftime("%Y-%m-%d"),
                "MoTa": bc.MoTa,
                "TaoNgay": bc.TaoNgay.strftime("%Y-%m-%d %H:%M:%S"),
                "NguoiTao": bc.nguoi_tao.HoTen if bc.nguoi_tao else ""
            })

        return jsonify(result), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Đã xảy ra lỗi khi lọc báo cáo."}), 500


@reports_bp.route("/create", methods=["POST"])
@jwt_required()
def create_baocao():
    try:
        data = request.get_json()
        loai_baocao = data.get("LoaiBaoCao")
        tu_ngay = datetime.strptime(data.get("TuNgay"), "%Y-%m-%d")
        den_ngay = datetime.strptime(data.get("DenNgay"), "%Y-%m-%d")
        mo_ta = data.get("MoTa")
        nguoi_tao_id = get_jwt_identity()

        baocao = tao_baocao_dong(loai_baocao, tu_ngay, den_ngay, mo_ta, nguoi_tao_id)

        return jsonify({"message": "Tạo báo cáo thành công.", "MaBC": baocao.MaBC}), 201

    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        print(e)
        return jsonify({"message": "Đã xảy ra lỗi khi tạo báo cáo."}), 500

@reports_bp.route("/<int:baocao_id>", methods=["GET"])
@jwt_required()
def get_baocao_details(baocao_id):
    try:
        baocao = BAOCAO.query.get_or_404(baocao_id)

        don_hangs = [{
            "MaDH": dh.MaDH,
            "NgayDat": dh.NgayDat.strftime("%Y-%m-%d"),
            "TongTien": float(dh.TongTien)
        } for dh in baocao.don_hangs]

        phieu_dichvus = [{
            "MaPDV": pdv.MaPDV,
            "NgayLap": pdv.NgayLap.strftime("%Y-%m-%d"),
            "TongTien": float(pdv.TongTien)
        } for pdv in baocao.phieu_dichvus]

        phieu_nhaps = [{
            "MaPN": pn.MaPN,
            "NgayNhap": pn.NgayNhap.strftime("%Y-%m-%d"),
            "TongTien": float(pn.TongTien)
        } for pn in baocao.phieu_nhaps]

        return jsonify({
            "MaBC": baocao.MaBC,
            "LoaiBaoCao": baocao.LoaiBaoCao.value if hasattr(baocao.LoaiBaoCao, "value") else baocao.LoaiBaoCao,
            "TuNgay": baocao.TuNgay.strftime("%Y-%m-%d"),
            "DenNgay": baocao.DenNgay.strftime("%Y-%m-%d"),
            "MoTa": baocao.MoTa,
            "TaoNgay": baocao.TaoNgay.strftime("%Y-%m-%d %H:%M:%S"),
            "NguoiTao": baocao.nguoi_tao.HoTen if baocao.nguoi_tao else "",
            "DonHangs": don_hangs,
            "PhieuDichVus": phieu_dichvus,
            "PhieuNhaps": phieu_nhaps
        }), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Đã xảy ra lỗi khi lấy chi tiết báo cáo."}), 500

@reports_bp.route("/<int:baocao_id>/export-pdf", methods=["GET"])
@jwt_required()
def export_baocao_pdf(baocao_id):
    try:
        baocao = BAOCAO.query.get_or_404(baocao_id)

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Tiêu đề chính
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width / 2, height - 50, f"BÁO CÁO {baocao.LoaiBaoCao.upper()}")

        # Thời gian: theo tháng nếu cùng tháng/năm
        c.setFont("Helvetica", 12)
        if baocao.TuNgay.month == baocao.DenNgay.month and baocao.TuNgay.year == baocao.DenNgay.year:
            c.drawString(50, height - 100, f"Tháng {baocao.TuNgay.month} năm {baocao.TuNgay.year}")
        else:
            c.drawString(50, height - 100,
                         f"Từ tháng {baocao.TuNgay.month}/{baocao.TuNgay.year} đến {baocao.DenNgay.month}/{baocao.DenNgay.year}")

        # Người tạo
        c.drawString(50, height - 120, f"Người tạo: {baocao.nguoi_tao.HoTen if baocao.nguoi_tao else ''}")

        y = height - 160

        # ======= ĐƠN HÀNG =======
        if baocao.don_hangs:
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Danh sách đơn hàng:")
            y -= 20
            c.setFont("Helvetica", 11)
            for dh in baocao.don_hangs:
                c.drawString(70, y,
                    f"Mã ĐH: {dh.MaDH} | Ngày: {dh.NgayDat.strftime('%d/%m/%Y')} | Tổng tiền: {float(dh.TongTien):,.0f} VND")
                y -= 20
                if y < 50:
                    c.showPage()
                    y = height - 50

        # ======= PHIẾU DỊCH VỤ =======
        if baocao.phieu_dichvus:
            y -= 10
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Danh sách phiếu dịch vụ:")
            y -= 20
            c.setFont("Helvetica", 11)
            for pdv in baocao.phieu_dichvus:
                c.drawString(70, y,
                    f"Mã PDV: {pdv.MaPDV} | Ngày: {pdv.NgayLap.strftime('%d/%m/%Y')} | Tổng tiền: {float(pdv.TongTien):,.0f} VND")
                y -= 20
                if y < 50:
                    c.showPage()
                    y = height - 50

        # ======= PHIẾU NHẬP (chỉ với báo cáo LỢI NHUẬN) =======
        if baocao.LoaiBaoCao == "Lợi nhuận" and baocao.phieu_nhaps:
            y -= 10
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, "Danh sách phiếu nhập:")
            y -= 20
            c.setFont("Helvetica", 11)
            for pn in baocao.phieu_nhaps:
                c.drawString(70, y,
                    f"Mã PN: {pn.MaPN} | Ngày: {pn.NgayNhap.strftime('%d/%m/%Y')} | Tổng tiền: {float(pn.TongTien):,.0f} VND")
                y -= 20
                if y < 50:
                    c.showPage()
                    y = height - 50

        c.showPage()
        c.save()
        buffer.seek(0)

        return send_file(buffer, as_attachment=True, download_name="baocao.pdf", mimetype="application/pdf")

    except Exception as e:
        print(e)
        return jsonify({"message": "Đã xảy ra lỗi khi xuất PDF."}), 500



@reports_bp.route("/auto-update-monthly", methods=["POST"])
@jwt_required()
def auto_update_monthly_reports():
    """
    API admin gọi thủ công để kiểm tra và tạo báo cáo cho các tháng đã kết thúc mà chưa có báo cáo.
    """
    try:
        cap_nhat_baocao_thang_tu_dong()
        return jsonify({"message": "Đã cập nhật báo cáo các tháng đã kết thúc."}), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Đã xảy ra lỗi khi cập nhật báo cáo."}), 500
