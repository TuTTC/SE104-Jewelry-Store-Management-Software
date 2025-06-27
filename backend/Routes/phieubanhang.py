from flask import Blueprint, request, jsonify
from database import db
from models import PHIEUBANHANG
from datetime import datetime

phieubanhang_bp = Blueprint('phieubanhang_bp', __name__)

# ---------------------- PUBLIC API ----------------------

# Danh sách phiếu bán hàng
@phieubanhang_bp.route('/phieubanhang', methods=['GET'])
def list_phieu_ban_hang():
    items = PHIEUBANHANG.query.all()
    data = [p.to_dict() for p in items]
    return jsonify({'status': 'success', 'data': data})

# Chi tiết phiếu bán hàng
@phieubanhang_bp.route('/phieubanhang/<string:id>', methods=['GET'])
def detail_phieu_ban_hang(id):
    p = PHIEUBANHANG.query.get_or_404(id)
    return jsonify({'status': 'success', 'data': p.to_dict()})


# ---------------------- HÀM HỖ TRỢ (DÙNG NỘI BỘ) ----------------------

# Hàm tự động tạo phiếu bán hàng khi đơn hàng thanh toán thành công
def create_phieu_ban_hang_auto(ma_dh, tong_tien, pt_thanhtoan='Tiền mặt', ghichu=None):
    try:
        # Tự sinh mã phiếu bán hàng dựa vào mã đơn hàng
        ma_phieu_ban = f"PBH{ma_dh}"

        phieu = PHIEUBANHANG(
            MaPhieuBan=ma_phieu_ban,
            MaDH=ma_dh,
            NgayLap=datetime.now().date(),
            TongTien=tong_tien,
            PhuongThucThanhToan=pt_thanhtoan,
            GhiChu=ghichu
        )
        db.session.add(phieu)
        db.session.commit()
        return {'status': 'success', 'MaPhieuBan': ma_phieu_ban}
    except Exception as e:
        db.session.rollback()
        return {'status': 'error', 'message': str(e)}
