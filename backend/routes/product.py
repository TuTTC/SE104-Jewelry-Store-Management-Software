from flask import Blueprint, request, jsonify
from database import db
from models.SanPham import SANPHAM

product_bp = Blueprint('product_bp', __name__)


# Lấy toàn bộ sản phẩm
@product_bp.route('/', methods=['GET'])
def get_products():
    try:
        products = SANPHAM.query.all()
        result = [{
            'MaSP': p.MaSP,
            'TenSP': p.TenSP,
            'MaDM': p.MaDM,
            'MaNCC': p.MaNCC,
            'GiaBan': float(p.GiaBan),
            'SoLuongTon': p.SoLuongTon,
            'MoTa': p.MoTa,
            'HinhAnh': p.HinhAnh
        } for p in products]

        return jsonify({'status': 'success', 'data': result}), 200
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
def update_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'status': 'error', 'message': 'Sản phẩm không tồn tại'}), 404

    data = request.get_json()
    try:
        product.TenSP = data.get('TenSP', product.TenSP)
        product.MaDM = data.get('MaDM', product.MaDM)
        product.MaNCC = data.get('MaNCC', product.MaNCC)
        product.GiaBan = data.get('GiaBan', product.GiaBan)
        product.SoLuongTon = data.get('SoLuongTon', product.SoLuongTon)
        product.MoTa = data.get('MoTa', product.MoTa)
        product.HinhAnh = data.get('HinhAnh', product.HinhAnh)

        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Cập nhật sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Xóa sản phẩm
@product_bp.route('/<int:product_id>', methods=['DELETE'])
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
