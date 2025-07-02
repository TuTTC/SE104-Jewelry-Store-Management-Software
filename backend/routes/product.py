from flask import Blueprint, request, jsonify
from database import db
from models.SanPham import SANPHAM
from models.TonKho import TONKHO
from flask_jwt_extended import jwt_required
from seeds.update_giaban_sp import cap_nhat_gia_ban_cho_toan_bo_san_pham  # Giả sử hàm đó để trong services/product_service.py, điều chỉnh path nếu cần
from models.ThamSo import THAMSO

from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.DanhMucSanPham import DANHMUC
from sqlalchemy import desc
from decimal import Decimal

product_bp = Blueprint('product_bp', __name__)


# Lấy toàn bộ sản phẩm
@product_bp.route('/', methods=['GET'])
# @jwt_required()
# @permission_required("products:view")
def get_products():
    try:
        # Đồng bộ tồn kho trước khi trả về dữ liệu
        danh_sach_sanpham = SANPHAM.query.all()
        # Lấy danh sách danh mục
        danh_muc_list = DANHMUC.query.all()
        danh_muc_data = [{'MaDM': dm.MaDM, 'TenDM': dm.TenDM} for dm in danh_muc_list]

        for sp in danh_sach_sanpham:
            tonkho = TONKHO.query.filter_by(MaSP=sp.MaSP).first()
            if tonkho:
                tonkho.SoLuongTon = sp.SoLuongTon
            else:
                db.session.add(TONKHO(MaSP=sp.MaSP, SoLuongTon=sp.SoLuongTon))

        db.session.commit()

        products = SANPHAM.query.all()
        result = []

        for p in products:
            result.append({
                'MaSP': p.MaSP,
                'TenSP': p.TenSP,
                'MaDM': p.MaDM,
                'TenDM': p.danhmuc.TenDM if p.danhmuc else None,
                'MaNCC': p.MaNCC,
                'TenNCC': p.nhacungcap.TenNCC if p.nhacungcap else None,
                'GiaBan': float(p.GiaBan),
                'SoLuongTon': p.SoLuongTon,
                'MoTa': p.MoTa,
                'HinhAnh': p.HinhAnh
            })

        return jsonify({'status': 'success', 'data': result, 'categories': danh_muc_data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Lấy sản phẩm theo danh mục
@product_bp.route('/danhmuc/<int:ma_dm>', methods=['GET'])
def get_products_by_category(ma_dm):
    try:
        products = SANPHAM.query.filter_by(MaDM=ma_dm).all()
        result = [{
            'MaSP': p.MaSP,
            'TenSP': p.TenSP,
            'GiaBan': float(p.GiaBan),
            'SoLuongTon': p.SoLuongTon
        } for p in products]

        return jsonify({'status': 'success', 'data': result}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Thêm sản phẩm mới
@product_bp.route('/', methods=['POST'])
# @jwt_required()
# @permission_required("products:add")
def add_product():
    data = request.get_json()
    try:
        new_product = SANPHAM(
            TenSP=data['TenSP'],
            MaDM=data['MaDM'],
            MaNCC=data['MaNCC'],
            GiaBan=data['GiaBan'],
            SoLuongTon=data.get('SoLuongTon', 0),
            MoTa=data.get('MoTa'),
            HinhAnh=data.get('HinhAnh')
        )
        db.session.add(new_product)
        db.session.flush()  # Lấy MaSP sau khi thêm
        db.session.add(TONKHO(MaSP=new_product.MaSP, SoLuongTon=new_product.SoLuongTon))
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Tạo sản phẩm thành công', 'MaSP': new_product.MaSP}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Lấy sản phẩm theo ID
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại'}), 404

    return jsonify({
        'MaSP': product.MaSP,
        'TenSP': product.TenSP,
        'MaDM': product.MaDM,
        'MaNCC': product.MaNCC,
        'GiaBan': float(product.GiaBan),
        'SoLuongTon': product.SoLuongTon,
        'MoTa': product.MoTa,
        'HinhAnh': product.HinhAnh
    }), 200


# Cập nhật sản phẩm
@product_bp.route('/<int:product_id>', methods=['PUT'])
# @jwt_required()
# @permission_required("products:edit")
def update_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại'}), 404

    data = request.get_json()
    try:
        so_luong_cu = product.SoLuongTon
        product.TenSP = data.get('TenSP', product.TenSP)
        product.MaDM = data.get('MaDM', product.MaDM)
        product.MaNCC = data.get('MaNCC', product.MaNCC)
        product.GiaBan = data.get('GiaBan', product.GiaBan)
        product.SoLuongTon = data.get('SoLuongTon', product.SoLuongTon)
        product.MoTa = data.get('MoTa', product.MoTa)
        product.HinhAnh = data.get('HinhAnh', product.HinhAnh)
        # Đồng bộ tồn kho nếu số lượng tồn thay đổi
        if product.SoLuongTon != so_luong_cu:
            tonkho = TONKHO.query.filter_by(MaSP=product.MaSP).first()
            if tonkho:
                tonkho.SoLuongTon = product.SoLuongTon
            else:
                db.session.add(TONKHO(MaSP=product.MaSP, SoLuongTon=product.SoLuongTon))
                db.session.commit()
        return jsonify({'status': 'success', 'message': 'Cập nhật sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Xóa sản phẩm
@product_bp.route('/<int:product_id>', methods=['DELETE'])
# @jwt_required()
# @permission_required("products:delete")
def delete_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại'}), 404
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Xóa sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# API cập nhật số lượng tồn trong sản phẩm và đồng bộ sang bảng tồn kho
@product_bp.route("/<int:masp>/capnhat_tonkho", methods=["PUT"])
def capnhat_tonkho_theo_sanpham(masp):
    """
    Cập nhật SoLuongTon cho bảng SANPHAM và tự động đồng bộ qua bảng TONKHO
    """
    sp = SANPHAM.query.get_or_404(masp)
    data = request.get_json()

    if "SoLuongTon" not in data:
        return jsonify({"error": "Thiếu thông tin SoLuongTon"}), 400

    try:
        soluongton_moi = int(data["SoLuongTon"])
        if soluongton_moi < 0:
            return jsonify({"error": "Số lượng tồn phải >= 0"}), 400
    except ValueError:
        return jsonify({"error": "Số lượng tồn phải là số nguyên"}), 400

    # Cập nhật bảng SANPHAM
    sp.SoLuongTon = soluongton_moi
    db.session.commit()

    # Kiểm tra bảng TONKHO đã có chưa
    tonkho = TONKHO.query.filter_by(MaSP=masp).first()
    if tonkho:
        tonkho.SoLuongTon = soluongton_moi
    else:
        tonkho = TONKHO(MaSP=masp, SoLuongTon=soluongton_moi)
        db.session.add(tonkho)

    db.session.commit()

    return jsonify({"message": "Cập nhật tồn kho thành công"}), 200


@product_bp.route("/capnhat_giaban", methods=["PUT"])
# @jwt_required()
# @permission_required("products:edit")
def capnhat_gia_ban_toan_bo():
    """
    API cập nhật giá bán toàn bộ sản phẩm dựa trên tham số lợi nhuận và lần nhập gần nhất
    """
   
    try:
        san_pham_list = SANPHAM.query.all()
        danh_muc_map = {dm.MaDM: dm.TenDM for dm in DANHMUC.query.all()}

        # Ánh xạ Tên Danh Mục sang Tên Tham Số lợi nhuận
        tham_so_map = {
            "Vòng tay": "LoiNhuan_VongTay",
            "Nhẫn": "LoiNhuan_Nhan",
            "Vòng cổ": "LoiNhuan_DayChuyen",
            "Bông tai": "LoiNhuan_KhuyenTai",
            "Đá quý": "LoiNhuan_DaQuy",
        }

        for sp in san_pham_list:
            ten_dm = danh_muc_map.get(sp.MaDM)
            if not ten_dm:
                continue  # Bỏ qua nếu không xác định được danh mục

            ten_tham_so = tham_so_map.get(ten_dm)
            if not ten_tham_so:
                continue  # Bỏ qua nếu thiếu ánh xạ tham số

            tham_so = THAMSO.query.filter_by(TenThamSo=ten_tham_so).first()
            if not tham_so:
                continue  # Bỏ qua nếu không tìm thấy tham số

            # Lấy lần nhập gần nhất của sản phẩm
            ct_pn = CHITIETPHIEUNHAP.query.filter_by(MaSP=sp.MaSP).order_by(desc(CHITIETPHIEUNHAP.MaPN)).first()
            if not ct_pn:
                continue  # Bỏ qua nếu chưa từng nhập

            try:
                phan_tram_loi_nhuan = Decimal(tham_so.GiaTri)
            except:
                continue  # Bỏ qua nếu giá trị tham số không hợp lệ

            gia_ban = ct_pn.DonGiaNhap + (ct_pn.DonGiaNhap * phan_tram_loi_nhuan / Decimal(100))
            sp.GiaBan = gia_ban.quantize(Decimal('1'))  # Làm tròn tới số nguyên nếu cần

        db.session.commit()
        return jsonify({"status": "success", "message": "Cập nhật giá bán cho toàn bộ sản phẩm thành công!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

def cap_nhat_gia_ban_cho_san_pham(ma_sp):
    sp = SANPHAM.query.get(ma_sp)
    if not sp:
        return  # Không làm gì nếu sản phẩm không tồn tại

    danh_muc = DANHMUC.query.get(sp.MaDM)
    if not danh_muc:
        return

    # Map tham số
    tham_so_map = {
        "Vòng tay": "LoiNhuan_VongTay",
        "Nhẫn": "LoiNhuan_Nhan",
        "Vòng cổ": "LoiNhuan_DayChuyen",
        "Bông tai": "LoiNhuan_KhuyenTai",
        "Đá quý": "LoiNhuan_DaQuy",
    }

    ten_tham_so = tham_so_map.get(danh_muc.TenDM)
    if not ten_tham_so:
        return

    tham_so = THAMSO.query.filter_by(TenThamSo=ten_tham_so).first()
    if not tham_so or not tham_so.KichHoat:
        return  # Không tính thêm nếu tham số chưa kích hoạt hoặc không tồn tại

    # Lấy lần nhập gần nhất
    ct_pn = CHITIETPHIEUNHAP.query.filter_by(MaSP=ma_sp).order_by(desc(CHITIETPHIEUNHAP.MaPN)).first()
    if not ct_pn:
        return

    try:
        phan_tram_loi_nhuan = Decimal(tham_so.GiaTri)
        gia_ban = ct_pn.DonGiaNhap + (ct_pn.DonGiaNhap * phan_tram_loi_nhuan / Decimal(100))
        sp.GiaBan = gia_ban.quantize(Decimal('1'))
        db.session.commit()
    except:
        db.session.rollback()
