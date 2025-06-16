from flask import Blueprint, request, jsonify
from database import db
from models.SanPham import SANPHAM

product_bp = Blueprint('product_bp', __name__)

# Lấy sản phẩm
@product_bp.route('/', methods=['GET'])
def get_products():
    products = SANPHAM.query.all()
    result = []
    for p in products:
        result.append({
            'MaSP': p.MaSP,
            'TenSP': p.TenSP,
            'MaDM': p.MaDM,
            'MaNCC': p.MaNCC,
            'GiaBan': float(p.GiaBan),
            'SoLuongTon': p.SoLuongTon,
            'MoTa': p.MoTa,
            'HinhAnh': p.HinhAnh,
        })
    return jsonify(result), 200

# Thêm sản phẩm
@product_bp.route('/', methods=['POST'])
def add_product():
    data = request.json
    try:
        new_product = SANPHAM(
            TenSP=data['TenSP'],
            MaDM=data['MaDM'],
            MaNCC=data['MaNCC'],
            GiaBan=data['GiaBan'],
            SoLuongTon=data['SoLuongTon'],
            MoTa=data.get('MoTa'),
            HinhAnh=data.get('HinhAnh')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Tạo sản phẩm thành công', 'MaSP': new_product.MaSP}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

#
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'error': 'Sản phẩm không tồn tại'}), 404
    return jsonify({
        'MaSP': product.MaSP,
        'TenSP': product.TenSP,
        'MaDM': product.MaDM,
        'MaNCC': product.MaNCC,
        'GiaBan': float(product.GiaBan),
        'SoLuongTon': product.SoLuongTon,
        'MoTa': product.MoTa,
        'HinhAnh': product.HinhAnh,
    }), 200

@product_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'error': 'Sản phẩm không tồn tại'}), 404

    data = request.json
    try:
        product.TenSP = data.get('TenSP', product.TenSP)
        product.MaDM = data.get('MaDM', product.MaDM)
        product.MaNCC = data.get('MaNCC', product.MaNCC)
        product.GiaBan = data.get('GiaBan', product.GiaBan)
        product.SoLuongTon = data.get('SoLuongTon', product.SoLuongTon)
        product.MoTa = data.get('MoTa', product.MoTa)
        product.HinhAnh = data.get('HinhAnh', product.HinhAnh)

        db.session.commit()
        return jsonify({'message': 'Cập nhật sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = SANPHAM.query.get(product_id)
    if not product:
        return jsonify({'error': 'Sản phẩm không tồn tại'}), 404
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Xóa sản phẩm thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
