from flask import Blueprint, request, jsonify, send_file
from database import db
from models.PhieuNhap import PHIEUNHAP
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.SanPham import SANPHAM
from models.NhaCungCap import NHACUNGCAP
from models.NguoiDung import NGUOIDUNG
from datetime import datetime
from io import BytesIO
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from flask_jwt_extended import jwt_required
from utils.permissions import permission_required
from io import BytesIO
from flask import send_file
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape

pdfmetrics.registerFont(TTFont('DejaVu', '../fonts/times.ttf'))

phieunhap_bp = Blueprint('phieunhap_bp', __name__)



# # Tạo phiếu nhập
# @phieunhap_bp.route('/phieunhap', methods=['POST'])
# def create_phieu_nhap():
#     data = request.get_json()
#     try:
#         ma_ncc = data['MaNCC']
#         user_id = data['UserID']
#         ghi_chu = data.get('GhiChu', '')
#         trang_thai = data.get('TrangThai', 'Đang xử lý')
#         chi_tiet = data.get('ChiTiet', [])
#         # Kiểm tra nhà cung cấp có tồn tại chưa
#         ncc = NHACUNGCAP.query.get(ma_ncc)
#         if not ncc:
#             # Nếu chưa có, tự thêm mới nhà cung cấp
#             try:
#                 ncc = NHACUNGCAP(
#                     MaNCC=ma_ncc,
#                     TenNCC=data.get('TenNCC', f'NCC-{ma_ncc}'),
#                     DiaChi=data.get('DiaChi', ''),
#                     SDT=data.get('SDT', '')
#                 )
#                 db.session.add(ncc)
#                 db.session.flush()
#             except Exception as e:
#                 db.session.rollback()
#                 return jsonify({'status': 'error', 'message': f'Lỗi thêm nhà cung cấp: {str(e)}'}), 400

#         if not chi_tiet:
#             return jsonify({'status': 'error', 'message': 'Danh sách chi tiết phiếu nhập trống'}), 400

#         # Tính tổng tiền
#         tong_tien = sum(item['SoLuong'] * item['DonGiaNhap'] for item in chi_tiet)

#         # Tạo phiếu nhập
#         phieu = PHIEUNHAP(
#             MaNCC=ma_ncc,
#             UserID=user_id,
#             NgayNhap=datetime.now(),
#             TongTien=tong_tien,
#             TrangThai=trang_thai,
#             GhiChu=ghi_chu
#         )
#         db.session.add(phieu)
#         db.session.flush()  # Lấy MaPN sau khi insert

#         # Tạo chi tiết phiếu nhập và cập nhật tồn kho
#         for item in chi_tiet:
#             ma_sp = item['MaSP']
#             so_luong = item['SoLuong']
#             don_gia_nhap = item['DonGiaNhap']

#             # Kiểm tra sản phẩm tồn tại
#             product = SANPHAM.query.get(ma_sp)
#             if not product:
#                 # Nếu chưa có sản phẩm, tự thêm sản phẩm mới vào bảng SANPHAM
#                 try:
#                     product = SANPHAM(
#                         MaSP=ma_sp,
#                         TenSP=item.get('TenSP', f'SP-{ma_sp}'),
#                         MaDM=item.get('MaDM'),
#                         MaNCC=ma_ncc,
#                         GiaBan=item.get('GiaBan', 0),
#                         SoLuongTon=so_luong,
#                         MoTa=item.get('MoTa', ''),
#                         HinhAnh=item.get('HinhAnh', '')
#                     )
#                     db.session.add(product)
#                 except Exception as e:
#                     db.session.rollback()
#                     return jsonify({'status': 'error', 'message': f'Lỗi thêm sản phẩm mới: {str(e)}'}), 400
#             else:
#                 # Nếu đã có, chỉ cập nhật tồn kho
#                 product.SoLuongTon += so_luong


#             # Thêm chi tiết phiếu nhập
#             ct = CHITIETPHIEUNHAP(
#                 MaPN=phieu.MaPN,
#                 MaSP=ma_sp,
#                 SoLuong=so_luong,
#                 DonGiaNhap=don_gia_nhap,
#                 ThanhTien=so_luong * don_gia_nhap
#             )
#             db.session.add(ct)

#         db.session.commit()
#         return jsonify({'status': 'success', 'message': 'Tạo phiếu nhập thành công', 'MaPN': phieu.MaPN}), 201

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'status': 'error', 'message': str(e)}), 400

# @phieunhap_bp.route('/phieunhap', methods=['POST'])
# @jwt_required()
# @permission_required("purchaseOrders:add")
# def create_phieu_nhap():
#     data = request.get_json()
#     try:
#         ma_ncc = data['MaNCC']
#         user_id = data['UserID']
#         ngay_nhap = data.get('NgayNhap')
#         trang_thai = data.get('TrangThai', 'Đang xử lý')
#         chi_tiet = data.get('ChiTiet', [])

#         # Kiểm tra nhà cung cấp tồn tại
#         ncc = NHACUNGCAP.query.get(ma_ncc)
#         if not ncc:
#             return jsonify({'status': 'error', 'message': 'Nhà cung cấp không tồn tại'}), 400

#         # Kiểm tra người nhập tồn tại và ở trạng thái kích hoạt
#         user = NGUOIDUNG.query.get(user_id)
#         if not user:
#             return jsonify({'status': 'error', 'message': 'Người nhập không tồn tại'}), 400
#         if user.TrangThai is not True:
#             return jsonify({'status': 'error', 'message': 'Tài khoản người nhập đang bị khóa, không thể thực hiện thao tác'}), 400

#         if not chi_tiet:
#             return jsonify({'status': 'error', 'message': 'Danh sách chi tiết phiếu nhập trống'}), 400

#         # Tính tổng tiền
#         tong_tien = sum(item['SoLuong'] * item['DonGiaNhap'] for item in chi_tiet)

#         # Tạo phiếu nhập
#         phieu = PHIEUNHAP(
#             MaNCC=ma_ncc,
#             UserID=user_id,
#             NgayNhap=ngay_nhap,
#             TongTien=tong_tien,
#             TrangThai=trang_thai,
#         )
#         db.session.add(phieu)
#         db.session.flush()

#         # Xử lý chi tiết phiếu nhập và cập nhật tồn kho
#         for item in chi_tiet:
#             ma_sp = item['MaSP']
#             so_luong = item['SoLuong']
#             don_gia_nhap = item['DonGiaNhap']

#             product = SANPHAM.query.get(ma_sp)
#             if not product:
#                 return jsonify({'status': 'error', 'message': f'Sản phẩm {ma_sp} không tồn tại'}), 400

#             # Cập nhật tồn kho
#             product.SoLuongTon += so_luong

#             # Thêm chi tiết phiếu nhập
#             ct = CHITIETPHIEUNHAP(
#                 MaPN=phieu.MaPN,
#                 MaSP=ma_sp,
#                 SoLuong=so_luong,
#                 DonGiaNhap=don_gia_nhap,
#                 ThanhTien=so_luong * don_gia_nhap
#             )
#             db.session.add(ct)
        
#         db.session.commit()
#         return jsonify({'status': 'success', 'message': 'Tạo phiếu nhập thành công', 'MaPN': phieu.MaPN}), 201

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'status': 'error', 'message': str(e)}), 400

@phieunhap_bp.route('/phieunhap', methods=['POST'])
@jwt_required()
@permission_required("purchaseOrders:add")
def create_phieu_nhap():
    from flask_jwt_extended import get_jwt_identity
    data = request.get_json()
    try:
        ma_ncc = data['MaNCC']
        user_id = get_jwt_identity()  # ✅ Lấy từ token, không nhận từ client
        ngay_nhap = data.get('NgayNhap') or datetime.utcnow().date()
        trang_thai = data.get('TrangThai', 'Đang xử lý')
        chi_tiet = data.get('ChiTiet', [])

        # Kiểm tra nhà cung cấp tồn tại
        ncc = NHACUNGCAP.query.get(ma_ncc)
        if not ncc:
            return jsonify({'status': 'error', 'message': 'Nhà cung cấp không tồn tại'}), 400

        # Kiểm tra người nhập tồn tại và ở trạng thái kích hoạt
        user = NGUOIDUNG.query.get(user_id)
        if not user:
            return jsonify({'status': 'error', 'message': 'Người nhập không tồn tại'}), 400
        if user.TrangThai is not True:
            return jsonify({'status': 'error', 'message': 'Tài khoản người nhập đang bị khóa, không thể thực hiện thao tác'}), 400

        if not chi_tiet:
            return jsonify({'status': 'error', 'message': 'Danh sách chi tiết phiếu nhập trống'}), 400

        # Tính tổng tiền
        tong_tien = sum(item['SoLuong'] * item['DonGiaNhap'] for item in chi_tiet)

        # Tạo phiếu nhập
        phieu = PHIEUNHAP(
            MaNCC=ma_ncc,
            UserID=user_id,
            NgayNhap=ngay_nhap,
            TongTien=tong_tien,
            TrangThai=trang_thai,
        )
        db.session.add(phieu)
        db.session.flush()

        # Xử lý chi tiết phiếu nhập và cập nhật tồn kho
        for item in chi_tiet:
            ma_sp = item['MaSP']
            so_luong = item['SoLuong']
            don_gia_nhap = item['DonGiaNhap']

            product = SANPHAM.query.get(ma_sp)
            if not product:
                return jsonify({'status': 'error', 'message': f'Sản phẩm {ma_sp} không tồn tại'}), 400

            # Cập nhật tồn kho
            product.SoLuongTon += so_luong

            # Thêm chi tiết phiếu nhập
            ct = CHITIETPHIEUNHAP(
                MaPN=phieu.MaPN,
                MaSP=ma_sp,
                SoLuong=so_luong,
                DonGiaNhap=don_gia_nhap,
                ThanhTien=so_luong * don_gia_nhap
            )
            db.session.add(ct)
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tạo phiếu nhập thành công', 'MaPN': phieu.MaPN}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Lấy danh sách phiếu nhập
@phieunhap_bp.route('/phieunhap', methods=['GET'])
@jwt_required()
@permission_required("purchaseOrders:view")
def list_phieu_nhap():
    phieu = PHIEUNHAP.query.all()
    data = [p.to_dict() for p in phieu]
    return jsonify({'status':'success','data':data})

# Xem chi tiết một phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['GET'])
@jwt_required()
@permission_required("purchaseOrders:add")
def detail_phieu_nhap(id):
    p = PHIEUNHAP.query.get_or_404(id)
    details = CHITIETPHIEUNHAP.query.filter_by(MaPN=id).all()
    data = p.to_dict()
    data['ChiTiet'] = [d.to_dict() for d in details]
    return jsonify({'status':'success','data':data})

# Cập nhật phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['PUT'])
@jwt_required()
@permission_required("purchaseOrders:edit")
def update_phieu_nhap(id):
    data = request.get_json()
    phieu = PHIEUNHAP.query.get_or_404(id)
    try:
        # Kiểm tra người nhập có đang bị khóa không
        user = NGUOIDUNG.query.get(phieu.UserID)
        if not user:
            return jsonify({'status': 'error', 'message': 'Người nhập không tồn tại'}), 400
        if user.TrangThai is not True:
            return jsonify({'status': 'error', 'message': 'Tài khoản người nhập đang bị khóa, không thể cập nhật phiếu nhập'}), 400

        # Cập nhật thông tin phiếu nhập
        phieu.GhiChu = data.get('GhiChu', phieu.GhiChu)
        phieu.TrangThai = data.get('TrangThai', phieu.TrangThai)
        
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Cập nhật phiếu nhập thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Xoá phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['DELETE'])
@jwt_required()
@permission_required("purchaseOrders:delete")
def delete_phieu_nhap(id):
    phieu = PHIEUNHAP.query.get_or_404(id)
    try:
        # Xoá chi tiết phiếu nhập trước
        CHITIETPHIEUNHAP.query.filter_by(MaPN=phieu.MaPN).delete()
        db.session.delete(phieu)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Đã xoá phiếu nhập'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


@phieunhap_bp.route('/phieunhap/<int:id>/export', methods=['GET'])
@jwt_required()
@permission_required("purchaseOrders:view")
def export_phieu_nhap(id):
    phieu = PHIEUNHAP.query.get_or_404(id)
    chi_tiet = CHITIETPHIEUNHAP.query.filter_by(MaPN=id).all()
    nha_cc = NHACUNGCAP.query.get(phieu.MaNCC)
    nguoi_nhap = phieu.nguoitao

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Tiêu đề
    c.setFont("DejaVu", 14)
    c.drawCentredString(width / 2, height - 30, "PHIẾU NHẬP HÀNG")

    # Thông tin phiếu
    c.setFont("DejaVu", 11)
    c.drawString(30, height - 60, f"Số phiếu: {phieu.MaPN}")
    c.drawString(300, height - 60, f"Ngày lập: {phieu.NgayNhap.strftime('%d/%m/%Y')}")
    c.drawString(30, height - 80, f"Nhà cung cấp: {nha_cc.TenNCC}")
    c.drawString(300, height - 80, f"Địa chỉ: {nha_cc.DiaChi}")
    c.drawString(480, height - 80, f"Điện thoại: {nha_cc.SoDienThoai}")

    # Chuẩn bị bảng chi tiết sản phẩm
    data = [["STT", "Sản phẩm", "Loại", "Số lượng", "Đơn vị", "Đơn giá", "Thành tiền"]]
    for idx, item in enumerate(chi_tiet, 1):
        sp = SANPHAM.query.get(item.MaSP)
        loai = sp.danhmuc.TenDM if sp.danhmuc else "N/A"
        dvt = sp.danhmuc.DonViTinh if sp.danhmuc and sp.danhmuc.DonViTinh else "N/A"
        data.append([
            str(idx),
            sp.TenSP,
            loai,
            str(item.SoLuong),
            dvt,
            f"{float(item.DonGiaNhap):,.0f}",
            f"{float(item.ThanhTien):,.0f}"
        ])

    # Tạo bảng PDF
    table = Table(data, colWidths=[20*mm, 65*mm, 45*mm, 25*mm, 30*mm, 35*mm, 40*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONT', (0, 0), (-1, -1), "DejaVu")
    ]))
    table.wrapOn(c, width, height)
    y_position = height - 300
    table.drawOn(c, 30, y_position)

    # Tổng tiền
    c.setFont("DejaVu", 12)
    total_y = y_position - len(data)*18 - 10
    c.drawRightString(width - 40, total_y, f"Tổng tiền: {float(phieu.TongTien):,.0f} VND")
     # Người lập ký tên
    sign_y = total_y - 60
    c.setFont("DejaVu", 11)
    c.drawString(50, sign_y, "Người lập phiếu")

    # Vẽ đường kẻ để ký
    c.line(50, sign_y - 15, 200, sign_y - 15)

    # Ghi tên người lập (sử dụng quan hệ ORM)
    if nguoi_nhap:
        ten = nguoi_nhap.HoTen if nguoi_nhap.HoTen else f"UserID: {nguoi_nhap.UserID}"
        c.setFont("DejaVu", 10)
        c.drawString(50, sign_y - 30, ten)

    c.showPage()
    c.save()
    buffer.seek(0)

    filename = f"PhieuNhap_{phieu.MaPN}.pdf"
    return send_file(buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')