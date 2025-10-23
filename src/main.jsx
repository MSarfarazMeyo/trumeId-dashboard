import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import { ReactQueryProvider } from "./lib/queryClient";
import { AppStateContext } from "./context/AppStateContext";
import "@ant-design/v5-patch-for-react-19";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ReactQueryProvider>
        <AppStateContext>
          <App />
        </AppStateContext>
      </ReactQueryProvider>
    </BrowserRouter>
  </StrictMode>
);
