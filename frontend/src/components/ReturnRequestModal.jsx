import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import returnApi from '../services/returnApi';
import * as productApi from '../services/productApi';
export default function ReturnRequestModal({ show, mode = "add", order, requests = [], onClose, onSubmit }) {
  console.log("[ReturnRequestModal] props:", { show, mode, order, requests });
  const [type, setType] = useState('refund');
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [handleMoney, setHandleMoney] = useState('refund');
  const [returnAddr, setReturnAddr] = useState('');
  const [items, setItems] = useState([]);
  const [newItems, setNewItems] = useState([]); // Danh sách sản phẩm mới
  const [productsList, setProductsList] = useState([]); 

  useEffect(() => {
    if (!show || !order) return;

    const init = async () => {
      let summary = {};
      try {
        const res = await returnApi.getReturnSummary(order.id);
        if (res.status === 'success') {
          summary = res.data;
        }
      } catch (e) {
        console.error('Error fetching return summary', e);
      }

      const arr = order.items.map(i => {
        const prevReturned = summary[i.ProductID] || 0;
        const available = i.SoLuong - prevReturned;
        return {
          ...i,
          selected: false,
          Quantity: 0,
          available,
          Amount: i.Amount
        };
      });

      setType('refund');
      setReason('');
      setMethod('bank_transfer');
      setReturnAddr('');
      setItems(arr);
      setNewItems([]); // Reset sản phẩm mới
    };
    init();
  }, [show, order]);

  useEffect(() => {
    if (show) {
      productApi.getAllProducts()
        .then(res => {
          console.log("API trả về:", res);
          // res có thể là { status, data: [...] }
          setProductsList(res.data || []); 
        })
        .catch(err => console.error(err));
    }
  }, [show]);

  const toggleSelect = idx => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[idx] = { 
        ...newItems[idx], 
        selected: !prevItems[idx].selected 
      };
      return newItems;
    });
  };

  const handleQuantityChange = (idx, v) => {
    const max = items[idx].available;
    const qty = Math.max(0, Math.min(Number(v)||0, max));
    
    setItems(prev => {
      const newItems = [...prev];
      newItems[idx] = { ...newItems[idx], Quantity: qty };
      return newItems;
    });
  };

  // Thêm sản phẩm mới muốn đổi
  const addNewItem = () => {
    setNewItems(prev => [...prev, { ProductID: '', Quantity: 1, Amount: 0 }]);
  };

  // Xóa sản phẩm mới
  const removeNewItem = idx => {
    setNewItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Xử lý thay đổi thông tin sản phẩm mới
  const handleNewItemChange = (idx, field, value) => {
    setNewItems(prev => {
      const newList = [...prev];
      newList[idx] = { ...newList[idx], [field]: field==='Quantity' ? Number(value) : value };
      return newList;
    });
  };

  // Tính tổng tiền sản phẩm cũ (trả lại)
  const selectedItems = items.filter(i => i.selected && i.Quantity > 0);
  const returnTotal = selectedItems.reduce((sum, i) => sum + i.Amount * i.Quantity, 0);
  
  // Tính tổng tiền sản phẩm mới (muốn đổi)
  const newItemsTotal = newItems.reduce((sum, item) => sum + (item.Amount * item.Quantity), 0);
  
  // Tính chênh lệch tiền
  const netAmount = newItemsTotal - returnTotal;

  // Kiểm tra có thể gửi yêu cầu
  const hasSelectedItems = items.some(i => i.selected && i.Quantity > 0);
  const hasValidNewItems = newItems.some(item => 
    item.ProductID && item.Quantity > 0 && item.Amount > 0
  );
  
  const canSend = type === 'refund' 
    ? hasSelectedItems 
    : hasSelectedItems || hasValidNewItems;

const handleSend = () => {
  // Sản phẩm cũ (trả lại)
  const returnItems = items
    .filter(i => i.selected && i.Quantity > 0)
    .map(i => ({
      ProductID: i.ProductID,
      Quantity: i.Quantity,
      Amount: i.Amount * i.Quantity,
      IsNewItem: false  // Đánh dấu sản phẩm cũ
    }));

  // Sản phẩm mới (muốn đổi)
  const exchangeItems = newItems
    .filter(item => item.ProductID && item.Quantity > 0 && item.Amount > 0)
    .map(item => ({
      ProductID: item.ProductID,
      Quantity: item.Quantity,
      Amount: item.Amount * item.Quantity,  // Tính tổng tiền
      IsNewItem: true  // Đánh dấu sản phẩm mới
    }));

  const payload = {
    OrderID: order.id,
    UserID: order.customerId,
    Type: type,
    Reason: reason,
    RefundMethod: type === 'refund' ? method : (netAmount < 0 ? method : null),
    ReturnAddr: returnAddr,
    Items: [...returnItems, ...exchangeItems]  // Gộp cả sản phẩm cũ và mới
  };
  
  onSubmit(payload);
};

  if (!show || !order) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            {mode === "add"
              ? `Yêu cầu ${type === "refund" ? "Hoàn tiền" : "Đổi sản phẩm"}`
              : `Lịch sử ${order.orderCode}`}
          </h2>
          <button onClick={onClose} className="modal-close"><X /></button>
        </div>
        {mode === "add" ? (
        <div className="modal-body">
          {/* Loại */}
          <div className="field-group">
            <label>Loại</label>
          </div>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="refund">Hoàn tiền</option>
            <option value="exchange">Đổi sản phẩm</option>
          </select>
          
          {/* Lý do */}
          <div className="field-group">
            <label>Lý do</label>
          </div>
          <textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} />
          
          {/* Phương thức hoàn tiền */}
            <>
              <div className="field-group">
                <label>Phương thức hoàn tiền</label>
              </div>
              <select value={method} onChange={e => setMethod(e.target.value)}>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="e_wallet">Ví điện tử</option>
              </select>
            </>
          
          <div className="field-group">
            <label>Địa chỉ trả lại</label>
          </div>
          <textarea
            rows={2}
            value={returnAddr}
            onChange={e => setReturnAddr(e.target.value)}
          />
          
          {/* Danh sách sản phẩm trả lại */}
          <h4>Chọn sản phẩm và nhập số lượng trả:</h4>
          <div className="return-items">
            {items.map((it, idx) => (
              <div key={it.ProductID} className="return-item-row">
                <input
                  id={`return-${it.ProductID}`}
                  type="checkbox"
                  checked={it.selected}
                  disabled={it.available <= 0}
                  onChange={() => toggleSelect(idx)}
                />
                <label htmlFor={`return-${it.ProductID}`} className="item-label">
                  {it.ProductName} (Còn lại: {it.available}) – {it.Amount.toLocaleString()}₫ / cái – Trả lại
                </label>
                <input
                  type="number"
                  min={0}
                  max={it.available}
                  disabled={!it.selected}
                  value={it.Quantity}
                  onChange={e => handleQuantityChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Sản phẩm mới muốn đổi */}
          {type === 'exchange' && (
            <>  
              <h4>Sản phẩm mới muốn đổi:</h4>
              {newItems.map((it, idx) => (
                <div key={idx} className="return-item-row">
                <select
                  value={it.ProductID}
                  onChange={e => {
                    const selectedId = e.target.value;
                    const prod = productsList.find(p => p.MaSP.toString() === selectedId);
                    handleNewItemChange(idx, 'ProductID', selectedId);
                    handleNewItemChange(idx, 'Amount', prod ? prod.GiaBan : 0);
                  }}
                >
                <option value="" disabled>-- Chọn sản phẩm --</option>
                {productsList.map(p => (
                  <option key={p.MaSP} value={p.MaSP}>
                    {p.TenSP}
                  </option>
                ))}
                </select>

                <input 
                  type="number" 
                  placeholder="Số lượng" 
                  min={1} 
                  value={it.Quantity} 
                  onChange={e => handleNewItemChange(idx, 'Quantity', e.target.value)} 
                />
                <input 
                  type="number" 
                  placeholder="Đơn giá (tự động)" 
                  value={it.Amount} 
                  disabled 
                />
                  <button type="button" onClick={() => removeNewItem(idx)}>
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="add-new-item" onClick={addNewItem}>
                <Plus size={16} /> Thêm sản phẩm
              </button>
            </>
          )}

          {/* Hiển thị tổng tiền */}
          <div className="field-group total-amount">
            {type === 'refund' ? (
              <span>Tiền hoàn lại: {returnTotal.toLocaleString()}₫</span>
            ) : (
              <>
                <div>Tổng tiền trả lại: {returnTotal.toLocaleString()}₫</div>
                <div>Tổng tiền sản phẩm mới: {newItemsTotal.toLocaleString()}₫</div>
                {netAmount > 0 ? (
                  <div>Tiền trả thêm: {netAmount.toLocaleString()}₫</div>
                ) : netAmount < 0 ? (
                  <div>Tiền hoàn lại: {Math.abs(netAmount).toLocaleString()}₫</div>
                ) : (
                  <div>Không trả thêm hay nhận lại</div>
                )}
              </>
            )}
          </div>
        </div>


        ) : (
          <div className="modal-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>RequestID</th><th>Loại</th><th>Trạng thái</th>
                  <th>Ngày</th><th>Sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.RequestID}>
                    <td>{r.RequestID}</td>
                    <td>{r.Type}</td>
                    <td>{r.Status}</td>
                    <td>{new Date(r.CreatedAt).toLocaleString()}</td>
                    <td>
                      {r.items.map(i =>
                        `${i.ProductName} x${i.Quantity} (${i.Amount.toLocaleString()}₫)`
                      ).join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        <div className="modal-actions">
          {mode === "add" && (
            <button className="action-button" onClick={handleSend} disabled={!canSend}>
              Gửi yêu cầu
            </button>
          )}
          <button className="action-button cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}