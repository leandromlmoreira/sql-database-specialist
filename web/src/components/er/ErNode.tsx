import type { TableInfo } from "../../lib/schema";
import { HEADER_HEIGHT, ROW_HEIGHT, nodeHeight, nodeWidth, type Point } from "../../lib/layout";

interface ErNodeProps {
  table: TableInfo;
  position: Point;
  state: "idle" | "active" | "related" | "dimmed";
  linkedColumns: Set<string>;
  dragging: boolean;
}

const KEY_PATH = "M7.2 6.4a2.6 2.6 0 1 1-1.9 2.5L.8 13.4V11h2V9h2l1-1";
const LINK_PATH = "M5.5 8.5a2.4 2.4 0 0 0 3.4 0l1.9-1.9a2.4 2.4 0 0 0-3.4-3.4l-.6.6M8.5 5.5a2.4 2.4 0 0 0-3.4 0L3.2 7.4a2.4 2.4 0 0 0 3.4 3.4l.6-.6";

function ColumnGlyph({ primary, foreign }: { primary: boolean; foreign: boolean }) {
  if (primary) return <path d={KEY_PATH} class="er-glyph is-pk" />;
  if (foreign) return <path d={LINK_PATH} class="er-glyph is-fk" />;
  return <circle cx="7" cy="8" r="1.6" class="er-glyph-dot" />;
}

export function ErNode({ table, position, state, linkedColumns, dragging }: ErNodeProps) {
  const height = nodeHeight(table);
  const width = nodeWidth(table);
  return (
    <g
      class={`er-node is-${state}${dragging ? " is-dragging" : ""}`}
      data-table={table.name}
      transform={`translate(${position.x} ${position.y})`}
    >
      <rect class="er-shadow" x="0" y="4" width={width} height={height} rx="12" />
      <rect class="er-body" width={width} height={height} rx="12" />
      <path class="er-header" d={`M0 12a12 12 0 0 1 12-12h${width - 24}a12 12 0 0 1 12 12v${HEADER_HEIGHT - 12}H0z`} />
      <text class="er-title" x="14" y="24">
        {table.name}
      </text>
      <text class="er-count" x={width - 14} y="24" text-anchor="end">
        {table.rowCount} ln
      </text>
      {table.columns.map((column, index) => {
        const y = HEADER_HEIGHT + index * ROW_HEIGHT;
        const linked = linkedColumns.has(column.name);
        return (
          <g key={column.name} transform={`translate(0 ${y})`} class={linked ? "er-row is-linked" : "er-row"}>
            <rect class="er-row-bg" x="4" y="1" width={width - 8} height={ROW_HEIGHT - 2} rx="6" />
            <g transform={`translate(12 ${ROW_HEIGHT / 2 - 8})`}>
              <ColumnGlyph primary={column.primaryKey} foreign={Boolean(column.foreignKey)} />
            </g>
            <text class="er-column" x="32" y={ROW_HEIGHT / 2 + 4}>
              {column.name}
            </text>
            <text class="er-type" x={width - 14} y={ROW_HEIGHT / 2 + 4} text-anchor="end">
              {column.type}
            </text>
          </g>
        );
      })}
    </g>
  );
}
