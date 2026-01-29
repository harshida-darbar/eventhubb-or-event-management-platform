import React from "react";
import Dashboard from "./Dashboard";
import OrganizerDashboard from "./OrganizerDashboard";
import Admin from "./Admin";

const MainDashboard = () => {
  const userData = JSON.parse(localStorage.getItem("EventHub"));

  const role = userData.role;

  return <div>{role === 2 ? <Dashboard /> : role === 1 ? <OrganizerDashboard /> :  <Admin/> }</div>;
};

export default MainDashboard;
