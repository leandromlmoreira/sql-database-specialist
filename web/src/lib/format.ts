import type { SqlValue } from "sql.js";

const fractionDigits = (value: SqlValue) =>
  typeof value === "number" ? (String(Number(value.toPrecision(12))).split(".")[1]?.length ?? 0) : 0;

export function columnDecimals(values: SqlValue[]): number {
  const digits = Math.max(0, ...values.map(fractionDigits));
  return digits === 0 ? 0 : Math.max(2, Math.min(digits, 4));
}

export function formatCell(value: SqlValue, decimals = 0): string {
  if (value === null) return "NULL";
  if (value instanceof Uint8Array) return `<blob ${value.length} bytes>`;
  if (typeof value === "number" && decimals > 0) return value.toFixed(decimals);
  return String(value);
}

export const isNumeric = (value: SqlValue) => typeof value === "number";

export function compareValues(a: SqlValue, b: SqlValue): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR", { numeric: true });
}

export function formatDuration(ms: number): string {
  if (ms < 1) return `${ms.toFixed(2)} ms`;
  if (ms < 100) return `${ms.toFixed(1)} ms`;
  return `${Math.round(ms)} ms`;
}

export const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto", style: "short" });

export function timeAgo(at: number, now = Date.now()): string {
  const seconds = Math.round((at - now) / 1000);
  if (Math.abs(seconds) < 45) return "agora";
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}
