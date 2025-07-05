from flask import Blueprint, request, jsonify, make_response, send_file
from datetime import datetime
from sqlalchemy import extract
from datetime import date
from models.TonKho import TONKHO
from models.BaoCao import BAOCAO
from models.DonHang import DONHANG
from database import db
from sqlalchemy import func, desc
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

baocao_bp = Blueprint("baocao", __name__, url_prefix="/api")

@baocao_bp.route("/baocao", methods=["POST"])
def tao_bao_cao():
    data = request.get_json()
    loai      = data["LoaiBaoCao"]
    tu_ngay = datetime.strptime(data.get("TuNgay"), "%Y-%m-%d").date()
    den_ngay= datetime.strptime(data.get("DenNgay"), "%Y-%m-%d").date()
    mo_ta    = data.get("MoTa", "")
    nguoi_tao = data.get("NguoiTao", 1)

    # Ví dụ với báo cáo doanh thu: tổng TongTien của DONHANG.NgayDat trong khoảng
    total = 0
    if loai == "Doanh thu":
        total = db.session.query(
            func.coalesce(func.sum(DONHANG.TongTien), 0)
        ).filter(
            func.date(DONHANG.NgayDat) >= tu_ngay,
            func.date(DONHANG.NgayDat) <= den_ngay
        ).scalar()

    report = BAOCAO(
        LoaiBaoCao    = loai,
        TuNgay        = tu_ngay,
        DenNgay       = den_ngay,
        MoTa          = mo_ta,
        NguoiTao      = nguoi_tao
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({
      "status":"success", 
      "data": {
        "MaBC": report.MaBC,
        "LoaiBaoCao": report.LoaiBaoCao,
        "TuNgay": report.TuNgay.isoformat(),
        "DenNgay": report.DenNgay.isoformat(),
        "MoTa": report.MoTa,
        "TaoNgay": report.TaoNgay.isoformat()
      }
    }), 201


# Cập nhật báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['PUT'])
def update_baocao(id):
    try:
        data = request.get_json()
        bc = BAOCAO.query.get_or_404(id)

        # Lấy giá trị mới, nếu không có thì giữ nguyên
        bc.LoaiBaoCao = data.get('LoaiBaoCao', bc.LoaiBaoCao)

        # parse TuNgay và DenNgay từ client gửi lên
        if data.get('TuNgay'):
            bc.TuNgay = datetime.strptime(data['TuNgay'], '%Y-%m-%d').date()
        if data.get('DenNgay'):
            bc.DenNgay = datetime.strptime(data['DenNgay'], '%Y-%m-%d').date()

        bc.MoTa = data.get('MoTa', bc.MoTa)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Cập nhật báo cáo thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
    

# Xóa báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['DELETE'])
def delete_baocao(id):
    bc = BAOCAO.query.get_or_404(id)
    db.session.delete(bc)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa báo cáo thành công'})

# Lấy danh sách tất cả báo cáo

@baocao_bp.route('/baocao', methods=['GET'])
def list_baocao():
    reports = BAOCAO.query.order_by(BAOCAO.TuNgay.desc()).all()
    result = []

    for r in reports:
        du_lieu = None

        if r.LoaiBaoCao == "Doanh thu":
            # Tính tổng TongTien từ DONHANG trong khoảng [TuNgay, DenNgay]
            total = db.session.query(
                func.coalesce(func.sum(DONHANG.TongTien), 0)
            ).filter(
                DONHANG.NgayDat >= r.TuNgay,
                DONHANG.NgayDat <= r.DenNgay
            ).scalar()
            du_lieu = float(total)

        elif r.LoaiBaoCao == "Tồn kho":
            # Lấy tồn kho mới nhất theo MaSP trong khoảng TuNgay - DenNgay
            sub = (
                db.session.query(
                    TONKHO.MaSP,
                    func.max(TONKHO.NgayCapNhat).label("max_ngay")
                )
                .filter(TONKHO.NgayCapNhat >= r.TuNgay,
                        TONKHO.NgayCapNhat <= r.DenNgay)
                .group_by(TONKHO.MaSP)
                .subquery()
            )

            rows = (
                db.session.query(TONKHO.MaSP, TONKHO.SoLuongTon)
                .join(sub, (TONKHO.MaSP == sub.c.MaSP) &
                           (TONKHO.NgayCapNhat == sub.c.max_ngay))
                .all()
            )

            du_lieu = [{"MaSP": sp, "SoLuongTon": qty} for sp, qty in rows]

        result.append({
            "MaBC":       r.MaBC,
            "LoaiBaoCao": r.LoaiBaoCao,
            "TuNgay":     r.TuNgay.strftime("%Y-%m-%d"),
            "DenNgay":    r.DenNgay.strftime("%Y-%m-%d"),
            "DuLieu":     du_lieu,
            "MoTa":       r.MoTa or "",
            "TaoNgay":    r.TaoNgay.strftime("%Y-%m-%d %H:%M:%S"),
            "NguoiTao":   r.NguoiTao
        })

    return jsonify({"status": "success", "data": result})


# Báo cáo tồn kho
@baocao_bp.route('/baocao/tonkho', methods=['GET'])
def baocao_ton_kho():
    reports = BAOCAO.query.filter(BAOCAO.LoaiBaoCao == 'Tồn kho').all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})

# Xem/print báo cáo ra PDF
@baocao_bp.route("/baocao/<int:id>/print", methods=["GET"])
def print_bao_cao(id):
    reports = BAOCAO.query.order_by(BAOCAO.TuNgay.desc()).all()

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica", 12)

    y = height - 40
    c.drawString(40, y, "BAO CAO & THONG KE")
    y -= 30

    headers = ["ID", "Loai", "Tu ngay", "Den ngay", "Du lieu", "Ngay tao"]
    x_positions = [40, 80, 180, 280, 380, 480]
    for x, h in zip(x_positions, headers):
        c.drawString(x, y, h)
    y -= 20

    for r in reports:
        if r.LoaiBaoCao == "Doanh thu":
            du_lieu = db.session.query(
                func.coalesce(func.sum(DONHANG.TongTien), 0.0)
            ).filter(
                DONHANG.NgayDat >= r.TuNgay,
                DONHANG.NgayDat <= r.DenNgay
            ).scalar() or 0.0
            du_lieu_str = f"{float(du_lieu):,.0f} VND"

        elif r.LoaiBaoCao == "Tồn kho":
            from models.TonKho import TONKHO
            tonkho_list = db.session.query(
                TONKHO.MaSP,
                TONKHO.SoLuongTon
            ).filter(
                TONKHO.NgayCapNhat >= r.TuNgay,
                TONKHO.NgayCapNhat <= r.DenNgay
            ).all()

            if tonkho_list:
                du_lieu_str = "; ".join([f"SP#{MaSP}: {SoLuongTon}" for MaSP, SoLuongTon in tonkho_list])
            else:
                du_lieu_str = "Không có dữ liệu"
        else:
            du_lieu_str = "Không xác định"

        vals = [
            str(r.MaBC),
            r.LoaiBaoCao,
            r.TuNgay.strftime("%Y-%m-%d"),
            r.DenNgay.strftime("%Y-%m-%d"),
            du_lieu_str,
            r.TaoNgay.strftime("%Y-%m-%d")
        ]
        for x, v in zip(x_positions, vals):
            c.drawString(x, y, str(v)[:30])
        y -= 18
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 12)
            y = height - 40

    c.save()
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name="BaoCao.pdf",
        mimetype="application/pdf"
    )