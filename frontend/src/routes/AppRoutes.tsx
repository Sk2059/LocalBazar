import {
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "../features/buyer/home/HomePage";
import MarketplacePage from "../features/buyer/marketplace/MarketplacePage";
import ProductDetailPage from "../features/buyer/product/ProductDetailPage";
import FarmersPage from "../features/buyer/farmers/FarmersPage";
import FarmerDetail from "../features/buyer/farmers/FarmerDetail";
import CartPage from "../features/buyer/cart/CartPage";
import CheckoutPage from "../features/buyer/checkout/CheckoutPage";
import OrdersPage from "../features/buyer/orders/OrdersPage";
import OrderDetailPage from "../features/buyer/orders/OrderDetailPage";
import KhaltiVerifyPage from "../features/buyer/payments/KhaltiVerifyPage";
import PaymentResultPage from "../features/buyer/payments/PaymentResultPage";
import LoginPage from "../features/auth/LoginPage";
import FarmerApplicationSubmittedPage from "../features/auth/FarmerApplicationSubmittedPage";
import RoleSelectionPage from "../features/auth/RoleSelectionPage";
import SignupPage from "../features/auth/SignupPage";
import InfoPage from "../pages/InfoPage";
import AccountDashboardPage from "../pages/AccountDashboardPage";
import NotFound from "../pages/NotFound";
import RequireAuth, { RequireRole } from "../components/common/RequireAuth";
import FarmerDashboardPage from "../features/farmer/FarmerDashboardPage";
import AdminConsolePage from "../features/admin/AdminConsolePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/product/:slug" element={<ProductDetailPage />} />
      <Route path="/farmers" element={<FarmersPage />} />
      <Route path="/farmers/:farmerId" element={<FarmerDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route
        path="/checkout"
        element={(
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/orders"
        element={(
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        )}
      />
      <Route
        path="/orders/:orderId"
        element={(
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        )}
      />
      {/*
        The Khalti hosted-page stand-in. Reachable straight after checkout, so
        it stays public: an anonymous hit simply fails the verify call and the
        API client sends the visitor to sign in.
      */}
      <Route
        path="/payment-verify"
        element={<KhaltiVerifyPage />}
      />
      {/*
        Post-payment landing page. Deliberately public so a buyer can return to
        it from an email or a gateway callback; the outcome it renders is read
        from the fetched order, never from the URL.
      */}
      <Route
        path="/payment-result"
        element={<PaymentResultPage />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/choose-role" element={<RoleSelectionPage />} />
      <Route
        path="/farmer/application-submitted"
        element={<FarmerApplicationSubmittedPage />}
      />
      <Route path="/farmer/register" element={<SignupPage />} />
      <Route path="/farmer/login" element={<LoginPage />} />
      <Route path="/buyer/dashboard" element={<AccountDashboardPage role="buyer" />} />
      <Route
        path="/farmer/dashboard"
        element={
          <RequireRole role={["farmer"]}>
            <FarmerDashboardPage />
          </RequireRole>
        }
      />
      {/*
        The admin console lives at one URL now; the old placeholder sub-routes
        (buyers/farmers/products/categories) were never implemented, and the
        console covers all four as tabs.
      */}
      <Route
        path="/admin"
        element={
          <RequireRole role={["admin"]}>
            <AdminConsolePage />
          </RequireRole>
        }
      />

      <Route path="/how-it-works" element={<InfoPage />} />
      <Route path="/profile" element={<InfoPage />} />
      <Route path="/help" element={<InfoPage />} />
      <Route path="/privacy" element={<InfoPage />} />
      <Route path="/terms" element={<InfoPage />} />
      <Route path="/forgot-password" element={<InfoPage />} />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}