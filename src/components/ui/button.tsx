import Link from "next/link";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-fest-gradient bg-[length:200%_200%] text-white shadow-[0_10px_40px_-12px_rgba(255,45,149,.7)] hover:bg-[position:100%_50%] hover:shadow-[0_14px_50px_-10px_rgba(0,240,255,.6)]",
  secondary: "glass text-white hover:border-neon-cyan/40 hover:bg-white/[0.07]",
  outline:
    "border border-neon-cyan/40 bg-neon-cyan/[0.04] text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 hover:shadow-neon-cyan",
  ghost: "text-white/70 hover:bg-white/[0.06] hover:text-white",
  danger: "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-full px-4 text-xs",
  md: "h-11 gap-2 rounded-full px-5 text-sm",
  lg: "h-[3.25rem] gap-2.5 rounded-full px-7 text-[15px]",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
};

const base =
  "btn-shine group relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, href, external, icon, children, disabled, ...props },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

export function IconButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-neon-cyan/40 hover:text-neon-cyan",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
