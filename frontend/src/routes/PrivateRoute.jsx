// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token"); // Hoặc check từ context

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
