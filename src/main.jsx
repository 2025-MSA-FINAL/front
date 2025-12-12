// src/main.jsx
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { initTheme } from "./theme";




import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


initTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  </BrowserRouter>
);
