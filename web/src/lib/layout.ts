import type { Relation, SchemaInfo, TableInfo } from "./schema";

const MIN_WIDTH = 208;
const NAME_CHAR = 6.9;
const TYPE_CHAR = 6.3;
export const HEADER_HEIGHT = 38;
export const ROW_HEIGHT = 26;
const PADDING_BOTTOM = 8;
const GAP_X = 112;
const GAP_Y = 36;
const ROW_GAP_X = 40;
const ROW_GAP_Y = 72;

export interface Point {
  x: number;
  y: number;
}

export type Positions = Record<string, Point>;

export const nodeHeight = (table: TableInfo) => HEADER_HEIGHT + table.columns.length * ROW_HEIGHT + PADDING_BOTTOM;

export function nodeWidth(table: TableInfo): number {
  const rowWidth = Math.max(
    ...table.columns.map((column) => 40 + column.name.length * NAME_CHAR + 18 + column.type.length * TYPE_CHAR + 14)
  );
  const titleWidth = 28 + table.name.length * 8 + 56;
  return Math.ceil(Math.max(MIN_WIDTH, rowWidth, titleWidth));
}

export const diagramTables = (schema: SchemaInfo) => schema.tables.filter((table) => table.kind === "table");

const parentsOf = (name: string, relations: Relation[]) =>
  [...new Set(relations.filter((relation) => relation.from === name && relation.to !== name).map((relation) => relation.to))];

function computeDepths(tables: TableInfo[], relations: Relation[]): Map<string, number> {
  const depths = new Map<string, number>();
  const visit = (name: string, trail: Set<string>): number => {
    const known = depths.get(name);
    if (known !== undefined) return known;
    if (trail.has(name)) return -1;
    trail.add(name);
    const parentDepths = parentsOf(name, relations)
      .map((parent) => visit(parent, trail))
      .filter((depth) => depth >= 0);
    trail.delete(name);
    const depth = parentDepths.length > 0 ? Math.max(...parentDepths) + 1 : 0;
    depths.set(name, depth);
    return depth;
  };
  tables.forEach((table) => visit(table.name, new Set()));
  return depths;
}

function groupColumns(tables: TableInfo[], relations: Relation[]): TableInfo[][] {
  const depths = computeDepths(tables, relations);
  const connected = (name: string) => relations.some((relation) => relation.from === name || relation.to === name);
  const lastColumn = Math.max(0, ...tables.filter((table) => connected(table.name)).map((table) => depths.get(table.name) ?? 0));
  const columns: TableInfo[][] = [];
  tables.forEach((table) => {
    const index = connected(table.name) ? (depths.get(table.name) ?? 0) : lastColumn + 1;
    (columns[index] ??= []).push(table);
  });
  return columns.filter(Boolean);
}

function orderByParents(columns: TableInfo[][], relations: Relation[]): TableInfo[][] {
  const rank = new Map<string, number>();
  return columns.map((column, columnIndex) => {
    const ordered =
      columnIndex === 0
        ? column
        : [...column].sort((a, b) => {
            const score = (table: TableInfo) => {
              const ranks = parentsOf(table.name, relations).map((parent) => rank.get(parent) ?? 0);
              return ranks.length ? ranks.reduce((sum, value) => sum + value, 0) / ranks.length : Number.MAX_SAFE_INTEGER;
            };
            return score(a) - score(b);
          });
    ordered.forEach((table, index) => rank.set(table.name, index));
    return ordered;
  });
}

const rankedColumns = (schema: SchemaInfo) => {
  const tables = diagramTables(schema);
  return orderByParents(groupColumns(tables, schema.relations), schema.relations);
};

function horizontalLayout(columns: TableInfo[][]): Positions {
  const heights = columns.map((column) => column.reduce((sum, table) => sum + nodeHeight(table) + GAP_Y, -GAP_Y));
  const tallest = Math.max(0, ...heights);
  const positions: Positions = {};
  let x = 0;
  columns.forEach((column, index) => {
    let y = (tallest - heights[index]) / 2;
    column.forEach((table) => {
      positions[table.name] = { x, y };
      y += nodeHeight(table) + GAP_Y;
    });
    x += Math.max(...column.map(nodeWidth)) + GAP_X;
  });
  return positions;
}

const chunk = (tables: TableInfo[], size: number) =>
  Array.from({ length: Math.ceil(tables.length / size) }, (_, index) => tables.slice(index * size, index * size + size));

function verticalLayout(ranks: TableInfo[][], perRow: number): Positions {
  const rows = ranks.flatMap((rank) => chunk(rank, perRow));
  const widths = rows.map((row) => row.reduce((sum, table) => sum + nodeWidth(table) + ROW_GAP_X, -ROW_GAP_X));
  const widest = Math.max(0, ...widths);
  const positions: Positions = {};
  let y = 0;
  rows.forEach((row, index) => {
    let x = (widest - widths[index]) / 2;
    row.forEach((table) => {
      positions[table.name] = { x, y };
      x += nodeWidth(table) + ROW_GAP_X;
    });
    y += Math.max(...row.map(nodeHeight)) + ROW_GAP_Y;
  });
  return positions;
}

const fitScale = (bounds: Bounds, width: number, height: number) =>
  Math.min(width / bounds.width, height / bounds.height);

export function bestLayout(schema: SchemaInfo, frameWidth: number, frameHeight: number): Positions {
  const width = frameWidth - 32;
  const height = frameHeight - 124;
  const ranks = rankedColumns(schema);
  const candidates = [horizontalLayout(ranks), verticalLayout(ranks, 3), verticalLayout(ranks, 2)];
  const scores = candidates.map((positions, index) => fitScale(boundsOf(schema, positions), width, height) * (index === 0 ? 1.08 : 1));
  return candidates[scores.indexOf(Math.max(...scores))];
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function boundsOf(schema: SchemaInfo, positions: Positions): Bounds {
  const boxes = diagramTables(schema)
    .filter((table) => positions[table.name])
    .map((table) => ({ ...positions[table.name], width: nodeWidth(table), height: nodeHeight(table) }));
  if (boxes.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export interface Box extends Point {
  width: number;
}

export function edgePath(from: Box, fromRow: number, to: Box, toRow: number, selfLoop: boolean): string {
  const fromY = from.y + HEADER_HEIGHT + fromRow * ROW_HEIGHT + ROW_HEIGHT / 2;
  const toY = to.y + HEADER_HEIGHT + toRow * ROW_HEIGHT + ROW_HEIGHT / 2;
  const overlap = from.x < to.x + to.width && to.x < from.x + from.width;
  if (selfLoop || overlap) {
    const startX = from.x + from.width;
    const endX = to.x + to.width;
    const bulge = Math.max(startX, endX) + 56;
    return `M${startX},${fromY} C${bulge},${fromY} ${bulge},${toY} ${endX},${toY}`;
  }
  const leftward = from.x > to.x;
  const startX = leftward ? from.x : from.x + from.width;
  const endX = leftward ? to.x + to.width : to.x;
  const pull = Math.max(48, Math.abs(endX - startX) / 2);
  const direction = leftward ? -1 : 1;
  return `M${startX},${fromY} C${startX + pull * direction},${fromY} ${endX - pull * direction},${toY} ${endX},${toY}`;
}
