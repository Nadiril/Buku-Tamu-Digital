export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  icon,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground/80"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-xl bg-input border border-input-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/60 
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-input-focus 
            transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${error ? "border-danger focus:ring-danger/50" : ""}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  );
}
