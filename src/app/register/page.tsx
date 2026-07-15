"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Logo from "@/app/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agencyName: "",
    teamSize: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            agency_name: formData.agencyName,
            team_size: formData.teamSize,
          },
        },
      });

      if (authError) throw new Error(authError.message);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setSuccess(
            "Account created. Check your email to confirm, then sign in."
          );
          setLoading(false);
          return;
        }
        throw new Error(signInError.message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] placeholder-[#a1a1a6] text-[14px] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all";
  const labelClass = "block text-[12px] font-medium text-[#86868b] mb-2";

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
              Create your
              <span style={{ fontStyle: "italic" }} className="text-[#0071e3]"> memory.</span>
            </h1>
            <p className="text-[13px] text-[#86868b] mt-3">
              Free for teams up to 5. No credit card.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className={labelClass}>
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jane@agency.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="At least 6 characters"
                  className={`${inputClass} pr-12`}
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

            <div>
              <label htmlFor="reg-agency" className={labelClass}>
                Agency Name
              </label>
              <input
                id="reg-agency"
                type="text"
                required
                value={formData.agencyName}
                onChange={(e) => handleChange("agencyName", e.target.value)}
                placeholder="Smith & Co."
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-team" className={labelClass}>
                Team Size
              </label>
              <select
                id="reg-team"
                required
                value={formData.teamSize}
                onChange={(e) => handleChange("teamSize", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="" disabled>
                  Select team size
                </option>
                <option value="1-5">1-5 people</option>
                <option value="6-15">6-15 people</option>
                <option value="16-30">16-30 people</option>
                <option value="31-50">31-50 people</option>
                <option value="50+">50+ people</option>
              </select>
            </div>

            {success && (
              <div className="p-3 rounded-xl border border-[#1d8348]/20 text-[13px] text-[#1d8348] bg-[#1d8348]/[0.03]">
                {success}
              </div>
            )}

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
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#86868b]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
