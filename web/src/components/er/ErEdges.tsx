import type { Relation, TableInfo } from "../../lib/schema";
import { edgePath, nodeWidth, type Positions } from "../../lib/layout";

interface ErEdgesProps {
  relations: Relation[];
  tables: Map<string, TableInfo>;
  positions: Positions;
  active: string | null;
}

export const touches = (relation: Relation, table: string | null) =>
  table !== null && (relation.from === table || relation.to === table);

export function ErMarkers() {
  return (
    <defs>
      {["", "-active"].map((suffix) => (
        <g key={suffix}>
          <marker id={`er-many${suffix}`} viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path d="M1 7H13M1 7 13 1.5M1 7 13 12.5" class={`er-marker${suffix}`} />
          </marker>
          <marker id={`er-one${suffix}`} viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14" markerHeight="14" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M1 7h12M7 1.5v11M10 1.5v11" class={`er-marker${suffix}`} />
          </marker>
        </g>
      ))}
    </defs>
  );
}

export function ErEdges({ relations, tables, positions, active }: ErEdgesProps) {
  return (
    <g class="er-edges">
      {relations.map((relation) => {
        const from = tables.get(relation.from);
        const to = tables.get(relation.to);
        const fromPoint = positions[relation.from];
        const toPoint = positions[relation.to];
        if (!from || !to || !fromPoint || !toPoint) return null;
        const fromRow = from.columns.findIndex((column) => column.name === relation.fromColumn);
        const toRow = Math.max(0, to.columns.findIndex((column) => column.name === relation.toColumn));
        const highlighted = touches(relation, active);
        const state = active === null ? "idle" : highlighted ? "active" : "dimmed";
        const suffix = highlighted ? "-active" : "";
        return (
          <path
            key={`${relation.from}.${relation.fromColumn}`}
            class={`er-edge is-${state}`}
            d={edgePath(
              { ...fromPoint, width: nodeWidth(from) },
              fromRow,
              { ...toPoint, width: nodeWidth(to) },
              toRow,
              relation.from === relation.to
            )}
            marker-start={`url(#er-many${suffix})`}
            marker-end={`url(#er-one${suffix})`}
          />
        );
      })}
    </g>
  );
}
