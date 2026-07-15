"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Logo from "@/app/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password.");
        }
        throw new Error(authError.message);
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div>
        <label
          htmlFor="login-email"
          className="block text-[12px] font-medium text-[#86868b] mb-2"
        >
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@agency.com"
          className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] placeholder-[#a1a1a6] text-[14px] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-[12px] font-medium text-[#86868b] mb-2"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 pr-12 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] placeholder-[#a1a1a6] text-[14px] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-[#c0392b]/20 text-[13px] text-[#c0392b] bg-[#c0392b]/[0.03]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-full bg-[#1d1d1f] text-white text-[14px] font-medium hover:bg-[#2d2d2f] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-12"
          >
            <ArrowLeft size={13} />
            Back home
          </Link>

          <div className="mb-12">
            <Logo size="lg" variant="stacked" />
            <h1 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f] mt-10 leading-[1.0]">
              Welcome
              <span style={{ fontStyle: "italic" }} className="text-[#86868b]"> back.</span>
            </h1>
            <p className="text-[13px] text-[#86868b] mt-3">
              Sign in to access your agency memory.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <Loader2 size={16} className="animate-spin text-[#86868b]" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-[13px] text-[#86868b]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
