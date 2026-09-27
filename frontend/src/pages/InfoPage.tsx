import { Link, useLocation } from "react-router-dom";
import Container from "../components/common/Container";

const pageContent: Record<string, { title: string; description: string }> = {
  "/how-it-works": {
    title: "How Koshi Bazaar works",
    description: "Discover local produce, add it to your cart, and receive fresh harvests from verified farmers in Koshi Province.",
  },
  "/orders": {
    title: "Your orders",
    description: "Your completed orders will appear here after checkout.",
  },
  "/profile": {
    title: "Your account",
    description: "Manage your Koshi Bazaar account and delivery preferences here.",
  },
  "/help": {
    title: "Help and support",
    description: "Need help with an order? Contact hello@koshibazaar.com and our team will help you.",
  },
  "/privacy": {
    title: "Privacy policy",
    description: "We use your information only to provide a reliable local marketplace experience.",
  },
  "/terms": {
    title: "Terms and conditions",
    description: "Koshi Bazaar connects buyers and local farmers for direct produce orders.",
  },
  "/forgot-password": {
    title: "Reset your password",
    description: "Password reset is not connected yet. Contact support for help accessing your account.",
  },
};

export default function InfoPage() {
  const { pathname } = useLocation();
  const content = pageContent[pathname] ?? {
    title: "Koshi Bazaar",
    description: "Fresh produce from local farmers across Koshi Province.",
  };

  return (
    <div className="min-h-[calc(100dvh-4.75rem)] bg-[#FAF8F3]">
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#E5E2DA] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest-700">Koshi Bazaar</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{content.title}</h1>
          <p className="mt-4 text-sm leading-7 text-muted">{content.description}</p>
          <Link to="/marketplace" className="mt-7 inline-flex rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-800">
            Browse marketplace
          </Link>
        </div>
      </Container>
    </div>
  );
}
