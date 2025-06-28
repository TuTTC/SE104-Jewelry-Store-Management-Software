// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Auth from "./pages/auth/Auth";
import PrivateRoute from "./routes/PrivateRoute";
import AdminLayout from "./Layouts/AdminLayout";

import Dashboard from "./pages/Dashboard";
import AccountManager from "./pages/AccountManager";
import ProductManager from "./pages/ProductManager";
import CategoryManager from "./pages/CategoryManager";
import OrderManager from "./pages/OrderManager";
import ServiceManager from "./pages/ServiceManager";
import PurchaseOrderManager from "./pages/PurchaseOrderManager";
import SupplierManager from "./pages/SupplierManager";
import InventoryManager from "./pages/InventoryManager";
import ReportDashboard from "./pages/ReportDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />

        {/* Public route */}
        <Route
          path="/login"
          element={
            <Auth
              onAuthSuccess={() => {
                window.location.href = "/admin/dashboard";
              }}
            />
          }
        />


        {/* Protected admin route */}
        <Route path="/admin" element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="services" element={<ServiceManager />} />
            <Route path="purchaseOrders" element={<PurchaseOrderManager />} />
            <Route path="suppliers" element={<SupplierManager />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="reports" element={<ReportDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
