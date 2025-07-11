from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
from database import db

class RETURNREQUEST(db.Model):
    __tablename__ = "RETURNREQUEST"

    RequestID = Column(Integer, primary_key=True, autoincrement=True)
    OrderID = Column(Integer, ForeignKey("DONHANG.MaDH"), nullable=False)
    UserID = Column(Integer, ForeignKey("NGUOIDUNG.UserID"), nullable=False)
    Type = Column(String(20), nullable=False)  # 'refund' | 'exchange'
    Reason = Column(Text)
    RefundMethod = Column(String(50))          # Nếu là refund
    ReturnAddr = Column(Text)                  # Nếu cần thu hồi
    Status = Column(String(20), nullable=False, default="Accepted")  # Trạng thái xử lý
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, onupdate=datetime.utcnow)
    NetAmount     = Column(DECIMAL(12,2), nullable=False, default=0.0)

    # Quan hệ
    order = relationship("DONHANG", backref="return_requests")
    user = relationship("NGUOIDUNG", backref="return_requests")
    items = relationship("RETURNITEM", backref="request", cascade="all, delete-orphan")
