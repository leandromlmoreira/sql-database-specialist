import { useEffect } from "preact/hooks";
import { Icon } from "../Icon";

interface ToastProps {
  message: string | null;
  onDone: () => void;
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div class={message ? "toast is-visible" : "toast"} role="status" aria-live="polite">
      <Icon name="check" size={14} />
      {message}
    </div>
  );
}
