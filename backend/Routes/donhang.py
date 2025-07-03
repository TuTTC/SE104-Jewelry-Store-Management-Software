from flask import Blueprint, request, jsonify
from models.DonHang import DONHANG
from models.KhachHang import KHACHHANG
from models.ChiTietDonHang import CHITIETDONHANG
from models.ThamSo import THAMSO
from database import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from flask import make_response
from io import BytesIO
from sqlalchemy import func
from decimal import Decimal
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

donhang_bp = Blueprint("donhang", __name__, url_prefix="/api")

# GET /api/donhang - Lấy danh sách đơn hàng
@donhang_bp.route("/donhang", methods=["GET"])
@jwt_required()
@permission_required("orders:view")
def get_danh_sach_donhang():
    try:
        donhangs = DONHANG.query.all()
        data = []
        for dh in donhangs:
            # Compute true total from the order's detail lines
            true_total = sum(ct.ThanhTien for ct in dh.chitietdonhang_list)

            # If you want to persist the updated total in the DB:
            # dh.TongTien = true_total
            # db.session.add(dh)

            data.append({
                "id": dh.MaDH,
                "orderCode": f"DH{dh.MaDH:04}",
                "customerId": dh.MaKH,
                "customer": dh.khachhang.HoTen if dh.khachhang else "(Không rõ)",
                "date": dh.NgayDat.strftime("%Y-%m-%d"),
                "total": float(true_total),
                "status": dh.TrangThai,
                "paymentMethod": "Chuyển khoản",
                "deliveryAddress": dh.khachhang.DiaChi if dh.khachhang else ""
            })

        # Uncomment to save the recalculated totals:
        # db.session.commit()

        return jsonify({"status": "success", "data": data})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


# POST /api/donhang - Tạo đơn hàng mới
@donhang_bp.route("/donhang", methods=["POST"])
@jwt_required()
@permission_required("orders:add")
def tao_don_hang():
    try:
        data = request.get_json()
        ma_kh = int(data.get("MaKH"))
        khach = KHACHHANG.query.get(ma_kh)
        if not khach:
            return jsonify({"status": "error", "message": ": Khách hàng không tồn tại."}), 400

        donhang = THAMSO(
            MaKH=ma_kh,
            NgayDat=datetime.strptime(data.get("NgayDat"), "%Y-%m-%d"),
            TongTien=data.get("TongTien"),
            TrangThai=data.get("TrangThai", "Pending")
        )
        db.session.add(donhang)
        db.session.commit()
        return jsonify({"status": "success", "message": "Tạo đơn hàng thành công.", "id": donhang.MaDH})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
# PUT /api/donhang/<id>/trangthai - Cập nhật trạng thái đơn hàng
@donhang_bp.route("/donhang/<int:id>/trangthai", methods=["PUT"])
@jwt_required()
@permission_required("orders:edit")
def cap_nhat_trang_thai(id):
    try:
        data = request.get_json()
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Đơn hàng không tồn tại."})
        donhang.TrangThai = data.get("TrangThai")
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã cập nhật trạng thái."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# POST /api/donhang/<id>/thanhtoan - Xác nhận thanh toán
@donhang_bp.route("/donhang/<int:id>/thanhtoan", methods=["POST"])
@jwt_required()
@permission_required("orders:edit")
def xac_nhan_thanh_toan(id):
    try:
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Không tìm thấy đơn hàng."})
        donhang.TrangThai = "Paid"
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã xác nhận thanh toán."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# POST /api/donhang/<id>/giaohang - Đóng gói và giao hàng
@donhang_bp.route("/donhang/<int:id>/giaohang", methods=["POST"])
@jwt_required()
@permission_required("orders:edit")
def dong_goi_giao_hang(id):
    try:
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Không tìm thấy đơn hàng."})
        donhang.TrangThai = "Shipped"
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã cập nhật trạng thái giao hàng."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# POST /api/donhang/<id>/doitra - Tạo yêu cầu trả/đổi hàng
@donhang_bp.route("/donhang/<int:id>/doitra", methods=["POST"])
@jwt_required()
@permission_required("orders:edit")
def doi_tra_don_hang(id):
    try:
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Không tìm thấy đơn hàng."})
        donhang.TrangThai = "ReturnRequested"
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã tạo yêu cầu trả/đổi."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# DELETE /api/donhang/<id> - Xóa đơn hàng
@donhang_bp.route("/donhang/<int:id>", methods=["DELETE"])
@jwt_required()
@permission_required("orders:delete")
def xoa_don_hang(id):
    try:
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Đơn hàng không tồn tại."})
        db.session.delete(donhang)
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã xóa đơn hàng."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# Sửa thông tin đơn hàng
# PUT /api/donhang/<id> - Cập nhật thông tin đơn hàng
@donhang_bp.route("/donhang/<int:id>", methods=["PUT"])
@jwt_required()
@permission_required("orders:edit")
def sua_don_hang(id):
    try:
        data = request.get_json()
        donhang = THAMSO.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Đơn hàng không tồn tại"}), 404

        ma_kh = data.get("MaKH")
        if not ma_kh:
            return jsonify({"status": "error", "message": "Thiếu MaKH"}), 400

        khach = KHACHHANG.query.get(ma_kh)
        if not khach:
            return jsonify({"status": "error", "message": "Khách hàng không tồn tại"}), 404

        donhang.MaKH = ma_kh
        donhang.NgayDat = datetime.strptime(data.get("NgayDat"), "%Y-%m-%d")
        donhang.TongTien = data.get("TongTien")
        donhang.TrangThai = data.get("TrangThai")

        db.session.commit()
        return jsonify({"status": "success", "message": "Đã cập nhật đơn hàng."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# GET /api/donhang/<id>/chitiet - Lấy chi tiết đơn hàng
@donhang_bp.route("/donhang/<int:id>/chitiet", methods=["GET"])
@jwt_required()
@permission_required("orders:edit")
def chi_tiet_don_hang(id):
    try:
        ctdh_list = CHITIETDONHANG.query.filter_by(MaDH=id).all()
        data = [
            {
                "MaCTDH": ct.MaCTDH,
                "MaSP": ct.MaSP,
                "SoLuong": ct.SoLuong,
                "GiaBan": float(ct.GiaBan),
                "ThanhTien": float(ct.ThanhTien)
            } for ct in ctdh_list
        ]
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
# POST /api/donhang/<id>/chitiet - Cập nhật chi tiết đơn hàng
@donhang_bp.route("/donhang/<int:id>/chitiet", methods=["POST"])
@jwt_required()
@permission_required("orders:edit")
def cap_nhat_chi_tiet_don_hang(id):
    try:
        data = request.get_json()  # list of { MaCTDH?, MaSP, SoLuong, GiaBan }

        # 1. Lấy tất cả chi tiết hiện có
        existing = {ct.MaCTDH: ct for ct in CHITIETDONHANG.query.filter_by(MaDH=id).all()}
        incoming_ids = set()

        # 2. Duyệt payload, cập nhật hoặc tạo mới
        for item in data:
            MaSP    = int(item.get("MaSP", 0))
            SoLuong = int(item.get("SoLuong", 0))
            GiaBan  = float(item.get("GiaBan", 0))
            ThanhTien = SoLuong * GiaBan
            ct_id = item.get("MaCTDH")

            if ct_id and ct_id in existing:
                ct = existing[ct_id]
                ct.MaSP      = MaSP
                ct.SoLuong   = SoLuong
                ct.GiaBan    = GiaBan
                ct.ThanhTien = ThanhTien
                incoming_ids.add(ct_id)
            else:
                new_ct = CHITIETDONHANG(
                    MaDH     = id,
                    MaSP     = MaSP,
                    SoLuong  = SoLuong,
                    GiaBan   = GiaBan,
                    ThanhTien= ThanhTien
                )
                db.session.add(new_ct)

        # 3. Xóa những chi tiết đã bị loại
        for old_id, ct in existing.items():
            if old_id not in incoming_ids:
                db.session.delete(ct)

        # 4. Tính lại tổng tiền của DonHang trên DB
        #    có 2 cách: truy vấn sum qua SQL hoặc Python
        #    Ví dụ dùng SQLAlchemy func.sum:
        new_total = db.session.query(
            func.coalesce(func.sum(CHITIETDONHANG.ThanhTien), 0)
        ).filter(CHITIETDONHANG.MaDH == id).scalar()

        # 5. Gán lại vào DonHang.TongTien
        donhang = THAMSO.query.get_or_404(id)
        donhang.TongTien = Decimal(new_total)
        db.session.add(donhang)

        # 6. Commit tất cả thay đổi
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Cập nhật thành công.",
            "newTotal": float(new_total)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
# GET /api/donhang/<id>/chitiet/pdf - Xuất chi tiết đơn hàng ra PDF
@donhang_bp.route("/donhang/<int:id>/chitiet/pdf", methods=["GET"])
@jwt_required()
@permission_required("orders:view")
def xuat_pdf_chi_tiet_don(id):
    try:
        ctdh_list = CHITIETDONHANG.query.filter_by(MaDH=id).all()
        if not ctdh_list:
            return jsonify({"status": "error", "message": "Không có chi tiết đơn hàng."}), 404

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        p.setFont("Helvetica", 12)
        p.drawString(100, 800, f"Chi tiet don hang #{id}")

        y = 770
        p.drawString(60, y, "Ma SP")
        p.drawString(120, y, "So luong")
        p.drawString(200, y, "Gia ban")
        p.drawString(300, y, "Thanh tien")
        y -= 20

        for ct in ctdh_list:
            p.drawString(60, y, str(ct.MaSP))
            p.drawString(120, y, str(ct.SoLuong))
            p.drawString(200, y, f"{float(ct.GiaBan):,.2f}")
            p.drawString(300, y, f"{float(ct.ThanhTien):,.2f}")
            y -= 20
            if y < 100:
                p.showPage()
                y = 770

        p.save()
        buffer.seek(0)
        return make_response(buffer.read(), 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'inline; filename=chitiet_donhang_{id}.pdf'
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500