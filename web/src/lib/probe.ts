import type { Workspace } from "./engine";
import type { IndexProbe } from "./challenges";

const literal = (value: unknown) =>
  typeof value === "number" ? String(value) : `'${String(value ?? "").replace(/'/g, "''")}'`;

export function indexProbeSql(workspace: Workspace, { table, column }: IndexProbe): string {
  const sample = workspace.db.exec(`SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL LIMIT 1`)[0]?.values[0]?.[0];
  return `EXPLAIN QUERY PLAN\nSELECT *\nFROM ${table}\nWHERE ${column} = ${literal(sample)};`;
}

export const tablePreviewSql = (table: string) => `SELECT *\nFROM ${table}\nLIMIT 100;`;
