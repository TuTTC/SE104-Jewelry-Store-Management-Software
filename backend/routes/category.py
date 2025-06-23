from flask import Blueprint, request, jsonify
from database import db
from models import DANHMUC

category_bp = Blueprint('category_bp', __name__)

# Lấy tất cả danh mục
@category_bp.route('/', methods=['GET'])
def get_categories():
    categories = DANHMUC.query.all()
    result = [{
        'MaDM': c.MaDM,
        'TenDM': c.TenDM,
        'MoTa': c.MoTa
    } for c in categories]
    return jsonify(result), 200

# Thêm danh mục mới
@category_bp.route('/', methods=['POST'])
def add_category():
    data = request.json
    try:
        new_category = DANHMUC(
            TenDM=data['TenDM'],
            MoTa=data.get('MoTa')
        )
        db.session.add(new_category)
        db.session.commit()
        return jsonify({'message': 'Tạo danh mục thành công', 'MaDM': new_category.MaDM}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Cập nhật danh mục
@category_bp.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = DANHMUC.query.get(category_id)
    if not category:
        return jsonify({'error': 'Danh mục không tồn tại'}), 404
    data = request.json
    try:
        category.TenDM = data.get('TenDM', category.TenDM)
        category.MoTa = data.get('MoTa', category.MoTa)
        db.session.commit()
        return jsonify({'message': 'Cập nhật danh mục thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Xóa danh mục
@category_bp.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = DANHMUC.query.get(category_id)
    if not category:
        return jsonify({'error': 'Danh mục không tồn tại'}), 404
    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': 'Xóa danh mục thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
