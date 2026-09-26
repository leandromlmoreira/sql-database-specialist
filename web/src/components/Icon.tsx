const PATHS = {
  play: "M7 5.5v13l11-6.5z",
  database:
    "M4 6.5c0-1.9 3.6-3.5 8-3.5s8 1.6 8 3.5S16.4 10 12 10 4 8.4 4 6.5zM4 6.5v5.5c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5V6.5M4 12v5.5C4 19.4 7.6 21 12 21s8-1.6 8-3.5V12",
  table: "M4 5h16v14H4zM4 10h16M4 14.5h16M10 10v9",
  view: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  key: "M14.5 9.5a4 4 0 1 1-3 3.9L4 20.9V17h3v-3h3l1.5-1.5M16.5 7.5h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  history: "M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5M12 8v4.5l3 2",
  diagram: "M3.5 4.5h7v5h-7zM13.5 14.5h7v5h-7zM7 9.5v4a1.5 1.5 0 0 0 1.5 1.5h5M17 14.5V11",
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  reset: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9M4.5 4.5V9H9",
  github:
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  chevron: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  shuffle: "M4 7h3.5c4.5 0 4.5 10 9 10H20M4 17h3.5c1.4 0 2.3-.9 3-2.2M13.5 9.2c.7-1.3 1.6-2.2 3-2.2H20M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  rows: "M4 6h16M4 12h16M4 18h16",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 9v4.5M12 17h.01M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  code: "M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  trash: "M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5",
  bolt: "M13 3 5 13.5h6L10 21l8-10.5h-6z",
  file: "M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8zM14 3.5V8h4.5",
  sort: "M8 5v14M8 19l-3-3M8 19l3-3M16 19V5M16 5l-3 3M16 5l3 3",
  arrowUp: "M12 19V5M6.5 10.5 12 5l5.5 5.5",
  arrowDown: "M12 5v14M6.5 13.5 12 19l5.5-5.5",
  layers: "M12 3.5 3 8.5l9 5 9-5zM3 13l9 5 9-5",
  terminal: "M4 5.5h16v13H4zM7.5 10l2.5 2-2.5 2M12.5 14.5h4"
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  class?: string;
  filled?: boolean;
}

export function Icon({ name, size = 16, class: className, filled = false }: IconProps) {
  return (
    <svg
      class={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
