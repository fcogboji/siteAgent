export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Shield background - dark blue */}
      <rect width="40" height="40" rx="8" fill="#2A5BA1" />
      {/* Camera body */}
      <rect
        x="10"
        y="14"
        width="20"
        height="14"
        rx="2"
        stroke="#42A5F5"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Viewfinder bump on top */}
      <rect
        x="16"
        y="8"
        width="8"
        height="6"
        rx="1"
        stroke="#42A5F5"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Lens outer ring - light blue */}
      <circle cx="20" cy="22" r="6" stroke="#6CD4F7" strokeWidth="1.5" fill="none" />
      {/* Lens inner - white */}
      <circle cx="20" cy="22" r="3.5" fill="white" />
      {/* Shutter/flash accent - orange */}
      <circle cx="28" cy="12" r="2" fill="#FF9800" />
    </svg>
  );
}
