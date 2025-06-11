from flask import Blueprint, request, jsonify
from models import DichVu
from database import db

dichvu_bp = Blueprint('dichvu', __name__)

# Thêm dịch vụ mới
@dichvu_bp.route('/dichvu', methods=['POST'])
def create_dichvu():
    data = request.get_json()
    try:
        new_dv = DichVu(
            TenDV=data['TenDV'],
            DonGia=data['DonGia'],
            MoTa=data.get('MoTa'),
            TrangThai=data.get('TrangThai', True)
        )
        db.session.add(new_dv)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Thêm dịch vụ thành công'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Xóa dịch vụ theo ID
@dichvu_bp.route('/dichvu/<int:id>', methods=['DELETE'])
def delete_dichvu(id):
    dv = DichVu.query.get(id)
    if not dv:
        return jsonify({'status': 'error', 'message': 'Dịch vụ không tồn tại'}), 404
    db.session.delete(dv)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa dịch vụ thành công'})

# Sửa thông tin dịch vụ
@dichvu_bp.route('/dichvu/<int:id>', methods=['PUT'])
def update_dichvu(id):
    data = request.get_json()
    dv = DichVu.query.get(id)
    if not dv:
        return jsonify({'status': 'error', 'message': 'Dịch vụ không tồn tại'}), 404

    dv.TenDV = data.get('TenDV', dv.TenDV)
    dv.DonGia = data.get('DonGia', dv.DonGia)
    dv.MoTa = data.get('MoTa', dv.MoTa)
    dv.TrangThai = data.get('TrangThai', dv.TrangThai)

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Cập nhật dịch vụ thành công'})

# Tìm kiếm dịch vụ theo từ khóa
@dichvu_bp.route('/dichvu/search', methods=['GET'])
def search_dichvu():
    keyword = request.args.get('q', '')
    results = DichVu.query.filter(DichVu.TenDV.ilike(f'%{keyword}%')).all()
    data = [
        {
            'MaDV': dv.MaDV,
            'TenDV': dv.TenDV,
            'DonGia': float(dv.DonGia),
            'MoTa': dv.MoTa,
            'TrangThai': dv.TrangThai
        }
        for dv in results
    ]
    return jsonify({'status': 'success', 'data': data})

# Lấy danh sách tất cả dịch vụ
@dichvu_bp.route('/dichvu', methods=['GET'])
def get_all_dichvu():
    results = DichVu.query.all()
    data = [
        {
            'MaDV': dv.MaDV,
            'TenDV': dv.TenDV,
            'DonGia': float(dv.DonGia),
            'MoTa': dv.MoTa,
            'TrangThai': dv.TrangThai
        }
        for dv in results
    ]
    return jsonify({'status': 'success', 'data': data})
