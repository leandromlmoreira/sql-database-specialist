import type { Challenge, ChallengeItem } from "../../lib/challenges";
import { inlineMarkdown } from "../../lib/markdown";
import { fileUrl } from "../../lib/sources";
import { Icon } from "../Icon";
import { ItemRow } from "./ItemRow";
import { Collapse } from "../ui/Collapse";

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  open: boolean;
  activeItem: string | null;
  onToggle: () => void;
  onLoad: (item: ChallengeItem) => void;
}

const splitTitle = (title: string) => {
  const [kicker, ...rest] = title.split(/\s[—–]\s/);
  return rest.length ? { kicker, name: rest.join(" — ") } : { kicker: "", name: title };
};

export function ChallengeCard({ challenge, index, open, activeItem, onToggle, onLoad }: ChallengeCardProps) {
  const { kicker, name } = splitTitle(challenge.title);
  const panelId = `${challenge.id}-panel`;
  return (
    <li class={open ? "challenge is-open" : "challenge"} style={{ "--stagger": index }}>
      <button type="button" class="challenge-head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span class="challenge-number">{String(challenge.number).padStart(2, "0")}</span>
        <span class="challenge-heading">
          {kicker && <span class="challenge-kicker">{kicker}</span>}
          <span class="challenge-title">{name}</span>
          <span class="challenge-tags">
            {challenge.tags.map((tag) => (
              <span key={tag} class="tag">
                {tag}
              </span>
            ))}
          </span>
        </span>
        <Icon name="chevron" size={15} class="challenge-chevron" />
      </button>
      <Collapse open={open} id={panelId}>
        <div class="challenge-body">
          <p class="challenge-summary" dangerouslySetInnerHTML={{ __html: inlineMarkdown(challenge.summary) }} />
          <div class="file-chips">
            {[...new Set(challenge.items.map((item) => item.workspace))].map((workspace) => (
              <span key={workspace} class="db-chip">
                <Icon name="database" size={12} />
                {workspace}
              </span>
            ))}
            {challenge.files.map((file) => (
              <a key={file.path} class="file-chip" href={fileUrl(file.path)} target="_blank" rel="noreferrer">
                {file.name}
              </a>
            ))}
            <a class="file-chip" href={fileUrl(`${challenge.id}/README.md`)} target="_blank" rel="noreferrer">
              README
            </a>
          </div>
          <ol class="items">
            {challenge.items.map((item, position) => (
              <ItemRow key={item.id} item={item} position={position} active={item.id === activeItem} onLoad={onLoad} />
            ))}
          </ol>
        </div>
      </Collapse>
    </li>
  );
}
