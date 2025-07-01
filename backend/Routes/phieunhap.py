from flask import Blueprint, request, jsonify, send_file
from database import db
from models.PhieuNhap import PHIEUNHAP
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.SanPham import SANPHAM
from models.NhaCungCap import NHACUNGCAP
from datetime import datetime
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


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

@phieunhap_bp.route('/phieunhap', methods=['POST'])
def create_phieu_nhap():
    data = request.get_json()
    try:
        ma_ncc = data['MaNCC']
        user_id = data['UserID']
        ngay_nhap = data.get('NgayNhap')
        trang_thai = data.get('TrangThai', 'Đang xử lý')
        chi_tiet = data.get('ChiTiet', [])

        # Kiểm tra nhà cung cấp tồn tại
        ncc = NHACUNGCAP.query.get(ma_ncc)
        if not ncc:
            return jsonify({'status': 'error', 'message': 'Nhà cung cấp không tồn tại'}), 400

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
def list_phieu_nhap():
    phieu = PHIEUNHAP.query.all()
    data = [p.to_dict() for p in phieu]
    return jsonify({'status':'success','data':data})

# Xem chi tiết một phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['GET'])
def detail_phieu_nhap(id):
    p = PHIEUNHAP.query.get_or_404(id)
    details = CHITIETPHIEUNHAP.query.filter_by(MaPN=id).all()
    data = p.to_dict()
    data['ChiTiet'] = [d.to_dict() for d in details]
    return jsonify({'status':'success','data':data})

# Cập nhật phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['PUT'])
def update_phieu_nhap(id):
    data = request.get_json()
    phieu = PHIEUNHAP.query.get_or_404(id)
    try:
        phieu.GhiChu = data.get('GhiChu', phieu.GhiChu)
        phieu.TrangThai = data.get('TrangThai', phieu.TrangThai)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Cập nhật phiếu nhập thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Xoá phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['DELETE'])
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
def export_phieu_nhap(id):
    phieu = PHIEUNHAP.query.get_or_404(id)
    chi_tiet = CHITIETPHIEUNHAP.query.filter_by(MaPN=id).all()
    nha_cc = NHACUNGCAP.query.get(phieu.MaNCC)

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Tiêu đề
    c.setFont("DejaVu", 16)
    c.drawCentredString(width / 2, height - 50, "PHIẾU NHẬP HÀNG")

    # Thông tin chung
    c.setFont("DejaVu", 12)
    c.drawString(50, height - 80, f"Số phiếu: {phieu.MaPN}")
    c.drawString(300, height - 80, f"Ngày lập: {phieu.NgayNhap.strftime('%d/%m/%Y')}")
    c.drawString(50, height - 100, f"Nhà cung cấp: {nha_cc.TenNCC}")
    c.drawString(300, height - 100, f"SĐT: {nha_cc.SoDienThoai}")

    # Bảng sản phẩm
    y = height - 140
    c.setFont("DejaVu", 10)
    c.drawString(50, y, "STT")
    c.drawString(80, y, "Tên sản phẩm")
    c.drawString(250, y, "Số lượng")
    c.drawString(320, y, "Đơn giá")
    c.drawString(400, y, "Thành tiền")

    c.setFont("DejaVu", 10)
    for idx, item in enumerate(chi_tiet, 1):
        y -= 20
        sanpham = SANPHAM.query.get(item.MaSP)
        c.drawString(50, y, str(idx))
        c.drawString(80, y, sanpham.TenSP)
        c.drawString(250, y, str(item.SoLuong))
        c.drawString(320, y, f"{float(item.DonGiaNhap):,.0f}")
        c.drawString(400, y, f"{float(item.ThanhTien):,.0f}")

    # Tổng tiền
    y -= 40
    c.setFont("DejaVu", 12)
    c.drawString(320, y, "Tổng tiền:")
    c.drawString(400, y, f"{float(phieu.TongTien):,.0f} VND")

    c.showPage()
    c.save()

    buffer.seek(0)
    filename = f"PhieuNhap_{phieu.MaPN}.pdf"
    return send_file(buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')