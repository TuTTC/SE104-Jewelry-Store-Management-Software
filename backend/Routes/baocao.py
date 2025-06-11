from flask import Blueprint, request, jsonify
from models import BAOCAO
from database import db
from datetime import datetime
from sqlalchemy import extract

baocao_bp = Blueprint('baocao_bp', __name__)

# Báo cáo theo ngày
@baocao_bp.route('/baocao/theongay', methods=['GET'])
def baocao_theo_ngay():
    date_str = request.args.get('date')  # YYYY-MM-DD
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

    reports = BAOCAO.query.filter(BAOCAO.ThoiGianBaoCao == date_obj).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status':'success','data':data})

# Báo cáo theo tháng
@baocao_bp.route('/baocao/theothang', methods=['GET'])
def baocao_theo_thang():
    month = int(request.args.get('month'))
    year = int(request.args.get('year'))

    reports = BAOCAO.query.filter(
        extract('month', BAOCAO.ThoiGianBaoCao) == month,
        extract('year', BAOCAO.ThoiGianBaoCao) == year
    ).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status':'success','data':data})

# Báo cáo theo năm
@baocao_bp.route('/baocao/theonam', methods=['GET'])
def baocao_theo_nam():
    year = int(request.args.get('year'))
    reports = BAOCAO.query.filter(extract('year', BAOCAO.ThoiGianBaoCao) == year).all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status':'success','data':data})

# Báo cáo tồn kho
@baocao_bp.route('/baocao/tonkho', methods=['GET'])
def baocao_ton_kho():
    reports = BAOCAO.query.filter(BAOCAO.LoaiBaoCao == 'Tồn kho').all()
    data = [r.to_dict() for r in reports]
    return jsonify({'status':'success','data':data})
