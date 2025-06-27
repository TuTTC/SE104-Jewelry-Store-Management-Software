from flask import Blueprint, request, jsonify
from models import BaoCao
from database import db
from datetime import datetime
from sqlalchemy import extract

baocao_bp = Blueprint('baocao_bp', __name__)

# Tạo báo cáo mới
@baocao_bp.route('/baocao', methods=['POST'])
def create_baocao():
    try:
        data = request.get_json()
        bc = BaoCao(
            LoaiBaoCao=data['LoaiBaoCao'],
            ThoiGianBaoCao=datetime.strptime(data['ThoiGianBaoCao'], '%Y-%m-%d').date(),
            DuLieu=data['DuLieu'],
            NguoiTao=data['NguoiTao']
        )
        db.session.add(bc)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tạo báo cáo thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Cập nhật báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['PUT'])
def update_baocao(id):
    try:
        data = request.get_json()
        bc = BaoCao.query.get_or_404(id)
        bc.LoaiBaoCao = data.get('LoaiBaoCao', bc.LoaiBaoCao)
        bc.ThoiGianBaoCao = datetime.strptime(data.get('ThoiGianBaoCao'), '%Y-%m-%d').date()
        bc.DuLieu = data.get('DuLieu', bc.DuLieu)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Cập nhật báo cáo thành công'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Xóa báo cáo
@baocao_bp.route('/baocao/<int:id>', methods=['DELETE'])
def delete_baocao(id):
    bc = BaoCao.query.get_or_404(id)
    db.session.delete(bc)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa báo cáo thành công'})

# Lấy danh sách tất cả báo cáo
@baocao_bp.route('/baocao', methods=['GET'])
def list_baocao():
    reports = BaoCao.query.order_by(BaoCao.ThoiGianBaoCao.desc()).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})


# Báo cáo theo ngày
@baocao_bp.route('/baocao/theongay', methods=['GET'])
def baocao_theo_ngay():
    date_str = request.args.get('date')
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    reports = BaoCao.query.filter(BaoCao.ThoiGianBaoCao == date_obj).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})

# Báo cáo theo tháng
@baocao_bp.route('/baocao/theothang', methods=['GET'])
def baocao_theo_thang():
    month = int(request.args.get('month'))
    year = int(request.args.get('year'))
    reports = BaoCao.query.filter(
        extract('month', BaoCao.ThoiGianBaoCao) == month,
        extract('year', BaoCao.ThoiGianBaoCao) == year
    ).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})

# Báo cáo theo năm
@baocao_bp.route('/baocao/theonam', methods=['GET'])
def baocao_theo_nam():
    year = int(request.args.get('year'))
    reports = BaoCao.query.filter(extract('year', BaoCao.ThoiGianBaoCao) == year).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})

# Báo cáo tồn kho
@baocao_bp.route('/baocao/tonkho', methods=['GET'])
def baocao_ton_kho():
    reports = BaoCao.query.filter(BaoCao.LoaiBaoCao == 'Tồn kho').all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status': 'success', 'data': data})
