import { useState } from "preact/hooks";
import type { Challenge, ChallengeItem } from "../../lib/challenges";
import { ChallengeCard } from "./ChallengeCard";

interface ChallengeListProps {
  challenges: Challenge[];
  activeItem: string | null;
  onLoad: (item: ChallengeItem) => void;
}

export function ChallengeList({ challenges, activeItem, onLoad }: ChallengeListProps) {
  const initial = challenges.find((challenge) => challenge.items.some((item) => item.kind === "query"))?.id ?? null;
  const [open, setOpen] = useState<string | null>(initial);
  const runnable = challenges.flatMap((challenge) => challenge.items).filter((item) => item.kind !== "reference").length;

  return (
    <div class="challenges">
      <p class="challenges-intro">
        {challenges.length} desafios do repositório, do modelo conceitual ao backup. {runnable} itens rodam aqui mesmo, direto dos
        arquivos <code>.sql</code>.
      </p>
      <ol class="challenge-list">
        {challenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index}
            open={open === challenge.id}
            activeItem={activeItem}
            onToggle={() => setOpen(open === challenge.id ? null : challenge.id)}
            onLoad={onLoad}
          />
        ))}
      </ol>
    </div>
  );
}
