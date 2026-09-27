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
  User,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { register as registerAccount } from "./data/api";
import { fieldMessage, resolveApiError } from "../../api/errors";
import { setTokens } from "../../api/auth";

const schema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function inputClass(error: boolean) {
  return `
    w-full rounded-xl border bg-[#FAFAF8]
    py-2.5 pr-4 text-sm text-ink
    outline-none transition-all
    placeholder:text-[#B5B6AF]
    focus:border-forest-600
    focus:ring-4 focus:ring-forest-600/10
    ${
      error
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
      <label className="mb-1 block text-[11px] font-bold text-[#3D4039]">
        {label}
      </label>

      <div className="relative">{children}</div>

      {error && (
        <p className="mt-1 text-[10px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
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

function passwordScore(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formError, setFormError] = useState("");

  // `/signup` creates a buyer; `/farmer/register` reuses this page for the
  // farmer flow. The role is fixed by the URL, never by user input, so it
  // can't be tampered with client-side.
  const { pathname } = useLocation();
  const role = pathname.startsWith("/farmer") ? "farmer" : "buyer";

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = watch("password", "");

  const strength = useMemo(
    () => passwordScore(password),
    [password]
  );

  const onSubmit = async (values: FormValues) => {
    setFormError("");

    try {
      const { access, refresh } = await registerAccount({
        name: values.fullName,
        email: values.email,
        password: values.password,
        role,
      });

      // The response carries a token pair, so the new account is signed in
      // immediately — no second login hop.
      setTokens(access, refresh);

      // A buyer is ready to shop; a farmer still has to clear verification
      // before they can list anything, so send them to the dashboard that
      // hosts the application form.
      navigate(role === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard", {
        replace: true,
      });
    } catch (error) {
      const emailError = fieldMessage(error, "email");
      if (emailError) {
        setError("email", { message: emailError });
        return;
      }

      const passwordError = fieldMessage(error, "password");
      if (passwordError) {
        setError("password", { message: passwordError });
        return;
      }

      setFormError(resolveApiError(error).message);
    }
  };

  return (
    <main className="h-[calc(100dvh-4.5rem)] min-h-0 overflow-hidden bg-[#FAF8F3]">
      <div className="relative flex h-full overflow-hidden">

        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 size-96 rounded-full bg-[#EAF2E7] blur-3xl" />

          <div className="absolute -bottom-40 -left-32 size-96 rounded-full bg-[#F5E8C7]/40 blur-3xl" />
        </div>

        {/* LEFT PANEL */}
        <section className="relative hidden h-full overflow-hidden bg-forest-800 lg:flex lg:w-[47%] xl:w-[48%]">

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="absolute -right-32 -top-24 size-120 rounded-full bg-[#6FA45F]/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-harvest-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-8 xl:px-14">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white text-forest-800 shadow-xl">
                <Leaf size={19} />
              </div>

              <div>
                <p className="font-display text-lg font-semibold text-white">
                  Koshi Bazaar
                </p>

                <p className="text-[9px] uppercase tracking-[0.18em] text-white/50">
                  Local Farmers Marketplace
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="my-auto max-w-lg">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-semibold text-white/70">
                <Sparkles size={12} className="text-[#E5B73A]" />
                Grow local. Shop local.
              </div>

              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Fresh food starts
                <span className="block text-[#E5B73A]">
                  with real farmers.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
                Join Koshi Bazaar and discover fresh produce while
                supporting farmers across Koshi Province.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Shop directly from local farmers",
                  "Discover fresh seasonal produce",
                  "Support your local agricultural community",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-xs text-white/75"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-white/10">
                      <Check size={12} />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-5">
              <ShieldCheck size={15} className="text-[#E5B73A]" />

              <p className="text-[10px] text-white/45">
                Join a marketplace built for Koshi's farmers and buyers.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT SIGNUP PANEL */}
        <section className="relative z-10 flex h-full w-full items-center justify-center overflow-y-auto px-4 py-5 sm:px-8 lg:w-[53%] xl:w-[52%]">

          <div className="w-full max-w-112.5">

            {/* Mobile brand */}
            <div className="mb-4 flex items-center justify-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-forest-700 text-white">
                <Leaf size={18} />
              </span>

              <div>
                <p className="font-display text-[15px] font-semibold text-forest-800">
                  Koshi Bazaar
                </p>

                <p className="text-[9px] uppercase tracking-[0.14em] text-[#999A94]">
                  Local Farmers Marketplace
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-700">
                {role === "farmer"
                  ? "Join as a farmer"
                  : "Join the marketplace"}
              </p>

              <h1 className="font-display text-3xl font-semibold tracking-tight text-[#182719]">
                {role === "farmer"
                  ? "Create your farm account."
                  : "Create your account."}
              </h1>

              <p className="mt-1 text-sm text-[#787871]">
                {role === "farmer"
                  ? "You can list produce once your farm is verified."
                  : "Start shopping fresh from local farms."}
              </p>
            </div>

            {/* FORM CARD */}
            <div className="rounded-3xl border border-[#E5E2DA] bg-white p-5 shadow-[0_20px_60px_rgba(30,50,30,0.08)] sm:p-6">

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3"
                noValidate
              >
                {formError && (
                  <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[11px] font-medium text-red-600">
                    {formError}
                  </p>
                )}

                {/* Full name */}
                <Field
                  label="Full name"
                  error={errors.fullName?.message}
                >
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  />

                  <input
                    type="text"
                    placeholder="Ramesh Kumar"
                    autoComplete="name"
                    {...register("fullName")}
                    className={`${inputClass(
                      !!errors.fullName
                    )} pl-10`}
                  />
                </Field>

                {/* Email */}
                <Field
                  label="Email address"
                  error={errors.email?.message}
                >
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={`${inputClass(
                      !!errors.email
                    )} pl-10`}
                  />
                </Field>

                {/* Password */}
                <Field
                  label="Password"
                  error={errors.password?.message}
                >
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  />

                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Create password"
                    autoComplete="new-password"
                    {...register("password")}
                    className={`${inputClass(
                      !!errors.password
                    )} pl-10 pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPass((value) => !value)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  >
                    {showPass ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </Field>

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="-mt-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[9px] text-[#999A94]">
                        Password strength
                      </span>

                      <span className="text-[9px] font-bold text-forest-700">
                        {strength === 1
                          ? "Weak"
                          : strength === 2
                            ? "Fair"
                            : strength === 3
                              ? "Good"
                              : "Strong"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className={`h-1 rounded-full ${
                            level <= strength
                              ? "bg-forest-600"
                              : "bg-[#E9E7E1]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm password */}
                <Field
                  label="Confirm password"
                  error={errors.confirmPassword?.message}
                >
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  />

                  <input
                    type={
                      showConfirmPass
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`${inputClass(
                      !!errors.confirmPassword
                    )} pl-10 pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPass(
                        (value) => !value
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9B9D96]"
                  >
                    {showConfirmPass ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </Field>

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      {...register("terms")}
                      className="mt-0.5 size-3.5 accent-forest-700"
                    />

                    <span className="text-[10px] leading-4 text-[#777871]">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="font-semibold text-forest-700 hover:underline"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="font-semibold text-forest-700 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {errors.terms && (
                    <p className="mt-1 text-[10px] text-red-500">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3 text-sm font-bold text-white shadow-lg shadow-forest-700/20 transition hover:-translate-y-0.5 hover:bg-forest-800 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-[#EEEAE3]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#AEADA8]">
                  or
                </span>

                <span className="h-px flex-1 bg-[#EEEAE3]" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E0DDD6] bg-white py-2.5 text-xs font-semibold text-[#34372F] transition hover:bg-[#FAF9F6]"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="mt-4 text-center text-xs text-[#787871]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-forest-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}