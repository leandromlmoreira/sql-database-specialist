import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { Bounds } from "../../lib/layout";

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.2;

export const clampScale = (scale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

export function zoomAround(view: Viewport, factor: number, anchorX: number, anchorY: number): Viewport {
  const scale = clampScale(view.scale * factor);
  const ratio = scale / view.scale;
  return { scale, x: anchorX - (anchorX - view.x) * ratio, y: anchorY - (anchorY - view.y) * ratio };
}

export function useViewport() {
  const frame = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0022));
      setView((current) => zoomAround(current, factor, event.clientX - rect.left, event.clientY - rect.top));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const fit = useCallback(
    (bounds: Bounds) => {
      if (size.width === 0 || size.height === 0) return;
      const side = size.width < 520 ? 16 : 40;
      const top = 56;
      const bottom = 68;
      const available = { width: size.width - side * 2, height: size.height - top - bottom };
      const scale = clampScale(Math.min(1.05, available.width / bounds.width, available.height / bounds.height));
      setView({
        scale,
        x: side + (available.width - bounds.width * scale) / 2 - bounds.x * scale,
        y: top + (available.height - bounds.height * scale) / 2 - bounds.y * scale
      });
    },
    [size.width, size.height]
  );

  const zoomBy = (factor: number) => setView((current) => zoomAround(current, factor, size.width / 2, size.height / 2));

  return { frame, view, setView, size, fit, zoomBy };
}
