import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ui/toast/ToastProvider";
import { queryClient } from "./api/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Header />

              <main className="flex-1">
                <AppRoutes />
              </main>

              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}