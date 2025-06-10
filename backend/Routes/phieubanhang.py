from flask import Blueprint, request, jsonify
from database import db
from models import PHIEUBANHANG
from datetime import datetime

phieubanhang_bp = Blueprint('phieubanhang_bp', __name__)

# Tạo phiếu bán hàng
@phieubanhang_bp.route('/phieubanhang', methods=['POST'])
def create_phieu_ban_hang():
    data = request.get_json()
    try:
        phieu = PHIEUBANHANG(
            MaPhieuBan=data['MaPhieuBan'],
            MaDH=data['MaDH'],
            NgayLap=datetime.now().date(),
            TongTien=data['TongTien'],
            PhuongThucThanhToan=data['PhuongThucThanhToan'],
            GhiChu=data.get('GhiChu')
        )
        db.session.add(phieu)
        db.session.commit()
        return jsonify({'status':'success','MaPhieuBan': phieu.MaPhieuBan}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status':'error','message': str(e)}), 400

# Danh sách phiếu bán hàng
@phieubanhang_bp.route('/phieubanhang', methods=['GET'])
def list_phieu_ban_hang():
    items = PHIEUBANHANG.query.all()
    data = [p.to_dict() for p in items]
    return jsonify({'status':'success','data': data})

# Chi tiết phiếu bán hàng
@phieubanhang_bp.route('/phieubanhang/<string:id>', methods=['GET'])
def detail_phieu_ban_hang(id):
    p = PHIEUBANHANG.query.get_or_404(id)
    return jsonify({'status':'success','data': p.to_dict()})

