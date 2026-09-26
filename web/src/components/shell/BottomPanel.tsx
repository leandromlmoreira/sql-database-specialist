import type { ComponentChildren } from "preact";
import type { RunOutcome } from "../../lib/engine";
import { formatDuration, plural } from "../../lib/format";
import { Icon, type IconName } from "../Icon";

export type BottomTab = "result" | "er" | "history";

interface BottomPanelProps {
  tab: BottomTab;
  onTab: (tab: BottomTab) => void;
  outcome: RunOutcome | null;
  historyCount: number;
  showTabs: boolean;
  children: ComponentChildren;
}

const TABS: { id: BottomTab; label: string; icon: IconName }[] = [
  { id: "result", label: "Resultado", icon: "rows" },
  { id: "er", label: "Diagrama ER", icon: "diagram" },
  { id: "history", label: "Histórico", icon: "history" }
];

function RunMeta({ outcome }: { outcome: RunOutcome }) {
  const rows = outcome.sets[outcome.sets.length - 1]?.rows.length ?? 0;
  return (
    <div class="run-meta" aria-live="polite">
      {outcome.error ? (
        <span class="meta-pill is-error">
          <Icon name="alert" size={12} />
          erro
        </span>
      ) : (
        <span class="meta-pill is-ok">
          <Icon name="check" size={12} />
          {outcome.sets.length ? plural(rows, "linha", "linhas") : plural(outcome.changes, "alteração", "alterações")}
        </span>
      )}
      <span class="meta-pill">
        <Icon name="clock" size={12} />
        {formatDuration(outcome.ms)}
      </span>
      {outcome.adaptations.length > 0 && (
        <span class="meta-pill is-dialect" title={`MySQL → SQLite:\n${outcome.adaptations.join("\n")}`}>
          <Icon name="bolt" size={12} />
          {plural(outcome.adaptations.length, "adaptação", "adaptações")}
        </span>
      )}
    </div>
  );
}

export function BottomPanel({ tab, onTab, outcome, historyCount, showTabs, children }: BottomPanelProps) {
  return (
    <section class={`panel bottom-panel is-${tab}`} aria-label="Resultados">
      {showTabs && (
        <header class="bottom-head">
          <div class="tabs" role="tablist">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                class={tab === item.id ? "tab is-active" : "tab"}
                onClick={() => onTab(item.id)}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
                {item.id === "history" && historyCount > 0 && <span class="tab-count">{historyCount}</span>}
              </button>
            ))}
          </div>
          {tab === "result" && outcome && <RunMeta outcome={outcome} />}
        </header>
      )}
      {!showTabs && tab === "result" && outcome && (
        <header class="bottom-head is-compact">
          <RunMeta outcome={outcome} />
        </header>
      )}
      <div class="bottom-body">{children}</div>
    </section>
  );
}
