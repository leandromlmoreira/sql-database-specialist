export interface HistoryEntry {
  id: string;
  sql: string;
  workspace: string;
  title: string;
  at: number;
  ok: boolean;
  rows: number;
  ms: number;
}

const KEY = "sql-lab:history";
const LIMIT = 40;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    return;
  }
}

export function recordHistory(entries: HistoryEntry[], entry: Omit<HistoryEntry, "id" | "at">): HistoryEntry[] {
  const withoutDuplicate = entries.filter(
    (item) => !(item.sql.trim() === entry.sql.trim() && item.workspace === entry.workspace)
  );
  const next = [{ ...entry, id: crypto.randomUUID(), at: Date.now() }, ...withoutDuplicate].slice(0, LIMIT);
  persist(next);
  return next;
}

export function clearHistory(): HistoryEntry[] {
  persist([]);
  return [];
}
