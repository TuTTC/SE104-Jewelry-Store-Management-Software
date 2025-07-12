from flask import Blueprint, request, jsonify
from models.ReturnRequest import RETURNREQUEST
from models.ReturnItem import RETURNITEM
from models.SanPham import SANPHAM
from sqlalchemy.exc import IntegrityError
from database import db
from datetime import datetime
from decimal import Decimal

return_bp = Blueprint('return', __name__)

# Tạo yêu cầu trả hàng
@return_bp.route('/return', methods=['POST'])
def create_return_request():
    data = request.get_json()

    # 1) Tạo bản ghi ReturnRequest
    req = RETURNREQUEST(
        OrderID      = data['OrderID'],
        UserID       = data['UserID'],
        Type         = data['Type'],            # 'refund' | 'exchange'
        Reason       = data.get('Reason'),
        RefundMethod = data.get('RefundMethod'),
        ReturnAddr   = data.get('ReturnAddr'),
        Status       = 'Accepted',
        CreatedAt    = datetime.utcnow()
    )
    db.session.add(req)
    db.session.flush()  # để req.RequestID có giá trị

    net = Decimal(0)

    # 2) Tạo từng ReturnItem và cập nhật tồn kho
    for it in data['Items']:
        amount = Decimal(it['Amount'])
        qty    = int(it['Quantity'])
        is_new = bool(it.get('IsNewItem', False))

        # Thêm ReturnItem
        item = RETURNITEM(
            RequestID = req.RequestID,
            ProductID = it['ProductID'],
            Quantity  = qty,
            Amount    = amount,
            IsNewItem = is_new
        )
        db.session.add(item)

        # Cập nhật NetAmount
        if is_new:
            # Sản phẩm mới đổi vào thì net -= giá trị
            net -= amount * qty
        else:
            # Sản phẩm trả lại thì net += giá trị
            net += amount * qty

        # --- Cập nhật tồn kho SANPHAM ---
        product = SANPHAM.query.filter_by(MaSP=it['ProductID']).first()
        if not product:
            db.session.rollback()
            return jsonify({'status': 'error', 'message': f"Sản phẩm MaSP={it['ProductID']} không tồn tại"}), 400
        print(f"[DEBUG] Before update: MaSP={product.MaSP}, SoLuongTon={product.SoLuongTon}")

        if is_new:
            # Khách đổi sang sản phẩm mới: trừ tồn
            product.SoLuongTon = product.SoLuongTon - qty
        else:
            # Khách trả lại sản phẩm: cộng tồn
            product.SoLuongTon = product.SoLuongTon + qty
        print(f"[DEBUG] After  update: MaSP={product.MaSP}, SoLuongTon={product.SoLuongTon}")

    # 3) Gán NetAmount và lưu
    req.NetAmount = net
    try:
        db.session.commit()
        return jsonify({'status': 'success', 'RequestID': req.RequestID}), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Lấy danh sách yêu cầu trả hàng
@return_bp.route('/return/<int:rid>', methods=['GET'])
def get_return_request(rid):
    req = RETURNREQUEST.query.get_or_404(rid)
    return jsonify({
      'RequestID': req.RequestID,
      'OrderID': req.OrderID,
      'UserID': req.UserID,
      'Type': req.Type,
      'Reason': req.Reason,
      'RefundMethod': req.RefundMethod,
      'ReturnAddr': req.ReturnAddr,
      'Status': req.Status,
      'NetAmount': str(req.NetAmount),
      'Items': [
        {'ProductID': i.ProductID, 'Quantity': i.Quantity, 'Amount': str(i.Amount)}
        for i in req.items
      ]
    })


# Lấy danh sách yêu cầu trả hàng theo OrderID
@return_bp.route('/return/summary/<int:order_id>', methods=['GET'])
def get_return_summary(order_id):
    # Truy vấn bảng RETURNITEM để tổng hợp số lượng đã trả cho từng ProductID
    rows = db.session.query(
        RETURNITEM.ProductID,
        db.func.sum(RETURNITEM.Quantity).label('ReturnedQty')
    ).join(RETURNREQUEST).filter(
        RETURNREQUEST.OrderID == order_id
    ).group_by(RETURNITEM.ProductID).all()

    summary = {r.ProductID: int(r.ReturnedQty) for r in rows}
    return jsonify({"status":"success", "data": summary})

# Lấy danh sách yêu cầu trả hàng theo OrderID
@return_bp.route('/return/order/<int:order_id>', methods=['GET'])
def list_return_requests(order_id):
    reqs = RETURNREQUEST.query.filter_by(OrderID=order_id).all()
    return jsonify({
      "status": "success",
      "data": [
        {
          "RequestID": r.RequestID,
          "Type": r.Type,
          "Status": r.Status,
          "CreatedAt": r.CreatedAt.isoformat(),
          "items": [
             {
               "ProductID": it.ProductID,
               "ProductName": it.product.TenSP,
               "Quantity": it.Quantity,
               "Amount": float(it.Amount)
             } for it in r.items
          ]
        } for r in reqs
      ]
    }), 200