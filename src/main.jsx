import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./styles.css";

// Static deployment must not attempt to contact the private console API.
// Components retain their error-handling paths while receiving a local response.
if (import.meta.env.VITE_DEMO_MODE !== "false") {
  window.fetch = async () => new Response(JSON.stringify({ detail: "demo mode" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
