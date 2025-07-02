import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Gem,
} from "lucide-react";
import { initialOrders, initialProducts } from '../data/initialData';

const Dashboard = () => {
  // Tính toán tổng doanh thu từ initialOrders
  const totalRevenue = initialOrders.reduce((acc, order) => acc + Number(order.total.replace(/[$,]/g, '')), 0);
  // Tính toán tổng số lượng bán ra từ initialProducts
  const totalSales = initialProducts.reduce((acc, product) => acc + product.quantity, 0);

  // Dữ liệu mẫu cho biểu đồ
  const salesData = [
    { month: "T1", revenue: 45000000, orders: 120 },
    { month: "T2", revenue: 52000000, orders: 145 },
    { month: "T3", revenue: 48000000, orders: 132 },
    { month: "T4", revenue: 61000000, orders: 167 },
    { month: "T5", revenue: 55000000, orders: 154 },
    { month: "T6", revenue: 67000000, orders: 189 },
  ];

  const productCategories = [
    { name: "Nhẫn", value: 35, color: "#F59E0B" },
    { name: "Dây chuyền", value: 25, color: "#8B5CF6" },
    { name: "Bông tai", value: 20, color: "#EF4444" },
    { name: "Lắc tay", value: 15, color: "#10B981" },
    { name: "Khác", value: 5, color: "#6B7280" },
  ];

  const stats = [
    {
      title: "Doanh thu tháng này",
      value: `${(67000000).toLocaleString('vi-VN')} ₫`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Đơn hàng mới",
      value: "189",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Khách hàng",
      value: "1,247",
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Sản phẩm bán chạy",
      value: "342",
      change: "-2.1%",
      trend: "down",
      icon: Gem,
    },
  ];

  return (
    <div className="dashboard-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="welcome-title">Chào mừng trở lại!</h2>
        <p className="welcome-text">
          Đây là tổng quan về hoạt động kinh doanh của PTV Jewelry hôm nay.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="card-label">{stat.title}</p>
                    <p className="card-value">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="trend-icon trend-up" />
                      ) : (
                        <TrendingDown className="trend-icon trend-down" />
                      )}
                      <span className={`trend-text ${stat.trend === "up" ? "trend-up" : "trend-down"}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="card-icon">
                    <Icon className="icon" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue Chart - Sử dụng LineChart từ Dashboard cũ */}
        <div className="card">
          <div className="card-content">
            <h2 className="card-title">Doanh thu 6 tháng gần nhất</h2>
            <p className="card-description">Theo dõi xu hướng doanh thu theo tháng</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} tickFormatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                  <Tooltip formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, "Doanh thu"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#c1a47e" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="card">
          <div className="card-content">
            <h2 className="card-title">Phân loại sản phẩm</h2>
            <p className="card-description">Tỷ lệ bán hàng theo danh mục sản phẩm</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {productCategories.map((category, index) => (
                  <div key={index} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="legend-text">
                      {category.name} ({category.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-content">
          <h2 className="card-title">Đơn hàng gần đây</h2>
          <p className="card-description">Danh sách đơn hàng mới nhất</p>
          <div className="orders-container">
            {initialOrders.slice(0, 3).map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-info">
                  <p className="order-id">#{order.id}</p>
                  <p className="order-customer">{order.customer}</p>
                </div>
                <div className="order-product">
                  <p className="order-product-name">{order.product}</p>
                </div>
                <div className="order-details">
                  <p className="order-amount">{order.total}</p>
                  <span
                    className={`order-status ${
                      order.status === "Hoàn thành"
                        ? "status-completed"
                        : order.status === "Đã xác nhận"
                        ? "status-confirmed"
                        : "status-processing"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;