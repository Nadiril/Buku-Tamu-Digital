export default function StatCard({ title, value, icon, trend, color = "accent" }) {
  const colorMap = {
    accent: {
      bg: "bg-accent-muted",
      icon: "text-accent",
      glow: "glow-accent",
    },
    success: {
      bg: "bg-success-muted",
      icon: "text-success",
      glow: "glow-success",
    },
    warning: {
      bg: "bg-warning-muted",
      icon: "text-warning",
      glow: "",
    },
    info: {
      bg: "bg-info-muted",
      icon: "text-info",
      glow: "",
    },
  };

  const c = colorMap[color] || colorMap.accent;

  return (
    <div
      className={`glass-card rounded-2xl p-5 hover:border-border-hover transition-all duration-300 group ${c.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {trend}
            </p>
          )}
        </div>
        <div
          className={`${c.bg} ${c.icon} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
