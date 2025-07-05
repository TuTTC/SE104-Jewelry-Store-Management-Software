from flask import Blueprint, request, jsonify
from database import db
from models import DANHMUC, SANPHAM
from utils.permissions import permission_required
from flask_jwt_extended import get_jwt_identity, jwt_required
import re
import unicodedata

category_bp = Blueprint('category_bp', __name__)

def normalize_text(text):
    text = text.strip().lower()
    text = text.replace('đ', 'd').replace('Đ', 'd').replace('ư', 'u').replace('Ư', 'u')
    text = unicodedata.normalize('NFD', text)
    text = re.sub(r'[\u0300-\u036f]', '', text)
    text = re.sub(r'\s+', '', text)
    return text

# Lấy tất cả danh mục chưa bị ẩn
@category_bp.route('/', methods=['GET'])
@jwt_required()
@permission_required("categories:view")
def get_categories():
    categories = DANHMUC.query.filter_by(IsDisabled=False).all()
    result = [{
        'MaDM': c.MaDM,
        'TenDM': c.TenDM,
        'DonViTinh': c.DonViTinh,
        "PhanTramLoiNhuan": c.PhanTramLoiNhuan,
        'MoTa': c.MoTa
    } for c in categories]
    return jsonify(result), 200

# Thêm danh mục mới hoặc khôi phục nếu đã bị ẩn
@category_bp.route('/', methods=['POST'])
@jwt_required()
@permission_required("categories:add")
def add_category():
    data = request.json
    try:
        ten_dm_raw = data['TenDM']
        ten_dm_normalized = normalize_text(ten_dm_raw)

        existing_dm = DANHMUC.query.all()
        
        for dm in existing_dm:
            if normalize_text(dm.TenDM) == ten_dm_normalized:
                if dm.IsDisabled:
                    dm.IsDisabled = False
                    dm.DonViTinh = data['DonViTinh']
                    dm.MoTa = data.get('MoTa')
                    dm.PhanTramLoiNhuan = data.get('PhanTramLoiNhuan', dm.PhanTramLoiNhuan)
                    db.session.commit()
                    return jsonify({'message': 'Danh mục đã được khôi phục'}), 200
                else:
                    return jsonify({'error': 'Tên danh mục đã tồn tại'}), 400

        new_category = DANHMUC(
            TenDM=ten_dm_raw,
            DonViTinh=data['DonViTinh'],
            MoTa=data.get('MoTa'),
            PhanTramLoiNhuan=data.get('PhanTramLoiNhuan', 0.0),
            IsDisabled=False
        )
        db.session.add(new_category)
        db.session.commit()
        return jsonify({'message': 'Tạo danh mục thành công', 'MaDM': new_category.MaDM}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Cập nhật danh mục
@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
@permission_required("categories:edit")
def update_category(category_id):
    category = DANHMUC.query.get(category_id)
    if not category or category.IsDisabled:
        return jsonify({'error': 'Danh mục không tồn tại hoặc đã bị ẩn'}), 404

    data = request.json
    try:
        category.TenDM = data.get('TenDM', category.TenDM)
        category.DonViTinh = data.get('DonViTinh', category.DonViTinh)
        category.MoTa = data.get('MoTa', category.MoTa)
        category.PhanTramLoiNhuan = data.get('PhanTramLoiNhuan', category.PhanTramLoiNhuan)
        db.session.commit()
        return jsonify({'message': 'Cập nhật danh mục thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Xóa mềm danh mục
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
@permission_required("categories:delete")
def delete_category(category_id):
    category = DANHMUC.query.get(category_id)
    if not category or category.IsDisabled:
        return jsonify({'error': 'Danh mục không tồn tại hoặc đã bị ẩn'}), 404
    try:
        category.IsDisabled = True
        # Ẩn luôn sản phẩm liên quan
        SANPHAM.query.filter_by(MaDM=category_id).update({SANPHAM.IsDisabled: True})
        db.session.commit()
        return jsonify({'message': 'Đã ẩn danh mục và các sản phẩm liên quan'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
