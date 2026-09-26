import type { WorkspaceSpec } from "../../lib/workspaces";
import type { Workspace } from "../../lib/engine";
import { repoUrl } from "../../lib/sources";
import { Icon } from "../Icon";
import { Logo } from "./Logo";

interface TopBarProps {
  specs: WorkspaceSpec[];
  workspaces: Record<string, Workspace>;
  active: string;
  version: string;
  booting: boolean;
  onSwitch: (id: string) => void;
  onReset: () => void;
}

const shortName = (id: string) => id.replace(/_desafio$/, "");

function WorkspaceSwitch({ specs, workspaces, active, onSwitch }: Omit<TopBarProps, "version" | "booting" | "onReset">) {
  return (
    <div class="ws-switch" role="radiogroup" aria-label="Banco de dados">
      {specs.map((spec) => (
        <button
          key={spec.id}
          type="button"
          role="radio"
          aria-checked={spec.id === active}
          class={spec.id === active ? "ws-option is-active" : "ws-option"}
          onClick={() => onSwitch(spec.id)}
        >
          <Icon name="database" size={14} />
          <span class="ws-name">{shortName(spec.id)}</span>
          <span class="ws-meta">{workspaces[spec.id]?.schema.tables.filter((table) => table.kind === "table").length ?? "·"}</span>
        </button>
      ))}
    </div>
  );
}

function WorkspaceSelect({ specs, active, onSwitch }: Pick<TopBarProps, "specs" | "active" | "onSwitch">) {
  return (
    <label class="ws-select">
      <Icon name="database" size={14} />
      <select value={active} onChange={(event) => onSwitch(event.currentTarget.value)} aria-label="Banco de dados">
        {specs.map((spec) => (
          <option key={spec.id} value={spec.id}>
            {shortName(spec.id)}
          </option>
        ))}
      </select>
      <Icon name="chevron" size={12} class="ws-select-caret" />
    </label>
  );
}

export function TopBar(props: TopBarProps) {
  const { version, booting, onReset } = props;
  return (
    <header class="topbar">
      <a class="brand" href="./" aria-label="SQL Lab, início">
        <Logo />
        <span class="brand-word">
          sql<span>lab</span>
        </span>
      </a>
      <span class="topbar-divider" aria-hidden="true" />
      <WorkspaceSwitch {...props} />
      <WorkspaceSelect {...props} />
      <div class="topbar-right">
        <span class={booting ? "engine-chip is-booting" : "engine-chip"}>
          <span class="engine-dot" />
          {booting ? "Iniciando SQLite…" : `SQLite ${version} · WASM`}
        </span>
        <button type="button" class="btn btn-ghost btn-sm reset-btn" onClick={onReset} disabled={booting}>
          <Icon name="reset" size={14} />
          <span>Resetar banco</span>
        </button>
        <a class="icon-btn" href={repoUrl} target="_blank" rel="noreferrer" aria-label="Código no GitHub">
          <Icon name="github" size={17} />
        </a>
      </div>
    </header>
  );
}
