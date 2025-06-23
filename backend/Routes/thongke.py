from flask import Blueprint, request, jsonify
from models import ChiTietDonHang, SanPham
from database import db
from sqlalchemy import func

thongke_bp = Blueprint('thongke_bp', __name__)

# Thống kê số lượng hàng bán ra của từng sản phẩm
@thongke_bp.route('/thongke/sanpham-daban', methods=['GET'])
def thongke_sanpham_da_ban():
    date_from = request.args.get('from')  # YYYY-MM-DD
    date_to = request.args.get('to')      # YYYY-MM-DD

    query = db.session.query(
        ChiTietDonHang.MaSP,
        func.sum(ChiTietDonHang.SoLuong).label('SoLuongDaBan')
    ).join(SanPham, ChiTietDonHang.MaSP == SanPham.MaSP)

    if date_from and date_to:
        query = query.filter(ChiTietDonHang.don_hang.has(
            func.date(ChiTietDonHang.don_hang.NgayDat) >= date_from,
            func.date(ChiTietDonHang.don_hang.NgayDat) <= date_to
        ))

    results = query.group_by(ChiTietDonHang.MaSP).all()
    data = [{'MaSP': r.MaSP, 'SoLuongDaBan': int(r.SoLuongDaBan)} for r in results]
    return jsonify({'status':'success','data':data})
