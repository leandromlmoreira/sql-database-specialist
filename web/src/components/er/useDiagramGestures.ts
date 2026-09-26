import { useRef } from "preact/hooks";
import type { Point, Positions } from "../../lib/layout";
import { clampScale, type Viewport } from "./useViewport";

type Gesture =
  | { kind: "node"; name: string; start: Point; origin: Point; moved: boolean }
  | { kind: "pan"; start: Point; origin: Viewport; moved: boolean }
  | { kind: "pinch"; distance: number; center: Point; origin: Viewport };

interface GestureOptions {
  view: Viewport;
  setView: (view: Viewport) => void;
  positions: Positions;
  onMove: (name: string, point: Point) => void;
  onTap: (name: string | null) => void;
  onDragChange: (name: string | null) => void;
}

const TAP_TOLERANCE = 4;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function useDiagramGestures(options: GestureOptions) {
  const latest = useRef(options);
  latest.current = options;
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);

  const local = (event: PointerEvent): Point => {
    const rect = (event.currentTarget as Element).getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    gesture.current = { kind: "pinch", distance: distance(a, b), center: midpoint(a, b), origin: latest.current.view };
  };

  const onPointerDown = (event: PointerEvent) => {
    const point = local(event);
    pointers.current.set(event.pointerId, point);
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) return startPinch();
    if (pointers.current.size > 2) return;
    const name = (event.target as Element).closest<SVGGElement>("[data-table]")?.dataset.table;
    const { view, positions } = latest.current;
    gesture.current =
      name && positions[name]
        ? { kind: "node", name, start: point, origin: positions[name], moved: false }
        : { kind: "pan", start: point, origin: view, moved: false };
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = local(event);
    pointers.current.set(event.pointerId, point);
    const current = gesture.current;
    if (!current) return;
    const { view, setView, onMove, onDragChange } = latest.current;
    if (current.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      const scale = clampScale(current.origin.scale * (distance(a, b) / current.distance));
      const center = midpoint(a, b);
      const ratio = scale / current.origin.scale;
      setView({
        scale,
        x: center.x - (current.center.x - current.origin.x) * ratio,
        y: center.y - (current.center.y - current.origin.y) * ratio
      });
      return;
    }
    const dx = point.x - current.start.x;
    const dy = point.y - current.start.y;
    if (!current.moved && Math.hypot(dx, dy) < TAP_TOLERANCE) return;
    if (!current.moved && current.kind === "node") onDragChange(current.name);
    current.moved = true;
    if (current.kind === "node") {
      onMove(current.name, { x: current.origin.x + dx / view.scale, y: current.origin.y + dy / view.scale });
    } else {
      setView({ ...current.origin, x: current.origin.x + dx, y: current.origin.y + dy });
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.current.delete(event.pointerId);
    const current = gesture.current;
    if (current && current.kind !== "pinch" && !current.moved) {
      latest.current.onTap(current.kind === "node" ? current.name : null);
    }
    if (current?.kind === "node") latest.current.onDragChange(null);
    gesture.current = null;
    if (pointers.current.size === 1) {
      const [[, point]] = [...pointers.current.entries()];
      gesture.current = { kind: "pan", start: point, origin: latest.current.view, moved: true };
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
