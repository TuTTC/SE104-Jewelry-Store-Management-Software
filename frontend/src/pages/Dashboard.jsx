// src/pages/Dashboard.jsx
import React from "react";
import {
  ShoppingCart,
  Gem
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const mockData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 7000 },
];

function Dashboard() {
  const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSales = 123; // Dữ liệu mock tạm thời

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="card">
          <div className="card-content">
            <p className="card-label">Tổng doanh thu</p>
            <p className="card-value">${totalRevenue.toLocaleString()}</p>
            <div className="card-icon">
              <ShoppingCart className="icon" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <p className="card-label">Số lượng bán ra</p>
            <p className="card-value">{totalSales}</p>
            <div className="card-icon">
              <Gem className="icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Tổng quan doanh thu</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666' }} tickFormatter={(value) => `$${value}`} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#c1a47e" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
