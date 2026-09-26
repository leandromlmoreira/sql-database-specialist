import type { ChallengeItem, ItemKind } from "../../lib/challenges";
import { inlineMarkdown } from "../../lib/markdown";
import { Icon } from "../Icon";
import { ReferenceItem } from "./ReferenceItem";

interface ItemRowProps {
  item: ChallengeItem;
  position: number;
  active: boolean;
  onLoad: (item: ChallengeItem) => void;
}

const LABELS: Record<ItemKind, (position: number) => string> = {
  query: (position) => `Q${position + 1}`,
  index: () => "IDX",
  view: () => "VIEW",
  demo: () => "RUN",
  reference: () => "MySQL",
  model: () => "ER"
};

const ACTIONS: Record<ItemKind, string> = {
  query: "Rodar",
  index: "Plano",
  view: "Abrir",
  demo: "Rodar",
  reference: "Código",
  model: "Diagrama"
};

function Notes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <ul class="item-notes">
      {notes.map((note) => (
        <li key={note} dangerouslySetInnerHTML={{ __html: inlineMarkdown(note) }} />
      ))}
    </ul>
  );
}

export function ItemRow({ item, position, active, onLoad }: ItemRowProps) {
  if (item.kind === "reference") return <ReferenceItem item={item} />;
  const isQuestion = item.kind === "query";
  return (
    <li class={active ? "item is-active" : "item"}>
      <button type="button" class="item-main" onClick={() => onLoad(item)} aria-current={active ? "true" : undefined}>
        <span class={`item-label is-${item.kind}`}>{LABELS[item.kind](position)}</span>
        <span class="item-text">
          <span class={isQuestion ? "item-title is-question" : "item-title is-mono"}>{item.title}</span>
          {item.detail && <span class="item-detail" dangerouslySetInnerHTML={{ __html: inlineMarkdown(item.detail) }} />}
        </span>
        <span class="item-action">
          <Icon name={item.kind === "model" ? "diagram" : "play"} size={12} filled={item.kind !== "model"} />
          {ACTIONS[item.kind]}
        </span>
      </button>
      <Notes notes={item.notes} />
    </li>
  );
}
