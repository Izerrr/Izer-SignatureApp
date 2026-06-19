import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import SignaturePage from "./pages/SignaturePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* HashRouter avoids needing server-side rewrite rules on GitHub Pages */}
    <HashRouter>
      <Routes>
        <Route path="/" element={<SignaturePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
