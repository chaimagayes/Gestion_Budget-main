import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./Dashboard/dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;

