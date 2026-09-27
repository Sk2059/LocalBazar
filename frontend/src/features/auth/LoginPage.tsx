import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import apiClient from "../../api/apiClient";
import { setTokens } from "../../api/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function inputClass(hasError: boolean) {
  return `
    w-full rounded-xl border bg-[#FAFAF8]
    py-3 pr-4 text-sm text-ink
    outline-none transition
    placeholder:text-[#B5B6AF]
    focus:border-forest-600
    focus:ring-4 focus:ring-forest-600/10
    ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
        : "border-[#E0DDD6]"
    }
  `;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold tracking-wide text-[#3D4039]">
        {label}
      </label>

      <div className="relative">{children}</div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.21Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.11-1.08.31-1.59V7.89H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.11l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.71 5.39l3.25 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await apiClient.post("/auth/login/", values);
      setTokens(data.access, data.refresh);

      const roleDestination =
        data.user.role === "admin"
          ? "/admin"
          : data.user.role === "farmer"
            ? "/farmer/dashboard"
            : "/buyer/dashboard";

      // `next` is set by the 401 interceptor when a signed-out visitor lands on
      // a buyer page. Only honour it for local buyer paths on a buyer account;
      // anything else falls back to the role dashboard.
      const next = searchParams.get("next");
      const destination =
        next &&
        next.startsWith("/") &&
        next !== "/login" &&
        data.user.role === "buyer"
          ? next
          : roleDestination;

      navigate(destination);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.non_field_errors?.[0] ??
          error.response?.data?.detail
        : undefined;
      setError("root", {
        message: message ?? "Unable to sign in. Please try again.",
      });
    }
  };

  return (
    <main className="h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#FAF8F3]">
      <div className="relative flex h-full overflow-hidden">

        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#EAF2E7] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-[#F5E8C7]/40 blur-3xl" />
        </div>

        {/* =====================================================
            LEFT BRAND PANEL
        ===================================================== */}
        <section className="relative hidden h-full overflow-hidden bg-forest-800 lg:flex lg:w-[47%] xl:w-[48%]">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          {/* Decorative circles */}
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#6FA45F]/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-harvest-500/10 blur-3xl" />

          <div className="absolute -right-32 top-1/4 size-96 rounded-full border border-white/10" />

          <div className="absolute -right-20 top-[30%] size-72 rounded-full border border-white/[0.07]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-8 xl:px-14">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white text-forest-800 shadow-xl">
                <Leaf size={19} strokeWidth={2.3} />
              </div>

              <div>
                <p className="font-display text-lg font-semibold tracking-tight text-white">
                  Koshi Bazaar
                </p>

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/50">
                  Local Farmers Marketplace
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="my-auto max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-semibold text-white/70 backdrop-blur">
                <Sparkles size={12} className="text-harvest-500" />
                Fresh from Koshi Province
              </div>

              <h1 className="max-w-lg font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white xl:text-5xl">
                Fresh food.
                <span className="block text-harvest-500">
                  Local people.
                </span>
                Real connection.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                Discover fresh produce directly from local farmers and
                build a stronger connection with the food you bring home.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Fresh produce from local farms",
                  "Transparent and fair pricing",
                  "Supporting farmers across Koshi",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/75"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-white/10">
                      <Check size={13} strokeWidth={2.5} />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-2.5 border-t border-white/10 pt-5">
              <ShieldCheck
                size={16}
                className="text-harvest-500"
              />

              <p className="text-[10px] leading-5 text-white/45">
                A trusted local marketplace connecting buyers with
                farmers.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOGIN PANEL
        ===================================================== */}
        <section className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-6 sm:px-8 lg:w-[53%] lg:py-4 xl:w-[52%]">

          <div className="w-full max-w-110">

            {/* Mobile brand */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <div className="grid size-10 place-items-center rounded-xl bg-forest-700 text-white shadow-lg">
                <Leaf size={18} />
              </div>

              <div>
                <p className="font-display text-[15px] font-semibold text-forest-800">
                  Koshi Bazaar
                </p>

                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#999A94]">
                  Local Farmers Marketplace
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-700">
                Welcome back
              </p>

              <h2 className="font-display text-3xl font-semibold tracking-tight text-[#182719]">
                Sign in to your account.
              </h2>

              <p className="mt-1.5 text-sm text-[#787871]">
                Continue shopping fresh and local.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-6 shadow-[0_20px_60px_rgba(30,50,30,0.08)] sm:p-7">

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {errors.root && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    {errors.root.message}
                  </p>
                )}

                <Field
                  label="Email address"
                  error={errors.email?.message}
                >
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  />

                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`${inputClass(
                      !!errors.email
                    )} pl-10`}
                  />
                </Field>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold tracking-wide text-[#3D4039]">
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-semibold text-forest-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                    />

                    <input
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`${inputClass(
                        !!errors.password
                      )} pl-10 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPass((value) => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96] transition hover:text-ink"
                      aria-label={
                        showPass
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPass ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-[11px] font-medium text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-[#EEEAE3]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AEADA8]">
                  or
                </span>

                <span className="h-px flex-1 bg-[#EEEAE3]" />
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E0DDD6] bg-white py-3 text-sm font-semibold text-[#34372F] transition hover:border-[#D2CFC6] hover:bg-[#FAF9F6]"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="mt-5 text-center text-xs text-[#787871]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-forest-700 hover:underline"
                >
                  Create one free
                </Link>
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#9A9B94]">
              <ShieldCheck size={13} />
              Your information is securely protected
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}