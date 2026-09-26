import { useRef, useState } from "preact/hooks";
import { execute, type RunOutcome, type Workspace } from "../lib/engine";
import { clearHistory, loadHistory, recordHistory, type HistoryEntry } from "../lib/history";
import type { EditorHandle } from "../components/editor/SqlEditor";
import type { QueryContext } from "../components/shell/EditorPanel";

export const FREE_CONTEXT: QueryContext = {
  title: "Consulta livre",
  detail: "Escreva qualquer SQL sobre o banco selecionado. O autocomplete conhece as tabelas e colunas carregadas.",
  crumbs: ["editor"],
  kind: "free"
};

export function useSession() {
  const editor = useRef<EditorHandle | null>(null);
  const pending = useRef<string | null>(null);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [runId, setRunId] = useState(0);
  const [context, setContext] = useState<QueryContext>(FREE_CONTEXT);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  const attachEditor = (handle: EditorHandle) => {
    editor.current = handle;
    if (pending.current !== null) handle.load(pending.current);
    pending.current = null;
  };

  const loadText = (text: string) => {
    if (editor.current) editor.current.load(text);
    else pending.current = text;
  };

  const run = (workspace: Workspace, source: string, title: string) => {
    if (!source.trim()) return;
    const result = execute(workspace, source);
    setOutcome(result);
    setRunId((value) => value + 1);
    setHistory((entries) =>
      recordHistory(entries, {
        sql: source.trim(),
        workspace: workspace.spec.id,
        title,
        ok: result.error === null,
        rows: result.sets[result.sets.length - 1]?.rows.length ?? result.changes,
        ms: result.ms
      })
    );
  };

  const currentText = () => editor.current?.runnableText() ?? pending.current ?? "";

  return {
    outcome,
    runId,
    context,
    setContext,
    history,
    clear: () => setHistory(clearHistory()),
    resetOutcome: () => setOutcome(null),
    attachEditor,
    loadText,
    run,
    currentText
  };
}
