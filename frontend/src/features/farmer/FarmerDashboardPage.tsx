import {
  useFarmerOrders,
  useFarmerProfile,
  useFulfilOrderItem,
} from "./data/hooks";
import { resolveApiError } from "../../api/errors";
import { useToast } from "../../components/ui/toast/ToastProvider";
import FulfilmentQueue from "./FulfilmentQueue";
import VerificationCard from "./VerificationCard";

export default function FarmerDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useFarmerProfile();
  const { data: orders, isLoading: ordersLoading } = useFarmerOrders();
  const fulfil = useFulfilOrderItem();
  const toast = useToast();

  // `pending_items` is annotated per order by the server, so the header badge is
  // a sum across the queue rather than a re-filter of the rows.
  const pendingCount =
    orders?.reduce((total, order) => total + order.pending_items, 0) ?? 0;

  function handleFulfil(itemId: number, productName: string) {
    fulfil.mutate(itemId, {
      onSuccess: () =>
        toast.success("Marked as packed", `${productName} is ready to go.`),
      onError: (error) =>
        toast.error("Could not mark as packed", resolveApiError(error).message),
    });
  }

  return (
    <main className="min-h-[calc(100dvh-4.75rem)] bg-cream">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-295 py-7 sm:w-[calc(100%-3rem)] sm:py-10">
        <header className="mb-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-harvest-500">
            Farmer workspace
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Your farm dashboard
          </h1>

          <p className="mt-2 text-sm text-muted">
            Verify your farm, pack the orders buyers place with you, and keep
            your catalogue ready.
          </p>
        </header>

        <div className="grid gap-6">
          <VerificationCard profile={profile} loading={profileLoading} />

          <FulfilmentQueue
            orders={orders}
            loading={ordersLoading}
            pendingCount={pendingCount}
            fulfilPending={fulfil.isPending}
            onFulfil={handleFulfil}
          />
        </div>
      </div>
    </main>
  );
}
