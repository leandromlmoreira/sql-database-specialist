import { useEffect, useState } from "preact/hooks";
import type { RunOutcome } from "../../lib/engine";
import { ResultGrid } from "./ResultGrid";
import { CommandState, ErrorState, IdleState, LoadingState } from "./ResultStates";

interface ResultViewProps {
  booting: boolean;
  outcome: RunOutcome | null;
  runId: number;
}

export function ResultView({ booting, outcome, runId }: ResultViewProps) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(Math.max(0, (outcome?.sets.length ?? 1) - 1)), [runId]);

  if (booting) return <LoadingState label="Inicializando SQLite em WebAssembly e carregando os scripts do repositório…" />;
  if (!outcome) return <IdleState />;
  if (outcome.error) return <ErrorState message={outcome.error} />;
  if (outcome.sets.length === 0) return <CommandState changes={outcome.changes} statements={outcome.statements} />;

  const set = outcome.sets[Math.min(selected, outcome.sets.length - 1)];
  return (
    <div class="result-view" key={runId}>
      {outcome.sets.length > 1 && (
        <div class="set-switch" role="tablist" aria-label="Conjuntos de resultado">
          {outcome.sets.map((item, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === selected}
              class={index === selected ? "is-active" : ""}
              onClick={() => setSelected(index)}
            >
              Resultado {index + 1}
              <span>{item.rows.length}</span>
            </button>
          ))}
        </div>
      )}
      <ResultGrid key={`${runId}-${selected}`} set={set} />
    </div>
  );
}
