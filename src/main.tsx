import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress specific React ref warnings from third-party components
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Function components cannot be given refs') ||
     args[0].includes('forwardRef'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

createRoot(document.getElementById("root")!).render(<App />);
