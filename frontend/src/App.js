import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Auth from './pages/auth/Auth';
import PrivateRoute from './routes/PrivateRoute';
import AdminLayout from './Layouts/AdminLayout';

import Dashboard from './pages/Dashboard';
import AccountManager from './pages/AccountManager';
import ProductManager from './pages/ProductManager';
import CategoryManager from './pages/CategoryManager';
import OrderManager from './pages/OrderManager';
import ServiceManager from './pages/ServiceManager';
import PurchaseOrderManager from './pages/PurchaseOrderManager';
import SupplierManager from './pages/SupplierManager';
import InventoryManager from './pages/InventoryManager';
import ReportDashboard from './pages/ReportDashboard';
import PurchaseOrderDetails from './pages/PurchaseOrderDetails';
import ServiceDetails from './pages/ServiceDetails';
import IntroPage from './pages/IntroPage';
import ParameterManager from 'pages/ParameterManager';
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Auth />} />
        
        <Route path="/admin" element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="accounts" element={<AccountManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="services" element={<ServiceManager />} />
            <Route path="purchaseOrders" element={<PurchaseOrderManager />} />
            <Route path="purchaseOrderDetails" element={<PurchaseOrderDetails />} />
            <Route path="serviceDetails" element={<ServiceDetails />} />
            <Route path="suppliers" element={<SupplierManager />} />
            <Route path="inventory" element={<InventoryManager />} />
            <Route path="reports" element={<ReportDashboard />} />
            <Route path="parameter" element={<ParameterManager />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
