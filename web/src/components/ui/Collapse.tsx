import type { ComponentChildren } from "preact";

interface CollapseProps {
  open: boolean;
  id?: string;
  children: ComponentChildren;
}

export function Collapse({ open, id, children }: CollapseProps) {
  return (
    <div class="collapse" data-open={open} id={id}>
      <div class="collapse-inner" inert={!open}>
        {children}
      </div>
    </div>
  );
}
