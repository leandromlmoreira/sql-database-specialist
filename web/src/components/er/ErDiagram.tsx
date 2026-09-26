import { useEffect, useMemo, useState } from "preact/hooks";
import type { SchemaInfo, TableInfo } from "../../lib/schema";
import { bestLayout, boundsOf, diagramTables, type Positions } from "../../lib/layout";
import { Icon } from "../Icon";
import { ErEdges, ErMarkers, touches } from "./ErEdges";
import { ErNode } from "./ErNode";
import { useDiagramGestures } from "./useDiagramGestures";
import { useViewport } from "./useViewport";

interface ErDiagramProps {
  workspace: string;
  schema: SchemaInfo;
  stored: Positions | null;
  visible: boolean;
  onPositions: (positions: Positions | null) => void;
}

function linkedColumnsOf(schema: SchemaInfo, active: string | null): Map<string, Set<string>> {
  const linked = new Map<string, Set<string>>();
  const mark = (table: string, column: string) => (linked.get(table) ?? linked.set(table, new Set()).get(table)!).add(column);
  schema.relations
    .filter((relation) => touches(relation, active))
    .forEach((relation) => {
      mark(relation.from, relation.fromColumn);
      mark(relation.to, relation.toColumn);
    });
  return linked;
}

const EMPTY = new Set<string>();

export function ErDiagram({ workspace, schema, stored, visible, onPositions }: ErDiagramProps) {
  const { frame, view, setView, size, fit, zoomBy } = useViewport();
  const width = size.width || 1200;
  const height = size.height || 700;
  const auto = useMemo(() => bestLayout(schema, width, height), [schema, width, height]);
  const positions = useMemo(() => ({ ...auto, ...stored }), [auto, stored]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const active = dragging ?? hovered ?? pinned;
  const tables = useMemo(() => diagramTables(schema), [schema]);
  const byName = useMemo(() => new Map<string, TableInfo>(tables.map((table) => [table.name, table])), [tables]);
  const linked = useMemo(() => linkedColumnsOf(schema, active), [schema, active]);
  const related = useMemo(
    () => new Set(schema.relations.filter((relation) => touches(relation, active)).flatMap((relation) => [relation.from, relation.to])),
    [schema, active]
  );
  const ready = visible && size.width > 0;

  useEffect(() => {
    setPinned(null);
    if (ready) fit(boundsOf(schema, positions));
  }, [workspace, ready, fit]);

  const relayout = () => {
    onPositions(null);
    fit(boundsOf(schema, auto));
  };

  const gestures = useDiagramGestures({
    view,
    setView,
    positions,
    onMove: (name, point) => onPositions({ ...positions, [name]: point }),
    onTap: (name) => setPinned((current) => (name === current ? null : name)),
    onDragChange: setDragging
  });

  const hoverFrom = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || dragging) return;
    setHovered((event.target as Element).closest<SVGGElement>("[data-table]")?.dataset.table ?? null);
  };

  const stateOf = (name: string) => {
    if (!active) return "idle";
    if (name === active) return "active";
    return related.has(name) ? "related" : "dimmed";
  };

  return (
    <div class="er">
      <div
        class={`er-canvas${dragging ? " is-grabbing" : ""}`}
        ref={frame}
        onPointerDown={gestures.onPointerDown}
        onPointerMove={(event) => {
          gestures.onPointerMove(event);
          hoverFrom(event);
        }}
        onPointerUp={gestures.onPointerUp}
        onPointerCancel={gestures.onPointerCancel}
        onPointerLeave={() => setHovered(null)}
      >
        <svg class="er-svg" role="img" aria-label={`Diagrama entidade-relacionamento de ${workspace}`}>
          <ErMarkers />
          <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
            <ErEdges relations={schema.relations} tables={byName} positions={positions} active={active} />
            {tables.map((table) =>
              positions[table.name] ? (
                <ErNode
                  key={table.name}
                  table={table}
                  position={positions[table.name]}
                  state={stateOf(table.name)}
                  linkedColumns={linked.get(table.name) ?? EMPTY}
                  dragging={dragging === table.name}
                />
              ) : null
            )}
          </g>
        </svg>
      </div>
      <div class="er-toolbar" role="toolbar" aria-label="Controles do diagrama">
        <button type="button" class="icon-btn" onClick={() => zoomBy(1 / 1.2)} aria-label="Diminuir zoom">
          <Icon name="minus" size={15} />
        </button>
        <span class="er-zoom">{Math.round(view.scale * 100)}%</span>
        <button type="button" class="icon-btn" onClick={() => zoomBy(1.2)} aria-label="Aumentar zoom">
          <Icon name="plus" size={15} />
        </button>
        <span class="toolbar-divider" />
        <button type="button" class="icon-btn" onClick={() => fit(boundsOf(schema, positions))} aria-label="Ajustar à tela">
          <Icon name="fit" size={15} />
        </button>
        <button type="button" class="icon-btn" onClick={relayout} aria-label="Reorganizar tabelas">
          <Icon name="shuffle" size={15} />
        </button>
      </div>
      <div class="er-legend" aria-hidden="true">
        <span>
          <i class="legend-pk" /> PK
        </span>
        <span>
          <i class="legend-fk" /> FK
        </span>
        <span>
          <svg width="30" height="10" viewBox="0 0 30 10">
            <path d="M1 5h28M1 5 8 1M1 5l7 4M24 1v8M27 1v8" />
          </svg>
          N:1
        </span>
      </div>
      <p class="er-hint">
        {pinned ? (
          <>
            <strong>{pinned}</strong> · {related.size > 1 ? `${related.size - 1} tabelas relacionadas` : "sem chaves estrangeiras"}
          </>
        ) : (
          <>
            <span class="hint-fine">Arraste as tabelas · passe o mouse para ver as relações</span>
            <span class="hint-touch">Toque numa tabela para ver as relações</span>
          </>
        )}
      </p>
    </div>
  );
}
