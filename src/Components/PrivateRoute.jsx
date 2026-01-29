import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const user = localStorage.getItem("EventHub");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
export default PrivateRoute;
