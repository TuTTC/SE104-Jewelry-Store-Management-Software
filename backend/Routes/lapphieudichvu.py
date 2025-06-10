from flask import Blueprint, request, jsonify
from database import db
from models import PhieuDichVu, ChiTietPhieuDichVu
from datetime import datetime

phieudichvu_bp = Blueprint('phieudichvu_bp', __name__)

@phieudichvu_bp.route('/phieudichvu', methods=['POST'])
def create_phieu_dichvu():
    try:
        data = request.get_json()

        # Lấy thông tin từ request
        ma_kh = data.get('MaKH')
        tra_truoc = data.get('TraTruoc', 0)
        ghi_chu = data.get('GhiChu', '')
        trang_thai = data.get('TrangThai', 'Chờ xử lý')
        chi_tiet = data.get('ChiTiet', [])

        # Tính tổng tiền
        tong_tien = sum(item['DonGiaDuocTinh'] * item['SoLuong'] for item in chi_tiet)

        # Tạo phiếu dịch vụ
        phieu = PhieuDichVu(
            MaKH=ma_kh,
            NgayLap=datetime.now(),
            TongTien=tong_tien,
            TraTruoc=tra_truoc,
            GhiChu=ghi_chu,
            TrangThai=trang_thai
        )
        db.session.add(phieu)
        db.session.flush()  # Để lấy MaPDV và chèn chi tiết

        for item in chi_tiet:
            ct = ChiTietPhieuDichVu(
                MaPDV=phieu.MaPDV,
                MaDV=item['MaDV'],
                DonGiaDichVu=item['DonGiaDichVu'],
                DonGiaDuocTinh=item['DonGiaDuocTinh'],
                SoLuong=item['SoLuong'],
                ThanhTien=item['DonGiaDuocTinh'] * item['SoLuong'],
                TienTraTruoc=item.get('TienTraTruoc', 0),
                TienConLai=(item['DonGiaDuocTinh'] * item['SoLuong']) - item.get('TienTraTruoc', 0),
                NgayGiao=datetime.strptime(item['NgayGiao'], '%Y-%m-%d') if item.get('NgayGiao') else None,
                TinhTrang=item.get('TinhTrang', 'Chưa giao')
            )
            db.session.add(ct)

        db.session.commit()

        return jsonify({"status": "success", "message": "Lập phiếu dịch vụ thành công", "data": {"MaPDV": phieu.MaPDV}}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    