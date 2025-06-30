export const initialData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 7000 },
];

export const initialProducts = [
  { id: 1, code: "SP001", name: "Nhẫn Ruby", price: "$1200", category: "Nhẫn", quantity: 10, status: "Còn hàng", image: "https://via.placeholder.com/50", note: "Bán chạy" },
  { id: 2, code: "SP002", name: "Dây chuyền Sapphire", price: "$2500", category: "Dây chuyền", quantity: 5, status: "Sắp hết", image: "https://via.placeholder.com/50", note: "Phiên bản giới hạn" },
];

export const initialOrders = [
  { id: 101, orderCode: "ORD001", customer: "Nguyễn Văn A", date: "2024-04-01", total: "$3700", status: "Chưa xử lý", paymentMethod: "Thẻ tín dụng", deliveryAddress: "123 Đường Láng, Hà Nội", note: "Gói quà" },
  { id: 102, orderCode: "ORD002", customer: "Trần Thị B", date: "2024-04-02", total: "$1200", status: "Chưa xử lý", paymentMethod: "PayPal", deliveryAddress: "456 Nguyễn Huệ, TP.HCM", note: "Gọi trước khi giao" },
];

export const initialAccounts = [
  { id: 1, username: "alice", password: "alice123", name: "Alice Nguyễn", email: "alice@jewelry.com", role: "admin", status: "Kích hoạt", accountCode: "TK001", phone: "(123) 456-7890", address: "123 Đường Admin", position: "Quản trị" },
  { id: 2, username: "bob", password: "bob123", name: "Bob Trần", email: "bob@jewelry.com", role: "customer", status: "Kích hoạt", accountCode: "TK002", phone: "(987) 654-3210", address: "456 Đường Khách hàng", position: "Khách hàng" },
];

export const initialServices = [
  { id: 1, code: "DV001", name: "Thiết kế theo yêu cầu", price: 500.00, description: "Thiết kế trang sức tùy chỉnh", status: true },
  { id: 2, code: "DV002", name: "Sửa chữa trang sức", price: 300.00, description: "Sửa chữa và đánh bóng", status: true },
];

export const initialPurchaseOrderDetails = [
  { id: 1, maCTPN: 1, maPN: 1, maSP: 1, soLuong: 10, donGiaNhap: 1000.00, thanhTien: 10000.00 },
  { id: 2, maCTPN: 2, maPN: 2, maSP: 2, soLuong: 5, donGiaNhap: 1000.00, thanhTien: 5000.00 },
];

export const initialServiceDetails = [
  { id: 1, maCT: 1, maPDV: 1, maDV: 1, donGiaDichVu: 500.00, donGiaDuocTinh: 550.00, soLuong: 1, thanhTien: 550.00, tienTraTruoc: 200.00, tienConLai: 350.00, ngayGiao: "2024-06-01", tinhTrang: "Chưa giao" },
  { id: 2, maCT: 2, maPDV: 2, maDV: 2, donGiaDichVu: 300.00, donGiaDuocTinh: 330.00, soLuong: 1, thanhTien: 330.00, tienTraTruoc: 100.00, tienConLai: 230.00, ngayGiao: null, tinhTrang: "Chưa giao" },
];

export const initialSuppliers = [
  { id: 1, name: "Nhà cung cấp A", phone: "(111) 111-1111", email: "suppliera@example.com", address: "123 Đường Cung cấp" },
  { id: 2, name: "Nhà cung cấp B", phone: "(222) 222-2222", email: "supplierb@example.com", address: "456 Đại lộ Cung cấp" },
];

export const initialInventory = [
  { id: 1, productId: 1, quantity: 10, lastUpdated: "2024-06-01" },
  { id: 2, productId: 2, quantity: 5, lastUpdated: "2024-06-01" },
];

export const initialReports = [
  { id: 1, type: "Doanh thu", date: "2024-06-01", data: { revenue: 15000 }, createdAt: "2024-06-01T12:00:00Z" },
];

export const initialCategories = [
  { id: 1, name: "Nhẫn", description: "Nhẫn trang sức", status: "Kích hoạt" },
  { id: 2, name: "Dây chuyền", description: "Dây chuyền thời trang", status: "Kích hoạt" },
  { id: 3, name: "Vòng tay", description: "Vòng tay cao cấp", status: "Kích hoạt" },
];

export const initialPurchaseOrders = [
  { id: 1, orderCode: "PN001", supplierId: 1, date: "2024-06-01", total: 10000.00, status: "Chưa xử lý" },
  { id: 2, orderCode: "PN002", supplierId: 2, date: "2024-06-02", total: 5000.00, status: "Đã xử lý" },
];