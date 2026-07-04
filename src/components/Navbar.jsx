export default function Navbar({ title, subtitle, actions }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 pl-14 lg:pl-4">
        <div>
          <h1 className="text-base font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
