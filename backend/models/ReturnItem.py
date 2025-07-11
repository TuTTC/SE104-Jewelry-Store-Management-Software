from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Boolean
from sqlalchemy.orm import relationship
from database import db

class RETURNITEM(db.Model):
    __tablename__ = "RETURNITEM"

    ReturnItemID = Column(Integer, primary_key=True, autoincrement=True)
    RequestID = Column(Integer, ForeignKey("RETURNREQUEST.RequestID"), nullable=False)
    ProductID = Column(Integer, ForeignKey("SANPHAM.MaSP"), nullable=False)
    Quantity = Column(Integer, nullable=False)
    Amount = Column(DECIMAL(12, 2), nullable=False)  # Tổng tiền = SL * giá
    IsNewItem    = Column(Boolean, default=False)

    # Quan hệ ngược (optional)
    product = relationship("SANPHAM", backref="return_items")
