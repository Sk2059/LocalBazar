import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal, dependency-free toast notifications.
 *
 * Rendered once by {@link ToastProvider} as a fixed stack; the rest of the app
 * calls `const toast = useToast()` and fires `toast.success(...)`,
 * `toast.error(...)` or `toast.info(...)`.
 */

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 5_000;

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-forest-600",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-500",
  },
  info: {
    icon: Info,
    iconClass: "text-forest-600",
  },
};

let toastSequence = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = ++toastSequence;
      setToasts((current) => [...current, { id, title, description, variant }]);

      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-100 flex flex-col items-center gap-2.5 px-4 py-4 sm:items-end sm:pr-6 sm:pt-20"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const { icon: Icon, iconClass } = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm animate-[fadeUp_0.25s_ease-out] items-start gap-3 rounded-2xl border border-[#E4E1DA] bg-white p-3.5 shadow-[0_14px_40px_rgba(28,43,25,0.14)]"
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${iconClass}`} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{toast.title}</p>

        {toast.description && (
          <p className="mt-0.5 text-xs leading-5 text-muted">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const api = useContext(ToastContext);

  if (!api) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return api;
}
