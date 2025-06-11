from flask import Blueprint, request, jsonify
from database import db
from models import PhieuNhap, ChiTietPhieuNhap
from datetime import datetime

phieunhap_bp = Blueprint('phieunhap_bp', __name__)

# Tạo phiếu nhập
@phieunhap_bp.route('/phieunhap', methods=['POST'])
def create_phieu_nhap():
    data = request.get_json()
    try:
        ma_ncc = data['MaNCC']
        user_id = data['UserID']
        ghi_chu = data.get('GhiChu', '')
        trang_thai = data.get('TrangThai', 'Đang xử lý')
        chi_tiet = data.get('ChiTiet', [])

        # Tính tổng tiền
        tong_tien = sum(item['SoLuong'] * item['DonGiaNhap'] for item in chi_tiet)

        # Tạo phiếu nhập
        phieu = PhieuNhap(
            MaNCC=ma_ncc,
            UserID=user_id,
            NgayNhap=datetime.now(),
            TongTien=tong_tien,
            TrangThai=trang_thai,
            GhiChu=ghi_chu
        )
        db.session.add(phieu)
        db.session.flush()

        # Tạo chi tiết phiếu nhập và cập nhật tồn kho
        for item in chi_tiet:
            ct = ChiTietPhieuNhap(
                MaPN=phieu.MaPN,
                MaSP=item['MaSP'],
                SoLuong=item['SoLuong'],
                DonGiaNhap=item['DonGiaNhap'],
                ThanhTien=item['SoLuong'] * item['DonGiaNhap']
            )
            db.session.add(ct)
        db.session.commit()
        return jsonify({'status':'success','message':'Tạo phiếu nhập thành công','MaPN':phieu.MaPN}),201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status':'error','message':str(e)}),400

# Lấy danh sách phiếu nhập
@phieunhap_bp.route('/phieunhap', methods=['GET'])
def list_phieu_nhap():
    phieu = PhieuNhap.query.all()
    data = [p.to_dict() for p in phieu]
    return jsonify({'status':'success','data':data})

# Xem chi tiết một phiếu nhập
@phieunhap_bp.route('/phieunhap/<int:id>', methods=['GET'])
def detail_phieu_nhap(id):
    p = PhieuNhap.query.get_or_404(id)
    details = ChiTietPhieuNhap.query.filter_by(MaPN=id).all()
    data = p.to_dict()
    data['ChiTiet'] = [d.to_dict() for d in details]
    return jsonify({'status':'success','data':data})