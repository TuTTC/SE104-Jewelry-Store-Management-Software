from flask import Blueprint, request, jsonify
from database import db
from models.SanPham import SANPHAM
from models.TonKho import TONKHO
from flask_jwt_extended import jwt_required
from seeds.update_giaban_sp import cap_nhat_gia_ban_cho_toan_bo_san_pham
from seeds.update_tonkho_sp import cap_nhat_so_luong_ton_cho_toan_bo_san_pham
from models.ThamSo import THAMSO
from utils.permissions import permission_required
from models.ChiTietPhieuNhap import CHITIETPHIEUNHAP
from models.DanhMucSanPham import DANHMUC
from sqlalchemy import desc

product_bp = Blueprint('product_bp', __name__)


# Lấy toàn bộ sản phẩm chưa bị ẩn và danh mục chưa bị ẩn
@product_bp.route('/', methods=['GET'])
@jwt_required()
@permission_required("products:view")
def get_products():
    try:
        danh_sach_sanpham = SANPHAM.query.filter_by(IsDisabled=False).all()
        danh_muc_map = {dm.MaDM: dm for dm in DANHMUC.query.filter_by(IsDisabled=False).all()}

        # Đồng bộ tồn kho trước khi trả về dữ liệu
        for sp in danh_sach_sanpham:
            if sp.MaDM not in danh_muc_map:
                continue  # Ẩn theo danh mục

            tonkho = TONKHO.query.filter_by(MaSP=sp.MaSP).first()
            if tonkho:
                tonkho.SoLuongTon = sp.SoLuongTon
            else:
                db.session.add(TONKHO(MaSP=sp.MaSP, SoLuongTon=sp.SoLuongTon))

        db.session.commit()
        cap_nhat_gia_ban_cho_toan_bo_san_pham()
        cap_nhat_so_luong_ton_cho_toan_bo_san_pham()

        products = SANPHAM.query.filter_by(IsDisabled=False).all()
        result = []

        for p in products:
            danh_muc = DANHMUC.query.get(p.MaDM)
            if not danh_muc or danh_muc.IsDisabled:
                continue

            result.append({
                'MaSP': p.MaSP,
                'TenSP': p.TenSP,
                'MaDM': p.MaDM,
                'TenDM': danh_muc.TenDM,
                'MaNCC': p.MaNCC,
                'TenNCC': p.nhacungcap.TenNCC if p.nhacungcap else None,
                'GiaBan': float(p.GiaBan),
                'SoLuongTon': p.SoLuongTon,
                'MoTa': p.MoTa,
                'HinhAnh': p.HinhAnh
            })

        danh_muc_data = [{'MaDM': dm.MaDM, 'TenDM': dm.TenDM} for dm in danh_muc_map.values()]

        return jsonify({'status': 'success', 'data': result, 'categories': danh_muc_data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# Lấy sản phẩm theo danh mục chưa bị ẩn
@product_bp.route('/danhmuc/<int:ma_dm>', methods=['GET'])
def get_products_by_category(ma_dm):
    try:
        danh_muc = DANHMUC.query.get(ma_dm)
        if not danh_muc or danh_muc.IsDisabled:
            return jsonify({'status': 'error', 'message': 'Danh mục không tồn tại hoặc đã bị ẩn'}), 404

        products = SANPHAM.query.filter_by(MaDM=ma_dm, IsDisabled=False).all()
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
@jwt_required()
@permission_required("products:add")
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
            HinhAnh=data.get('HinhAnh'),
            IsDisabled=False
        )
        db.session.add(new_product)
        db.session.flush()
        db.session.add(TONKHO(MaSP=new_product.MaSP, SoLuongTon=new_product.SoLuongTon))
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Tạo sản phẩm thành công', 'MaSP': new_product.MaSP}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Lấy sản phẩm theo ID (chỉ lấy nếu chưa bị ẩn)
@product_bp.route('/<int:product_id>', methods=['GET'])

def get_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product or product.IsDisabled:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại hoặc đã bị ẩn'}), 404

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

@jwt_required()
@permission_required("products:edit")
def update_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product or product.IsDisabled:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại hoặc đã bị ẩn'}), 404

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


# Xóa mềm sản phẩm
@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
@permission_required("products:delete")
def delete_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product or product.IsDisabled:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại hoặc đã bị ẩn'}), 404
    try:
        product.IsDisabled = True
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Đã ẩn sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
