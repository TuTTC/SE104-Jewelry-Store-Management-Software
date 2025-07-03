from flask import Blueprint, request, jsonify
from models.DonHang import DONHANG
from models.KhachHang import KHACHHANG
from models.ChiTietDonHang import CHITIETDONHANG
from models.SanPham import SANPHAM
from database import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from flask import make_response
from io import BytesIO
from sqlalchemy import func
from decimal import Decimal
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
donhang_bp = Blueprint("donhang", __name__, url_prefix="/api")

# GET /api/donhang - Lấy danh sách đơn hàng
@donhang_bp.route("/donhang", methods=["GET"])
def get_danh_sach_donhang():
    try:
        donhangs = DONHANG.query.all()
        data = []
        for dh in donhangs:
            # Tính tổng tiền thực tế từ các dòng chi tiết đơn hàng
            true_total = sum(ct.ThanhTien for ct in dh.chitietdonhang_list)
            
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


        return jsonify({"status": "success", "data": data})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


# POST /api/donhang - Tạo đơn hàng mới
@donhang_bp.route("/donhang", methods=["POST"])
def tao_don_hang():
    try:
        data = request.get_json()
        ma_kh = int(data.get("MaKH"))

        khach = KHACHHANG.query.get(ma_kh)
        if not khach:
            return jsonify({"status": "error", "message": "Khách hàng không tồn tại."}), 400

        # Tạo đơn hàng mới (chưa có chi tiết)
        donhang = DONHANG(
            MaKH=ma_kh,
            NgayDat=datetime.strptime(data.get("NgayDat"), "%Y-%m-%d"),
            TongTien=Decimal(data.get("TongTien", 0)),
            TrangThai=data.get("TrangThai", "Pending")
        )

        db.session.add(donhang)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Tạo đơn hàng thành công.",
            "id": donhang.MaDH
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# PUT /api/donhang/<id>/trangthai - Cập nhật trạng thái đơn hàng
@donhang_bp.route("/donhang/<int:id>/trangthai", methods=["PUT"])
def cap_nhat_trang_thai(id):
    try:
        data = request.get_json()
        donhang = DONHANG.query.get(id)
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
def xac_nhan_thanh_toan(id):
    try:
        donhang = DONHANG.query.get(id)
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
def dong_goi_giao_hang(id):
    try:
        donhang = DONHANG.query.get(id)
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
def doi_tra_don_hang(id):
    try:
        donhang = DONHANG.query.get(id)
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
def xoa_don_hang(id):
    try:
        donhang = DONHANG.query.get(id)
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
def sua_don_hang(id):
    try:
        data = request.get_json()
        donhang = DONHANG.query.get(id)
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
def cap_nhat_chi_tiet_don_hang(id):
    try:
        data = request.get_json()  # list of { MaCTDH?, MaSP, SoLuong, GiaBan }

        # 1. Lấy các chi tiết đơn hàng cũ
        old_details = CHITIETDONHANG.query.filter_by(MaDH=id).all()

        # 2. Hoàn lại số lượng tồn kho từ chi tiết cũ
        for ct in old_details:
            sp = SANPHAM.query.get(ct.MaSP)
            if sp:
                sp.SoLuongTon += ct.SoLuong

        # 3. Xóa toàn bộ chi tiết cũ
        CHITIETDONHANG.query.filter_by(MaDH=id).delete()

        # 4. Thêm chi tiết mới và trừ tồn kho tương ứng
        for item in data:
            MaSP = int(item.get("MaSP", 0))
            SoLuong = int(item.get("SoLuong", 0))
            GiaBan = float(item.get("GiaBan", 0))
            ThanhTien = SoLuong * GiaBan

            sp = SANPHAM.query.get(MaSP)  # ✅ Đưa dòng này lên đầu

            if not sp:
                raise Exception(f"Sản phẩm mã {MaSP} không tồn tại.")
            print(f"[DEBUG] SP {MaSP} tồn trước: {sp.SoLuongTon}, bán: {SoLuong}")

            if sp.SoLuongTon < SoLuong:
                raise Exception(f"Sản phẩm mã {MaSP} không đủ tồn kho.")
            sp.SoLuongTon -= SoLuong

            new_ct = CHITIETDONHANG(
                MaDH=id,
                MaSP=MaSP,
                SoLuong=SoLuong,
                GiaBan=GiaBan,
                ThanhTien=ThanhTien
            )
            db.session.add(new_ct)

        # 5. Tính lại tổng tiền
        new_total = db.session.query(
            func.coalesce(func.sum(CHITIETDONHANG.ThanhTien), 0)
        ).filter(CHITIETDONHANG.MaDH == id).scalar()

        donhang = DONHANG.query.get_or_404(id)
        donhang.TongTien = Decimal(new_total)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Cập nhật thành công và đã trừ tồn kho.",
            "newTotal": float(new_total)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
# GET /api/donhang/<id>/chitiet/pdf - Xuất chi tiết đơn hàng ra PDF
@donhang_bp.route("/donhang/<int:id>/chitiet/pdf", methods=["GET"])
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