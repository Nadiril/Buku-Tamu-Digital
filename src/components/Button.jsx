export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  disabled = false,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 hover:shadow-accent/30",
    secondary:
      "bg-card hover:bg-card-hover text-foreground border border-border hover:border-border-hover",
    danger:
      "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40",
    ghost: "hover:bg-card text-muted hover:text-foreground",
    success:
      "bg-success/10 hover:bg-success/20 text-success border border-success/20 hover:border-success/40",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
}
