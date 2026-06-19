import { useState } from "react";

export default function FloatingInput({ label, value, onChange, name, maxLength = 40 }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full bg-transparent border-b border-hairline pb-2 pt-5 text-[15px]
                   text-ink placeholder-transparent outline-none transition-colors duration-200
                   focus:border-moss"
        autoComplete="off"
      />
      <label
        htmlFor={name}
        className={`absolute left-0 transition-all duration-200 ease-out pointer-events-none
          ${floated ? "top-0 text-[11px] tracking-wide text-muted" : "top-5 text-[15px] text-muted"}`}
      >
        {label}
      </label>
      <span
        className="absolute left-0 bottom-0 h-px bg-moss transition-all duration-300 ease-out"
        style={{ width: focused ? "100%" : "0%" }}
      />
    </div>
  );
}
