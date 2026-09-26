import { useMemo, useState } from "preact/hooks";
import type { ChallengeItem } from "../../lib/challenges";
import { inlineMarkdown } from "../../lib/markdown";
import { highlightSql } from "../../lib/highlight";
import { fileUrl } from "../../lib/sources";
import { Icon } from "../Icon";
import { Collapse } from "../ui/Collapse";

export function ReferenceItem({ item }: { item: ChallengeItem }) {
  const [open, setOpen] = useState(false);
  const code = useMemo(() => (open && item.code ? highlightSql(item.code.trim()) : ""), [open, item.code]);
  const expandable = Boolean(item.code || item.notes.length || item.output);
  return (
    <li class={open ? "item is-reference is-open" : "item is-reference"}>
      <button type="button" class="item-main" aria-expanded={open} onClick={() => expandable && setOpen(!open)}>
        <span class="item-label is-reference">MySQL</span>
        <span class="item-text">
          <span class="item-title is-mono">{item.title}</span>
          {item.detail && <span class="item-detail" dangerouslySetInnerHTML={{ __html: inlineMarkdown(item.detail) }} />}
        </span>
        <span class="item-action is-quiet">
          <Icon name={open ? "minus" : "code"} size={13} />
          {open ? "Fechar" : "Ver"}
        </span>
      </button>
      <Collapse open={open}>
        <div class="reference-body">
          <p class="reference-note">
            Recurso exclusivo do MySQL: fica como referência e não roda no SQLite do navegador.
          </p>
          {item.notes.length > 0 && (
            <ul class="item-notes">
              {item.notes.map((note) => (
                <li key={note} dangerouslySetInnerHTML={{ __html: inlineMarkdown(note) }} />
              ))}
            </ul>
          )}
          {item.code && <pre class="code-block" dangerouslySetInnerHTML={{ __html: code }} />}
          {item.output && (
            <figure class="output-block">
              <figcaption>Saída registrada no MySQL 8.4</figcaption>
              <pre>{item.output}</pre>
            </figure>
          )}
          <a class="file-link" href={fileUrl(item.file)} target="_blank" rel="noreferrer">
            {item.file.split("/").pop()}
            <Icon name="external" size={12} />
          </a>
        </div>
      </Collapse>
    </li>
  );
}
