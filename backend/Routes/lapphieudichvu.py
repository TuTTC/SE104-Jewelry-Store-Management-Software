from flask import Blueprint, request, jsonify
from database import db
from models import PhieuDichVu, ChiTietPhieuDichVu
from datetime import datetime

phieudichvu_bp = Blueprint('phieudichvu_bp', __name__)

# Tạo phiếu dịch vụ mới
@phieudichvu_bp.route('/phieudichvu', methods=['POST'])
def create_phieu_dich_vu():
    data = request.get_json()
    try:
        ma_kh = data['MaKH']
        ghi_chu = data.get('GhiChu', '')
        trang_thai = data.get('TrangThai', 'Chờ xử lý')
        tra_truoc = data.get('TraTruoc', 0)
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
        db.session.flush()

        # Tạo chi tiết phiếu dịch vụ
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
                NgayGiao=item.get('NgayGiao'),
                TinhTrang=item.get('TinhTrang', 'Chưa giao')
            )
            db.session.add(ct)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Tạo phiếu dịch vụ thành công', 'MaPDV': phieu.MaPDV}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Lấy danh sách phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu', methods=['GET'])
def list_phieu_dich_vu():
    items = PhieuDichVu.query.all()
    return jsonify({'status': 'success', 'data': [p.to_dict() for p in items]})

# Xem chi tiết phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:id>', methods=['GET'])
def detail_phieu_dich_vu(id):
    p = PhieuDichVu.query.get_or_404(id)
    details = ChiTietPhieuDichVu.query.filter_by(MaPDV=id).all()
    data = p.to_dict()
    data['ChiTiet'] = [d.to_dict() for d in details]
    return jsonify({'status': 'success', 'data': data})

# Cập nhật 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['PUT'])
def update_chi_tiet_dich_vu(id):
    ct = ChiTietPhieuDichVu.query.get_or_404(id)
    data = request.get_json()

    ct.DonGiaDichVu = data.get('DonGiaDichVu', ct.DonGiaDichVu)
    ct.DonGiaDuocTinh = data.get('DonGiaDuocTinh', ct.DonGiaDuocTinh)
    ct.SoLuong = data.get('SoLuong', ct.SoLuong)
    ct.TienTraTruoc = data.get('TienTraTruoc', ct.TienTraTruoc)
    ct.NgayGiao = data.get('NgayGiao', ct.NgayGiao)
    ct.TinhTrang = data.get('TinhTrang', ct.TinhTrang)

    ct.ThanhTien = ct.DonGiaDuocTinh * ct.SoLuong
    ct.TienConLai = ct.ThanhTien - ct.TienTraTruoc

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Cập nhật chi tiết thành công'})

# Xóa 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['DELETE'])
def delete_chi_tiet_dich_vu(id):
    ct = ChiTietPhieuDichVu.query.get_or_404(id)
    db.session.delete(ct)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Xóa chi tiết dịch vụ thành công'})

# (Tùy chọn) Xoá toàn bộ chi tiết của 1 phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:ma_pdv>/clear', methods=['DELETE'])
def clear_all_chi_tiet(ma_pdv):
    ChiTietPhieuDichVu.query.filter_by(MaPDV=ma_pdv).delete()
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Đã xóa toàn bộ chi tiết của phiếu'})
