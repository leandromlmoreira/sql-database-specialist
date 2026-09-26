import type { ComponentChildren } from "preact";
import { inlineMarkdown } from "../../lib/markdown";
import { Icon } from "../Icon";
import { Kbd } from "../ui/Kbd";

export interface QueryContext {
  title: string;
  detail: string;
  crumbs: string[];
  kind: string;
  edited?: boolean;
}

interface EditorPanelProps {
  context: QueryContext;
  disabled: boolean;
  onRun: () => void;
  children: ComponentChildren;
}

export function EditorPanel({ context, disabled, onRun, children }: EditorPanelProps) {
  return (
    <section class="panel editor-panel" aria-label="Editor de consultas">
      <header class="editor-head">
        <div class="editor-context">
          <nav class="crumbs" aria-label="Origem da consulta">
            {context.crumbs.map((crumb, index) => (
              <span key={`${crumb}-${index}`} class={index === context.crumbs.length - 1 ? "crumb is-last" : "crumb"}>
                {crumb}
              </span>
            ))}
            {context.edited && <span class="edited-chip">editada</span>}
          </nav>
          <h1 class="editor-title">{context.title}</h1>
          {context.detail && <p class="editor-detail" dangerouslySetInnerHTML={{ __html: inlineMarkdown(context.detail) }} />}
        </div>
        <button type="button" class="btn btn-primary run-btn" onClick={onRun} disabled={disabled}>
          <Icon name="play" size={13} filled />
          <span>Executar</span>
          <Kbd keys={["Ctrl", "Enter"]} />
        </button>
      </header>
      <div class="editor-body">{children}</div>
    </section>
  );
}
