from flask import Blueprint, request, jsonify
from database import db
from models import PhieuDichVu, ChiTietPhieuDichVu, ThamSo, DichVu
from datetime import datetime

phieudichvu_bp = Blueprint('phieudichvu_bp', __name__)

# Hàm tính đơn giá được tính từ đơn giá dịch vụ + chi phí riêng + lợi nhuận từ tham số
def tinh_don_gia_duoc_tinh(dv: DichVu, chi_phi_rieng: float = 0.0):
    ten_tham_so = f"LoiNhuan_{dv.TenDV}"
    thamso = ThamSo.query.filter_by(TenThamSo=ten_tham_so, KichHoat=True).first()
    ty_le = float(thamso.GiaTri) / 100 if thamso else 0.05  # Mặc định 5%
    return float(dv.DonGia) + chi_phi_rieng + (float(dv.DonGia) * ty_le)

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

        tong_tien = 0
        chi_tiet_objs = []

        for item in chi_tiet:
            dv = DichVu.query.get(item['MaDV'])
            if not dv:
                raise ValueError(f"Dịch vụ mã {item['MaDV']} không tồn tại.")

            chi_phi_rieng = item.get('ChiPhiRieng', 0)
            don_gia_duoc_tinh = tinh_don_gia_duoc_tinh(dv, chi_phi_rieng)
            so_luong = item['SoLuong']
            thanh_tien = don_gia_duoc_tinh * so_luong
            tien_tra_truoc = item.get('TienTraTruoc', 0)
            tinh_trang = item.get('TinhTrang', 'Chưa giao')

            # Kiểm tra trả trước ≥ 50%
            if tien_tra_truoc < 0.5 * thanh_tien:
                raise ValueError(f"Tiền trả trước của dịch vụ mã {item['MaDV']} phải ≥ 50% thành tiền.")

            ct = ChiTietPhieuDichVu(
                MaDV=item['MaDV'],
                DonGiaDichVu=float(dv.DonGia),
                DonGiaDuocTinh=don_gia_duoc_tinh,
                SoLuong=so_luong,
                ThanhTien=thanh_tien,
                TienTraTruoc=tien_tra_truoc,
                TienConLai=thanh_tien - tien_tra_truoc,
                NgayGiao=item.get('NgayGiao'),
                TinhTrang=tinh_trang
            )

            chi_tiet_objs.append(ct)
            tong_tien += thanh_tien

        # Tạo phiếu
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

        # Gán MaPDV và thêm chi tiết
        for ct in chi_tiet_objs:
            ct.MaPDV = phieu.MaPDV
            db.session.add(ct)

        db.session.commit()
        cap_nhat_trang_thai_phieu(phieu.MaPDV)

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
    # Cập nhật trạng thái phiếu nếu cần
    cap_nhat_trang_thai_phieu(ct.MaPDV)
    
    return jsonify({'status': 'success', 'message': 'Cập nhật chi tiết thành công'})

# Xóa 1 dòng chi tiết dịch vụ
@phieudichvu_bp.route('/phieudichvu/chitiet/<int:id>', methods=['DELETE'])
def delete_chi_tiet_dich_vu(id):
    ct = ChiTietPhieuDichVu.query.get_or_404(id)
    ma_pdv = ct.MaPDV
    db.session.delete(ct)
    db.session.commit()
    cap_nhat_trang_thai_phieu(ma_pdv)
    return jsonify({'status': 'success', 'message': 'Xóa chi tiết dịch vụ thành công'})

# (Tùy chọn) Xoá toàn bộ chi tiết của 1 phiếu dịch vụ
@phieudichvu_bp.route('/phieudichvu/<int:ma_pdv>/clear', methods=['DELETE'])
def clear_all_chi_tiet(ma_pdv):
    ChiTietPhieuDichVu.query.filter_by(MaPDV=ma_pdv).delete()
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Đã xóa toàn bộ chi tiết của phiếu'})

def cap_nhat_trang_thai_phieu(ma_pdv):
    chi_tiet = ChiTietPhieuDichVu.query.filter_by(MaPDV=ma_pdv).all()
    if not chi_tiet:
        return  # Không có chi tiết nào → giữ nguyên

    da_giao_het = all(ct.TinhTrang == "Đã giao" for ct in chi_tiet)

    phieu = PhieuDichVu.query.get(ma_pdv)
    phieu.TrangThai = "Hoàn thành" if da_giao_het else "Chưa hoàn thành"
    db.session.commit()
