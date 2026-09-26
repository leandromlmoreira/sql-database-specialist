const isApple = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const display = (key: string) => {
  if (key === "Ctrl" && isApple) return "⌘";
  if (key === "Enter") return "↵";
  return key;
};

export function Kbd({ keys }: { keys: string[] }) {
  return (
    <span class="kbd-group">
      {keys.map((key) => (
        <kbd key={key}>{display(key)}</kbd>
      ))}
    </span>
  );
}
