
import React, {useState, useEffect} from "react";
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
import { 
  danhSachDonHang,
  getChiTietDonHang
 } from "services/donhangApi";
 import { getSanPhamById } from "services/sanphamApi";
const Dashboard = () => {
    const [totalRevenue, setTotalRevenue] = useState(0); // Tổng doanh thu tháng này
    const [totalSales, setTotalSales] = useState(0); // Tổng số sản phẩm bán ra
    const [orders, setOrders] = useState([]); // Danh sách đơn hàng
    const [recentOrders, setRecentOrders] = useState([]); // Danh sách đơn hàng gần đây
    const [salesData, setSalesData] = useState([]); // Dữ liệu doanh thu theo tháng
    const [salesChange, setSalesChange] = useState(0); // Trường change trong sản phẩm bán ra
    const [customerChange, setCustomerChange] = useState(0); // Trường change trong khách hàng
    const [revenueChange, setRevenueChange] = useState(0); // Trường change trong doanh thu
    const [categoryData, setCategoryData] = useState([]); // Dữ liệu phân loại sản phẩm
    const [bestSellingProduct, setBestSellingProduct] = useState("Không biết"); // Tên sản phẩm bán chạy nhất
  // Khởi tạo dữ liệu giả lập
    const productCategories = [
    { name: "Nhẫn", value: 35, color: "#F59E0B" },
    { name: "Dây chuyền", value: 25, color: "#8B5CF6" },
    { name: "Bông tai", value: 20, color: "#EF4444" },
    { name: "Lắc tay", value: 15, color: "#10B981" },
    { name: "Khác", value: 5, color: "#6B7280" },
  ];

  useEffect(() => {
    async function fetchRevenue() {
      const res = await danhSachDonHang();
      if (res.status === "success") {
        setOrders(res.data);
        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth();

        const completedOrdersInMonth = res.data.filter(o => {
          const d = new Date(o.date);
          return (
            o.status === "Completed" &&
            d.getFullYear() === thisYear &&
            d.getMonth() === thisMonth
          );
        });

        const sum = completedOrdersInMonth.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
        setTotalRevenue(sum);
      }
    }
    fetchRevenue();
  }, []);

  // Tính số sản phẩm bán ra trong tháng này
  useEffect(() => {
    async function fetchProductSoldCount() {
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      const completedOrdersInMonth = orders.filter(order => {
        const d = new Date(order.date);
        return (
          order.status === "Completed" &&
          d.getFullYear() === thisYear &&
          d.getMonth() === thisMonth
        );
      });

      const detailResponses = await Promise.all(
        completedOrdersInMonth.map(order => getChiTietDonHang(order.id))
      );

      let totalCount = 0;
      for (const res of detailResponses) {
        if (res.status === "success") {
          for (const item of res.data) {
            totalCount += parseInt(item.SoLuong || 0);
          }
        }
      }

      setTotalSales(totalCount);
    }

    if (orders.length > 0) {
      fetchProductSoldCount();
    }
  }, [orders]);

  // Lấy danh sách đơn hàng gần đây
  useEffect(() => {
    async function fetchRecentOrders() {
      const res = await danhSachDonHang();
      if (res.status === "success") {
        const completed = res.data
          .filter(o => o.status === "Completed")
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        setRecentOrders(completed);
      }
    }

    fetchRecentOrders();
  }, []);
  
  // Lấy dữ liệu doanh thu theo tháng
    useEffect(() => {
    async function fetchSalesData() {
      const res = await danhSachDonHang();
      if (res.status === "success") {
        const now = new Date();
        const rawData = res.data.filter(o => o.status === "Completed");

        const monthMap = new Map();

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          const label = `T${date.getMonth() + 1}`;
          monthMap.set(key, { month: label, revenue: 0, orders: 0 });
        }

        rawData.forEach(order => {
          const d = new Date(order.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (monthMap.has(key)) {
            const current = monthMap.get(key);
            current.revenue += parseFloat(order.total || 0);
            current.orders += 1;
          }
        });

        const chartData = Array.from(monthMap.values());
        setSalesData(chartData);
      }
    }

    fetchSalesData();
  }, []);

  // Tính thay đổi khách hàng so với tháng trước
  useEffect(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();
    const lastMonth = new Date(thisYear, thisMonth - 1, 1);

    const thisMonthCustomers = new Set();
    const lastMonthCustomers = new Set();

    orders.forEach(o => {
      const d = new Date(o.date);
      if (o.status !== "Completed") return;
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        thisMonthCustomers.add(o.customerId);
      } else if (d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth()) {
        lastMonthCustomers.add(o.customerId);
      }
    });

    const current = thisMonthCustomers.size;
    const prev = lastMonthCustomers.size;

    setCustomerChange(prev > 0 ? ((current - prev) / prev) * 100 : 0);
  }, [orders]);

  // Tính doanh thu tháng này và thay đổi so với tháng trước
  useEffect(() => {
    async function fetchRevenueChange() {
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      let current = 0, prev = 0;

      orders.forEach(order => {
        if (order.status !== "Completed") return;
        const d = new Date(order.date);
        if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
          current += parseFloat(order.total || 0);
        } else if (d.getFullYear() === thisYear && d.getMonth() === thisMonth - 1) {
          prev += parseFloat(order.total || 0);
        }
      });

      setTotalRevenue(current);
      setRevenueChange(prev > 0 ? ((current - prev) / prev * 100) : 0);
    }

    if (orders.length > 0) fetchRevenueChange();
  }, [orders]);

  // Tính số lượng sản phẩm bán ra trong tháng này và thay đổi so với tháng trước
  useEffect(() => {
    async function fetchProductSoldCount() {
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      const completedOrdersInMonth = orders.filter(order => {
        const d = new Date(order.date);
        return (
          order.status === "Completed" &&
          d.getFullYear() === thisYear &&
          d.getMonth() === thisMonth
        );
      });

      const detailResponses = await Promise.all(
        completedOrdersInMonth.map(order => getChiTietDonHang(order.id))
      );

      let totalCount = 0;
      for (const res of detailResponses) {
        if (res.status === "success") {
          for (const item of res.data) {
            totalCount += parseInt(item.SoLuong || 0);
          }
        }
      }

      setTotalSales(totalCount);

      // Tính số lượng tháng trước để tính %
      const lastMonth = new Date(thisYear, thisMonth - 1, 1);
      const prevOrders = orders.filter(order => {
        const d = new Date(order.date);
        return (
          order.status === "Completed" &&
          d.getFullYear() === lastMonth.getFullYear() &&
          d.getMonth() === lastMonth.getMonth()
        );
      });

      let prevCount = 0;
      for (const order of prevOrders) {
        const res = await getChiTietDonHang(order.id);
        if (res.status === "success") {
          for (const item of res.data) {
            prevCount += parseInt(item.SoLuong || 0);
          }
        }
      }

      setSalesChange(prevCount > 0 ? ((totalCount - prevCount) / prevCount) * 100 : 0);
    }

    if (orders.length > 0) {
      fetchProductSoldCount();
    }
  }, [orders]);

  // Tính sản phẩm bán chạy nhất trong tháng này
  useEffect(() => {
    async function fetchBestSeller() {
      const now = new Date();
      const thisYear = now.getFullYear();
      const thisMonth = now.getMonth();

      const res = await danhSachDonHang();
      if (res.status !== "success") return;

      const completedOrders = res.data.filter(order => {
        const d = new Date(order.date);
        return (
          order.status === "Completed" &&
          d.getFullYear() === thisYear &&
          d.getMonth() === thisMonth
        );
      });

      const productSalesMap = new Map();

      for (const order of completedOrders) {
        const ctRes = await getChiTietDonHang(order.id);
        if (ctRes.status === "success") {
          for (const item of ctRes.data) {
            const { MaSP, SoLuong } = item;
            productSalesMap.set(
              MaSP,
              (productSalesMap.get(MaSP) || 0) + parseInt(SoLuong)
            );
          }
        }
      }

      if (productSalesMap.size === 0) {
        setBestSellingProduct("Không có dữ liệu");
        return;
      }

      // Tìm MaSP có tổng SoLuong cao nhất
      let topMaSP = null;
      let maxSoLuong = 0;
      for (const [MaSP, soLuong] of productSalesMap.entries()) {
        if (soLuong > maxSoLuong) {
          topMaSP = MaSP;
          maxSoLuong = soLuong;
        }
      }

      // Truy vấn tên sản phẩm từ backend
      if (topMaSP) {
        try {
          const res = await getSanPhamById(topMaSP);
          if (res.status === "success") {
            setBestSellingProduct(res.data.tenSP || `SP#${topMaSP}`);
          } else {
            setBestSellingProduct(`SP#${topMaSP}`);
          }
        } catch {
          setBestSellingProduct(`SP#${topMaSP}`);
        }
      }
    }

    fetchBestSeller();
  }, []);

  // Tạo màu ngẫu nhiên cho biểu đồ phân loại sản phẩm
  function getRandomColor() {
    const colors = ["#F59E0B", "#8B5CF6", "#EF4444", "#10B981", "#6B7280", "#3B82F6", "#D97706"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  // Lấy dữ liệu phân loại sản phẩm
  useEffect(() => {
    async function fetchCategoryStats() {
      try {
        const res = await danhSachDonHang();
        if (res.status !== "success") return;

        const completedOrders = res.data.filter(o => o.status === "Completed");

        const categoryMap = new Map();

        for (const order of completedOrders) {
          const ctRes = await getChiTietDonHang(order.id);
          if (ctRes.status === "success") {
            for (const item of ctRes.data) {
              const spRes = await getSanPhamById(item.MaSP);
              if (spRes.status === "success") {
                const sp = spRes.data;
                const maDM = sp.maDM;
                const tenDM = sp.tenDM || "Khác";

                if (!categoryMap.has(maDM)) {
                  categoryMap.set(maDM, {
                    name: tenDM,
                    value: 0,
                    color: getRandomColor(),
                  });
                }

                const current = categoryMap.get(maDM);
                current.value += parseInt(item.SoLuong);
                categoryMap.set(maDM, current);
              }
            }
          }
        }

        // Tính tổng để chuyển sang %
        const total = Array.from(categoryMap.values()).reduce((acc, c) => acc + c.value, 0);
        const result = Array.from(categoryMap.values()).map(cat => ({
          ...cat,
          value: Math.round((cat.value / total) * 100), // đổi sang %
        }));

        setCategoryData(result);
      } catch (err) {
        console.error("Lỗi khi tải phân loại sản phẩm:", err);
      }
    }

    fetchCategoryStats();
  }, []);


  const stats = [
    {
      title: "Doanh thu tháng này",
      value: totalRevenue.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      change: `${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "Sản phẩm bán ra",
      value: totalSales.toLocaleString(),
      change: `${salesChange.toFixed(1)}%`,
      trend: salesChange >= 0 ? "up" : "down",
      icon: ShoppingCart,
    },
    {
      title: "Khách hàng",
      value: new Set(orders.map(o => o.customerId)).size.toLocaleString(),
      change: `${customerChange.toFixed(1)}%`,
      trend: customerChange >= 0 ? "up" : "down",
      icon: Users,
    },
    {
      title: "Sản phẩm bán chạy nhất",
      value: bestSellingProduct,
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
                    {stat.title !== "Sản phẩm bán chạy nhất" && (
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
                    )}
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
            {recentOrders.map((order, index) => (
            <div key={index} className="order-item">
              <div className="order-info">
                <p className="order-id">#{order.id}</p>
                <p className="order-customer">{order.customer}</p>
              </div>
              <div className="order-product">
                <p className="order-product-name">
                  {order.orderCode || "Không có mã"}
                </p>
              </div>
              <div className="order-details">
                <p className="order-amount">
                  {Number(order.total).toLocaleString("vi-VN")} ₫
                </p>
                <span className="order-status status-completed">Hoàn thành</span>
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
/*
Tôi muốn ở card "Sản phẩm bán chạy" hiển thị tên của sản phẩm bán chạy nhất trong tháng này (Biết trong bảng DONHANG có lưu mã sản phẩm, có thể truy vấn tên sản phẩm từ đó). Bạn có thể sử dụng hàm getChiTietDonHang để lấy chi tiết đơn hàng và tính toán sản phẩm bán chạy nhất dựa trên số lượng đã bán. Hiện tại, tôi đã để giá trị là "N/A" và thay đổi là "0%". Bạn cần cập nhật logic để tính toán sản phẩm bán chạy nhất.
*/