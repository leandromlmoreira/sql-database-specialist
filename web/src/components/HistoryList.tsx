import type { HistoryEntry } from "../lib/history";
import { formatDuration, plural, timeAgo } from "../lib/format";
import { Icon } from "./Icon";

interface HistoryListProps {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onClear: () => void;
}

const preview = (sql: string) => sql.replace(/\s+/g, " ").trim();

export function HistoryList({ entries, onOpen, onClear }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <div class="state state-idle">
        <span class="command-icon is-muted">
          <Icon name="history" size={20} />
        </span>
        <h3>Nenhuma consulta ainda</h3>
        <p>Tudo o que você executar fica salvo aqui, neste navegador, para reabrir com um clique.</p>
      </div>
    );
  }
  return (
    <div class="history">
      <div class="history-head">
        <span>{plural(entries.length, "consulta salva neste navegador", "consultas salvas neste navegador")}</span>
        <button type="button" class="btn btn-ghost btn-sm" onClick={onClear}>
          <Icon name="trash" size={14} />
          Limpar
        </button>
      </div>
      <ol class="history-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button type="button" class="history-item" onClick={() => onOpen(entry)}>
              <span class={entry.ok ? "history-dot is-ok" : "history-dot is-error"} aria-label={entry.ok ? "sucesso" : "erro"} />
              <span class="history-body">
                <span class="history-title">{entry.title}</span>
                <code class="history-sql">{preview(entry.sql)}</code>
              </span>
              <span class="history-meta">
                <span>{entry.workspace.replace(/_desafio$/, "")}</span>
                <span>{entry.ok ? `${entry.rows} ln · ${formatDuration(entry.ms)}` : "erro"}</span>
                <span>{timeAgo(entry.at)}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
