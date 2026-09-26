export function Logo() {
  return (
    <svg class="logo" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" class="logo-tile" />
      <ellipse cx="16" cy="10" rx="7.5" ry="2.8" class="logo-top" />
      <path d="M8.5 10v5.6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8V10" class="logo-mid" />
      <path d="M8.5 15.6v5.6c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-5.6" class="logo-base" />
    </svg>
  );
}
