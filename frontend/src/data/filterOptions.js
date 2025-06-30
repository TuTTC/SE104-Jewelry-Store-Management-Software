export const filterOptions = {
  products: [
    { name: "category", type: "select", options: ["", "Ring", "Necklace"], placeholder: "Chọn danh mục" },
    { name: "status", type: "select", options: ["", "In Stock", "Low Stock"], placeholder: "Chọn trạng thái" },
  ],
  orders: [
    { name: "status", type: "select", options: ["", "Pending", "Shipped"], placeholder: "Chọn trạng thái" },
    { name: "paymentMethod", type: "text", placeholder: "Phương thức thanh toán" },
  ],
  accounts: [
    { name: "status", type: "select", options: ["", "Active", "Inactive"], placeholder: "Chọn trạng thái" },
    { name: "role", type: "select", options: ["", "Customer", "Admin", "Employee"], placeholder: "Chọn vai trò" },
  ],
  categories: [
    { name: "name", type: "text", placeholder: "Tên danh mục" },
  ],
  services: [
    { name: "status", type: "select", options: ["", "true", "false"], placeholder: "Chọn trạng thái" },
  ],
  purchaseOrders: [
    { name: "status", type: "select", options: ["", "Đã nhập", "Đang xử lý", "Hủy"], placeholder: "Chọn trạng thái" },
  ],
  suppliers: [
    { name: "name", type: "text", placeholder: "Tên nhà cung cấp" },
  ],
  inventory: [
    { name: "quantity", type: "number", placeholder: "Số lượng tối thiểu" },
  ],
  reports: [
    { name: "type", type: "select", options: ["", "Doanh thu", "Tồn kho", "Lợi nhuận"], placeholder: "Chọn loại" },
  ],
  purchaseOrderDetails: [
    { name: "soLuong", type: "number", placeholder: "Số lượng tối thiểu" },
  ],
  serviceDetails: [
    { name: "tinhTrang", type: "select", options: ["", "Đã giao", "Chưa giao"], placeholder: "Chọn trạng thái" },
  ],
};