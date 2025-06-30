export const searchFields = {
  products: [
    { name: "code", type: "text", placeholder: "Mã sản phẩm" },
    { name: "name", type: "text", placeholder: "Tên sản phẩm" },
  ],
  orders: [
    { name: "orderCode", type: "text", placeholder: "Mã đơn hàng" },
    { name: "customer", type: "text", placeholder: "Khách hàng" },
  ],
  accounts: [
    { name: "name", type: "text", placeholder: "Tên" },
    { name: "email", type: "email", placeholder: "Email" },
  ],
  categories: [
    { name: "name", type: "text", placeholder: "Tên danh mục" },
  ],
  services: [
    { name: "code", type: "text", placeholder: "Mã dịch vụ" },
    { name: "name", type: "text", placeholder: "Tên dịch vụ" },
  ],
  purchaseOrders: [
    { name: "code", type: "text", placeholder: "Mã phiếu nhập" },
    { name: "supplier", type: "text", placeholder: "Nhà cung cấp" },
  ],
  suppliers: [
    { name: "name", type: "text", placeholder: "Tên nhà cung cấp" },
    { name: "email", type: "email", placeholder: "Email" },
  ],
  inventory: [
    { name: "productId", type: "number", placeholder: "ID sản phẩm" },
  ],
  reports: [
    { name: "type", type: "text", placeholder: "Loại báo cáo" },
  ],
  purchaseOrderDetails: [
    { name: "maPN", type: "number", placeholder: "Mã phiếu nhập" },
    { name: "maSP", type: "number", placeholder: "Mã sản phẩm" },
  ],
  serviceDetails: [
    { name: "maPDV", type: "number", placeholder: "Mã phiếu dịch vụ" },
    { name: "maDV", type: "number", placeholder: "Mã dịch vụ" },
  ],
};