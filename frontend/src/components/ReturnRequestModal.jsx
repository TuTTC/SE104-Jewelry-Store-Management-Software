import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import returnApi from '../services/returnApi';
import * as productApi from '../services/productApi';

export default function ReturnRequestModal({ show, mode = "add", order, requests = [], onClose, onSubmit }) {
  console.log("[ReturnRequestModal] props:", { show, mode, order, requests });
  const [type, setType] = useState('refund');
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [returnAddr, setReturnAddr] = useState('');
  const [items, setItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
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
          Amount: i.Amount,
          ProductName: i.ProductName || '' // Khởi tạo ProductName
        };
      });

      setType('refund');
      setReason('');
      setMethod('bank_transfer');
      setReturnAddr('');
      setItems(arr);
      setNewItems([]);
    };
    init();
  }, [show, order]);

  useEffect(() => {
    if (show) {
      productApi.getAllProducts()
        .then(res => {
          console.log("API trả về:", res);
          const products = res.data || [];
          setProductsList(products);
          // Cập nhật tên sản phẩm cho items nếu thiếu
          setItems(prevItems => prevItems.map(item => {
            if (!item.ProductName) {
              const product = products.find(p => p.MaSP.toString() === item.ProductID.toString());
              return { ...item, ProductName: product ? product.TenSP : 'Không xác định' };
            }
            return item;
          }));
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
    const qty = Math.max(0, Math.min(Number(v) || 0, max));
    
    setItems(prev => {
      const newItems = [...prev];
      newItems[idx] = { ...newItems[idx], Quantity: qty, selected: qty > 0 };
      return newItems;
    });
  };

  const addNewItem = () => {
    setNewItems(prev => [...prev, { ProductID: '', Quantity: 1, Amount: 0 }]);
  };

  const removeNewItem = idx => {
    setNewItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNewItemChange = (idx, field, value) => {
    setNewItems(prev => {
      const newList = [...prev];
      newList[idx] = { ...newList[idx], [field]: field === 'Quantity' ? Number(value) : value };
      if (field === 'ProductID') {
        const prod = productsList.find(p => p.MaSP.toString() === value);
        newList[idx].Amount = prod ? prod.GiaBan : 0;
      }
      return newList;
    });
  };

  const selectedItems = items.filter(i => i.selected && i.Quantity > 0);
  const returnTotal = selectedItems.reduce((sum, i) => sum + i.Amount * i.Quantity, 0);
  const newItemsTotal = newItems.reduce((sum, item) => sum + (item.Amount * item.Quantity), 0);
  const netAmount = newItemsTotal - returnTotal;

  const hasSelectedItems = items.some(i => i.selected && i.Quantity > 0);
  const hasValidNewItems = newItems.some(item => 
    item.ProductID && item.Quantity > 0 && item.Amount > 0
  );
  const canSend = type === 'refund' ? hasSelectedItems : hasSelectedItems || hasValidNewItems;

  const handleSend = () => {
    const returnItems = items
      .filter(i => i.selected && i.Quantity > 0)
      .map(i => ({
        ProductID: i.ProductID,
        Quantity: i.Quantity,
        Amount: i.Amount * i.Quantity,
        IsNewItem: false
      }));

    const exchangeItems = newItems
      .filter(item => item.ProductID && item.Quantity > 0 && item.Amount > 0)
      .map(item => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        Amount: item.Amount * item.Quantity,
        IsNewItem: true
      }));

    const payload = {
      OrderID: order.id,
      UserID: order.customerId,
      Type: type,
      Reason: reason,
      RefundMethod: type === 'refund' ? method : (netAmount < 0 ? method : null),
      ReturnAddr: returnAddr,
      Items: [...returnItems, ...exchangeItems]
    };
    
    onSubmit(payload);
  };

  if (!show || !order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "auto", maxWidth: "90vw", padding: "20px" }}>
        <div className="modal-header">
          <h2>
            {mode === "add"
              ? `Yêu cầu ${type === "refund" ? "Hoàn tiền" : "Đổi sản phẩm"}`
              : `Lịch sử ${order.orderCode}`}
          </h2>
          <button onClick={onClose} className="modal-close"><X className="icon" /></button>
        </div>

        {mode === "add" ? (
          <div className="modal-form">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="input-field"
            >
              <option value="refund">Hoàn tiền</option>
              <option value="exchange">Đổi sản phẩm</option>
            </select>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Lý do"
              className="input-field"
            />
            {type === 'refund' && (
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="input-field"
              >
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="e_wallet">Ví điện tử</option>
              </select>
            )}
            <textarea
              rows={2}
              value={returnAddr}
              onChange={e => setReturnAddr(e.target.value)}
              placeholder="Địa chỉ trả lại"
              className="input-field"
            />

            {/* Bảng sản phẩm trả lại */}
            <h4>Chọn sản phẩm và nhập số lượng trả:</h4>
            <table className="data-table" style={{ width: "100%", tableLayout: "auto" }}>
              <thead>
                <tr>
                  <th style={{ width: "5%" }}></th> {/* Cột checkbox */}
                  <th style={{ width: "40%" }}>Sản phẩm</th>
                  <th style={{ width: "15%" }}>Số lượng còn lại</th>
                  <th style={{ width: "15%" }}>Đơn giá</th>
                  <th style={{ width: "15%" }}>Số lượng trả</th>
                  <th style={{ width: "15%" }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.ProductID}>
                    <td>
                      <input
                        id={`return-${it.ProductID}`}
                        type="checkbox"
                        checked={it.selected}
                        disabled={it.available <= 0}
                        onChange={() => toggleSelect(idx)}
                      />
                    </td>
                    <td>
                      <label htmlFor={`return-${it.ProductID}`} className="item-label">
                        {it.ProductName}
                      </label>
                    </td>
                    <td>{it.available}</td>
                    <td>{it.Amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={it.available}
                        value={it.Quantity}
                        disabled={!it.selected}
                        onChange={e => handleQuantityChange(idx, e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      {(it.Quantity * it.Amount).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Bảng sản phẩm mới (nếu đổi hàng) */}
            {type === 'exchange' && (
              <>
                <h4>Sản phẩm mới muốn đổi:</h4>
                <table className="data-table" style={{ width: "100%", tableLayout: "auto" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "40%" }}>Sản phẩm</th>
                      <th style={{ width: "15%" }}>Số lượng</th>
                      <th style={{ width: "15%" }}>Đơn giá</th>
                      <th style={{ width: "20%" }}>Thành tiền</th>
                      <th style={{ width: "10%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newItems.map((it, idx) => {
                      const selectedProduct = productsList.find(p => p.MaSP.toString() === it.ProductID);
                      return (
                        <tr key={idx}>
                          <td>
                            <select
                              value={it.ProductID}
                              onChange={e => handleNewItemChange(idx, 'ProductID', e.target.value)}
                              style={{ width: "100%" }}
                            >
                              <option value="">Chọn sản phẩm</option>
                              {productsList.map(p => (
                                <option key={p.MaSP} value={p.MaSP}>
                                  {p.TenSP}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              value={it.Quantity}
                              onChange={e => handleNewItemChange(idx, 'Quantity', e.target.value)}
                              style={{ width: "100%" }}
                            />
                          </td>
                          <td>
                            {selectedProduct 
                              ? selectedProduct.GiaBan.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                              : it.Amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                          </td>
                          <td>{(it.Quantity * it.Amount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</td>
                          <td>
                            <button
                              className="action-icon delete"
                              onClick={() => removeNewItem(idx)}
                            >
                              <Trash className="icon" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button type="button" className="action-button" onClick={addNewItem}>
                  Thêm sản phẩm
                </button>
              </>
            )}

            {/* Hiển thị tổng tiền */}
            <div className="field-group total-amount">
              {type === 'refund' ? (
                <span>Tiền hoàn lại: {returnTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
              ) : (
                <>
                  <div>Tổng tiền trả lại: {returnTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                  <div>Tổng tiền sản phẩm mới: {newItemsTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                  {netAmount > 0 ? (
                    <div>Tiền trả thêm: {netAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
                  ) : netAmount < 0 ? (
                    <div>Tiền hoàn lại: {Math.abs(netAmount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
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
                  <th>RequestID</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                  <th>Sản phẩm</th>
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
            <button type="button" className="action-button" onClick={handleSend} disabled={!canSend}>
              Gửi yêu cầu
            </button>
          )}
          <button type="button" className="action-button cancel" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}