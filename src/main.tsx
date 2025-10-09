import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Mock API disabled - using real backend
// import { initMockApi } from "./lib/api/mockApi";
// initMockApi();

console.log('Rendering app...');
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
