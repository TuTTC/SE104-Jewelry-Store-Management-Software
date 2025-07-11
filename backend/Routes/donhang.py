from flask import Blueprint, request, jsonify, make_response, g
from models.DonHang import DONHANG
from models.KhachHang import KHACHHANG
from models.NguoiDung import NGUOIDUNG
from models.ChiTietDonHang import CHITIETDONHANG
from models.SanPham import SANPHAM
from models.DanhMucSanPham import DANHMUC
from database import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from flask import make_response
from io import BytesIO
from sqlalchemy import func
from decimal import Decimal
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import cm
from reportlab.platypus import Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import traceback
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
pdfmetrics.registerFont(TTFont('DejaVu', '../fonts/times.ttf'))
donhang_bp = Blueprint("donhang", __name__, url_prefix="/api")

# GET /api/donhang - Lấy danh sách đơn hàng
@donhang_bp.route("/donhang", methods=["GET"])
@jwt_required()
@permission_required("orders:view", "orders:view_own")
def get_danh_sach_donhang():
    try:
        current_user = g.current_user
        permissions = g.permissions

        # Nếu có quyền xem tất cả đơn hàng
        if "orders:view" in permissions:
            donhangs = DONHANG.query.all()
        else:
            # Nếu chỉ có quyền xem đơn hàng của chính mình
            donhangs = DONHANG.query.filter_by(UserID=current_user.UserID).all()

        data = []
        for dh in donhangs:
            true_total = sum(ct.ThanhTien for ct in dh.chitietdonhang_list)
            nguoidung = NGUOIDUNG.query.get(dh.UserID)

            data.append({
                "id": dh.MaDH,
                "orderCode": f"DH{dh.MaDH:04}",
                "customerId": dh.UserID,
                "customer": nguoidung.HoTen if nguoidung else "(Không rõ)",
                "date": dh.NgayDat.strftime("%Y-%m-%d"),
                "total": float(true_total),
                "status": dh.TrangThai,
                "paymentMethod": "Chuyển khoản",
                "deliveryAddress": nguoidung.DiaChi if nguoidung else ""
            })

        return jsonify({"status": "success", "data": data})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


@donhang_bp.route("/donhang", methods=["POST"])
@jwt_required()
@permission_required("orders:add")
def tao_don_hang():
    try:
        data = request.get_json()
        user_id = int(data.get("UserID"))
        chi_tiet = data.get("ChiTiet", [])  # ✅ lấy danh sách chi tiết đơn hàng nếu có

        khach = NGUOIDUNG.query.get(user_id)
        if not khach:
            return jsonify({"status": "error", "message": "Người dùng không tồn tại."}), 400

        if not khach.vaitro or khach.vaitro.TenVaiTro.lower() != "khách hàng":
            return jsonify({"status": "error", "message": "Người dùng này không phải khách hàng."}), 400

        if khach.TrangThai is not True:
            return jsonify({"status": "error", "message": "Tài khoản khách hàng đang bị khóa."}), 400

        # ✅ Khởi tạo đơn hàng nhưng để tạm TongTien = 0
        donhang = DONHANG(
            UserID=user_id,
            NgayDat=datetime.strptime(data.get("NgayDat"), "%Y-%m-%d"),
            TongTien=Decimal(0),
            TrangThai=data.get("TrangThai", "Pending"),
            # PhuongThucThanhToan=data.get("PhuongThucThanhToan", ""),
            # DiaChiGiao=data.get("DiaChiGiao", "")
        )
        db.session.add(donhang)
        db.session.flush()  # 🔁 Lấy MaDH ngay sau khi thêm

        # ✅ Duyệt và thêm chi tiết đơn hàng
        tong_tien = Decimal(0)
        for item in chi_tiet:
            ma_sp = item.get("MaSP")
            so_luong = int(item.get("SoLuong", 1))
            gia_ban = Decimal(item.get("GiaBan", 0))
            thanh_tien = Decimal(item.get("ThanhTien", gia_ban * so_luong))

            chi_tiet_dh = CHITIETDONHANG(
                MaDH=donhang.MaDH,
                MaSP=ma_sp,
                SoLuong=so_luong,
                GiaBan=gia_ban,
                ThanhTien=thanh_tien
            )
            db.session.add(chi_tiet_dh)
            tong_tien += thanh_tien

        # ✅ Cập nhật lại tổng tiền của đơn hàng
        donhang.TongTien = tong_tien

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Tạo đơn hàng và chi tiết thành công.",
            "id": donhang.MaDH
        })

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
@jwt_required()
@permission_required("orders:edit")
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
@jwt_required()
@permission_required("orders:edit")
def dong_goi_giao_hang(id):
    try:
        data = request.get_json()
        delivery_method = data.get("deliveryMethod")

        if delivery_method not in ["Nhận tại quầy", "Giao hàng tận nơi"]:
            return jsonify({"status": "error", "message": "Phương thức nhận hàng không hợp lệ."})

        donhang = DONHANG.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Không tìm thấy đơn hàng."})

        donhang.TrangThai = delivery_method  # Ghi rõ "Nhận tại quầy" hoặc "Giao hàng tận nơi"
        db.session.commit()

        return jsonify({"status": "success", "message": "Đã cập nhật phương thức nhận hàng."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)})

# POST /api/donhang/<id>/doitra - Tạo yêu cầu trả/đổi hàng
@donhang_bp.route("/donhang/<int:id>/doitra", methods=["POST"])
@jwt_required()
@permission_required("orders:edit")
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
@jwt_required()
@permission_required("orders:delete")
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
@jwt_required()
@permission_required("orders:edit")
def sua_don_hang(id):
    try:
        data = request.get_json()
        donhang = DONHANG.query.get(id)
        if not donhang:
            return jsonify({"status": "error", "message": "Đơn hàng không tồn tại"}), 404

        # --- (1) Validate UserID như bạn đã làm ---
        user_id = data.get("UserID")
        if not user_id:
            return jsonify({"status": "error", "message": "Thiếu UserID"}), 400
        khach = NGUOIDUNG.query.get(user_id)
        if not khach:
            return jsonify({"status": "error", "message": "Người dùng không tồn tại"}), 404
        if not khach.vaitro or khach.vaitro.TenVaiTro.lower() != "khách hàng":
            return jsonify({"status": "error", "message": "Người dùng này không phải khách hàng."}), 400
        if khach.TrangThai is not True:
            return jsonify({"status": "error", "message": "Tài khoản khách hàng đang bị khóa."}), 400

        # --- (2) Cập nhật DONHANG ---
        donhang.UserID = user_id
        donhang.NgayDat = datetime.strptime(data.get("NgayDat"), "%Y-%m-%d")
        donhang.TongTien = Decimal(str(data.get("TongTien", 0)))
        donhang.TrangThai = data.get("TrangThai")

        # --- (3) Xoá hết chi tiết cũ ---
        CHITIETDONHANG.query.filter_by(MaDH=id).delete()

        # --- (4) Thêm lại chi tiết mới ---
        for ct in data.get("ChiTiet", []):
            # Bắt buộc có MaSP, SoLuong, GiaBan, ThanhTien
            new_ct = CHITIETDONHANG(
                MaDH = id,
                MaSP = ct["MaSP"],
                SoLuong = ct["SoLuong"],
                GiaBan = ct["GiaBan"],
                ThanhTien = ct["ThanhTien"]
            )
            db.session.add(new_ct)

        # --- (5) Commit tất cả ---
        db.session.commit()
        return jsonify({"status": "success", "message": "Đã cập nhật đơn hàng và chi tiết."})

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
@jwt_required()
@permission_required("orders:edit")
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
        don_hang = DONHANG.query.get_or_404(id)
        
        khach_hang = NGUOIDUNG.query.get(don_hang.UserID)
        if not khach_hang or khach_hang.vaitro.TenVaiTro.lower() != "khách hàng":
            return jsonify({"status": "error", "message": "Không tìm thấy khách hàng"}), 400

        ctdh_list = CHITIETDONHANG.query.filter_by(MaDH=id).all()
        if not ctdh_list:
            return jsonify({"status": "error", "message": "Không có chi tiết đơn hàng."}), 404

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        p.setFont("DejaVu", 12)
        p.drawCentredString(width / 2, height - 2 * cm, "PHIẾU BÁN HÀNG")

        p.setFont("DejaVu", 11)
        p.drawString(2 * cm, height - 3 * cm, f"Số phiếu: {don_hang.MaDH}")
        p.drawString(20 * cm, height - 3 * cm, f"Ngày lập: {don_hang.NgayDat.strftime('%d/%m/%Y')}")
        p.drawString(2 * cm, height - 4 * cm, f"Khách hàng: {khach_hang.HoTen}")

        # Vẽ bảng
        y = height - 5 * cm
        col_widths = [1.5*cm, 6*cm, 6*cm, 2.5*cm, 2.5*cm, 3*cm, 3*cm]
        headers = ["STT", "Sản phẩm", "Loại sản phẩm", "Số lượng", "Đơn vị tính", "Đơn giá", "Thành tiền"]

        p.setFont("DejaVu", 10)
        x = 2 * cm
        for i, header in enumerate(headers):
            p.drawString(x, y, header)
            x += col_widths[i]

        p.line(2 * cm, y - 2, width - 2 * cm, y - 2)
        y -= 0.7 * cm

        for idx, ct in enumerate(ctdh_list, start=1):
            sp = SANPHAM.query.get(ct.MaSP)
            
            if not sp:
                ten_sp = "---"
                loai = "N/A"
                dvt = "N/A"
            else:
                ten_sp = sp.TenSP
                danh_muc = DANHMUC.query.get(sp.MaDM)
                loai = danh_muc.TenDM if danh_muc else "N/A"
                dvt = danh_muc.DonViTinh if danh_muc else "N/A"

            row = [
                str(idx),
                ten_sp,
                loai,
                str(ct.SoLuong),
                dvt,
                f"{float(ct.GiaBan):,.2f}",
                f"{float(ct.ThanhTien):,.2f}"
            ]

            x = 2 * cm
            for i, cell in enumerate(row):
                p.drawString(x, y, cell)
                x += col_widths[i]

            y -= 0.7 * cm
            if y < 2 * cm:
                p.showPage()
                p.setFont("DejaVu", 10)
                y = height - 2 * cm
        
        # p.showPage()
        label_x = width - 2 * cm - 6 * cm  # Đặt nhãn "Tổng tiền" bên trái
        value_x = width - 2 * cm           # Số tiền nằm sát lề phải

        p.setFont("DejaVu", 11)
        p.drawRightString(label_x, y, "Tổng tiền:")
        p.drawRightString(value_x, y, f"{float(don_hang.TongTien):,.2f} VNĐ")

        p.save()

        buffer.seek(0)
        return make_response(buffer.read(), 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'inline; filename=phieu_ban_hang_{id}.pdf'
        })

    except Exception as e:
        print("Lỗi khi xuất PDF:", e)
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500