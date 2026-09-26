interface PanelHeaderProps {
  eyebrow: string;
  title: string;
  meta?: string;
}

export function PanelHeader({ eyebrow, title, meta }: PanelHeaderProps) {
  return (
    <header class="panel-head">
      <span class="eyebrow">{eyebrow}</span>
      <div class="panel-title-row">
        <h2 class="panel-title">{title}</h2>
        {meta && <span class="panel-meta">{meta}</span>}
      </div>
    </header>
  );
}
