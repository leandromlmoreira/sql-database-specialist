import { Icon } from "../Icon";
import { Kbd } from "../ui/Kbd";
import { plural } from "../../lib/format";

export function LoadingState({ label }: { label: string }) {
  return (
    <div class="state state-loading" role="status" aria-live="polite">
      <div class="skeleton" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} class="skeleton-row" style={{ animationDelay: `${index * 70}ms` }}>
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <p class="state-caption">{label}</p>
    </div>
  );
}

export function IdleState() {
  return (
    <div class="state state-idle">
      <svg class="state-art" viewBox="0 0 160 96" aria-hidden="true">
        <rect x="8" y="10" width="144" height="76" rx="10" class="art-frame" />
        <path d="M8 30h144M56 30v56M104 30v56M8 50h144M8 68h144" class="art-grid" />
        <rect x="18" y="17" width="28" height="6" rx="3" class="art-accent" />
        <rect x="64" y="37" width="30" height="6" rx="3" class="art-muted" />
        <rect x="112" y="55" width="26" height="6" rx="3" class="art-muted" />
      </svg>
      <h3>Pronto para consultar</h3>
      <p>
        Escolha uma pergunta de negócio na lista de desafios ou escreva seu SQL. <Kbd keys={["Ctrl", "Enter"]} /> executa.
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  const [headline, ...hints] = message.split("\n");
  return (
    <div class="state state-error" role="alert">
      <div class="error-card">
        <span class="error-icon">
          <Icon name="alert" size={18} />
        </span>
        <div>
          <h3>A consulta não rodou</h3>
          <code class="error-message">{headline}</code>
          {hints.map((hint) => (
            <p key={hint} class="error-hint">
              {hint}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CommandStateProps {
  changes: number;
  statements: number;
}

export function CommandState({ changes, statements }: CommandStateProps) {
  return (
    <div class="state state-command">
      <span class="command-icon">
        <Icon name="check" size={20} />
      </span>
      <h3>Comando executado</h3>
      <p>
        {plural(statements, "comando", "comandos")} · {plural(changes, "linha afetada", "linhas afetadas")}. O schema ao lado já
        reflete a mudança.
      </p>
    </div>
  );
}
