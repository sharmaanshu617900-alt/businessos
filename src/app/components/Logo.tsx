"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "inline" | "stacked";
  showText?: boolean;
}

const SIZES = {
  sm: { icon: 28, text: "text-[15px]", sub: "text-[10px]" },
  md: { icon: 34, text: "text-[17px]", sub: "text-[12px]" },
  lg: { icon: 48, text: "text-[21px]", sub: "text-[14px]" },
};

export default function Logo({ size = "sm", variant = "inline", showText = true }: LogoProps) {
  const s = SIZES[size];
  return (
    <div className="flex items-center gap-2.5">
      {/* Premium brain-circuit icon */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" className="shrink-0">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGrad)" />
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoShine)" opacity="0.3" />
        {/* Neural core */}
        <circle cx="16" cy="16" r="4" fill="white" opacity="0.95" />
        {/* Connection lines */}
        <path d="M10 10 L13 13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M22 10 L19 13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M10 22 L13 19" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M22 22 L19 19" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        {/* Nodes */}
        <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.8" />
        <circle cx="22" cy="10" r="1.5" fill="white" opacity="0.8" />
        <circle cx="10" cy="22" r="1.5" fill="white" opacity="0.8" />
        <circle cx="22" cy="22" r="1.5" fill="white" opacity="0.8" />
        <circle cx="16" cy="8" r="1.2" fill="white" opacity="0.6" />
        <circle cx="16" cy="24" r="1.2" fill="white" opacity="0.6" />
        <circle cx="8" cy="16" r="1.2" fill="white" opacity="0.6" />
        <circle cx="24" cy="16" r="1.2" fill="white" opacity="0.6" />
        <defs>
          <linearGradient id="logoGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3A5F" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="logoShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {showText && variant === "inline" && (
        <span className={`${s.text} font-semibold tracking-[-0.3px] text-gray-900`}>
          Meeting<span className="text-blue-600">OS</span>
        </span>
      )}
      {showText && variant === "stacked" && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-semibold text-gray-900`}>Meeting</span>
          <span className={`${s.sub} font-semibold text-blue-600 -mt-0.5`}>OS</span>
        </div>
      )}
    </div>
  );
}
