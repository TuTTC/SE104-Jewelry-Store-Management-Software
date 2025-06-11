from flask import Blueprint, request, jsonify
from database import db
from models import NhaCungCap, TonKho, SanPham

nhaphang_bp = Blueprint('nhaphang_bp', __name__)

# Lấy danh sách nhà cung cấp
@nhaphang_bp.route('/nhacungcap', methods=['GET'])
def list_nha_cung_cap():
    items = NhaCungCap.query.all()
    return jsonify({'status':'success','data':[n.to_dict() for n in items]})

# Thông tin nhà cung cấp cụ thể
@nhaphang_bp.route('/nhacungcap/<int:id>', methods=['GET'])
def detail_nha_cung_cap(id):
    n = NhaCungCap.query.get_or_404(id)
    return jsonify({'status':'success','data':n.to_dict()})

# Thêm nhà cung cấp mới
@nhaphang_bp.route('/nhacungcap', methods=['POST'])
def create_nha_cung_cap():
    data = request.get_json()
    try:
        new_ncc = NhaCungCap(
            TenNCC=data['TenNCC'],
            SoDienThoai=data.get('SoDienThoai'),
            Email=data.get('Email'),
            DiaChi=data['DiaChi'],
            NgayHopTac=data.get('NgayHopTac'),
            GhiChu=data.get('GhiChu')
        )
        db.session.add(new_ncc)
        db.session.commit()
        return jsonify({'status':'success','message':'Thêm nhà cung cấp thành công','MaNCC':new_ncc.MaNCC}),201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status':'error','message':str(e)}),400

# Kiểm tra tồn kho toàn bộ
@nhaphang_bp.route('/tonkho', methods=['GET'])
def list_ton_kho():
    entries = TonKho.query.all()
    return jsonify({'status':'success','data':[t.to_dict() for t in entries]})

# Kiểm tra tồn kho theo sản phẩm
@nhaphang_bp.route('/tonkho/<int:id>', methods=['GET'])
def detail_ton_kho(id):
    t = TonKho.query.get_or_404(id)
    return jsonify({'status':'success','data':t.to_dict()})

# Cập nhật giá và tồn kho sản phẩm
@nhaphang_bp.route('/sanpham/<int:id>', methods=['PUT'])
def update_san_pham(id):
    data = request.get_json()
    sp = SanPham.query.get_or_404(id)
    sp.GiaBan = data.get('GiaBan', sp.GiaBan)
    sp.SoLuongTon = data.get('SoLuongTon', sp.SoLuongTon)
    db.session.commit()
    return jsonify({'status':'success','message':'Cập nhật sản phẩm thành công','data':sp.to_dict()})
