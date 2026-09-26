import { Icon, type IconName } from "../Icon";

export type MobileTab = "challenges" | "query" | "er" | "schema" | "history";

const TABS: { id: MobileTab; label: string; icon: IconName }[] = [
  { id: "challenges", label: "Desafios", icon: "list" },
  { id: "query", label: "Consulta", icon: "terminal" },
  { id: "er", label: "Diagrama", icon: "diagram" },
  { id: "schema", label: "Schema", icon: "layers" },
  { id: "history", label: "Histórico", icon: "history" }
];

interface MobileNavProps {
  tab: MobileTab;
  onTab: (tab: MobileTab) => void;
}

export function MobileNav({ tab, onTab }: MobileNavProps) {
  const index = TABS.findIndex((item) => item.id === tab);
  return (
    <nav class="mobile-nav" aria-label="Seções">
      <span class="mobile-nav-indicator" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden="true" />
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          class={tab === item.id ? "mobile-tab is-active" : "mobile-tab"}
          aria-current={tab === item.id ? "page" : undefined}
          onClick={() => onTab(item.id)}
        >
          <Icon name={item.icon} size={19} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
