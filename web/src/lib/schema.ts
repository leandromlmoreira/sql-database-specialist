import type { Database, SqlValue } from "sql.js";

export interface Column {
  name: string;
  type: string;
  notNull: boolean;
  primaryKey: boolean;
  foreignKey: { table: string; column: string } | null;
  enumValues: string[];
}

export interface Relation {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
}

export interface TableInfo {
  name: string;
  kind: "table" | "view";
  columns: Column[];
  rowCount: number;
}

export interface SchemaInfo {
  tables: TableInfo[];
  relations: Relation[];
}

const rows = (db: Database, sql: string) => db.exec(sql)[0]?.values ?? [];

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

function enumValuesOf(createSql: string, column: string): string[] {
  const match = createSql.match(new RegExp(`\\b${column}\\s+TEXT\\s+CHECK\\s*\\(\\s*${column}\\s+IN\\s*\\(([^)]*)\\)`, "i"));
  return match ? [...match[1].matchAll(/'([^']*)'/g)].map((value) => value[1]) : [];
}

function displayType(declared: string, enumValues: string[]): string {
  if (enumValues.length > 0) return "enum";
  return (declared || "any").toLowerCase().replace(/\s+/g, "");
}

function readRelations(db: Database, table: string): Relation[] {
  return rows(db, `PRAGMA foreign_key_list(${quote(table)})`).map((row: SqlValue[]) => ({
    from: table,
    fromColumn: String(row[3]),
    to: String(row[2]),
    toColumn: String(row[4] ?? "")
  }));
}

function readColumns(db: Database, table: string, createSql: string, relations: Relation[]): Column[] {
  return rows(db, `PRAGMA table_info(${quote(table)})`).map((row: SqlValue[]) => {
    const name = String(row[1]);
    const enumValues = enumValuesOf(createSql, name);
    const relation = relations.find((item) => item.fromColumn === name);
    return {
      name,
      type: displayType(String(row[2] ?? ""), enumValues),
      notNull: Number(row[3]) === 1,
      primaryKey: Number(row[5]) > 0,
      foreignKey: relation ? { table: relation.to, column: relation.toColumn } : null,
      enumValues
    };
  });
}

export function readSchema(db: Database): SchemaInfo {
  const objects = rows(
    db,
    "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY type = 'view', rowid"
  );
  const relations: Relation[] = [];
  const tables = objects.map((row: SqlValue[]) => {
    const name = String(row[0]);
    const kind = row[1] === "view" ? "view" : "table";
    const tableRelations = kind === "table" ? readRelations(db, name) : [];
    relations.push(...tableRelations);
    return {
      name,
      kind,
      columns: readColumns(db, name, String(row[2] ?? ""), tableRelations),
      rowCount: Number(rows(db, `SELECT COUNT(*) FROM ${quote(name)}`)[0]?.[0] ?? 0)
    } satisfies TableInfo;
  });
  const resolved = relations.map((relation) => ({
    ...relation,
    toColumn:
      relation.toColumn ||
      tables.find((table) => table.name === relation.to)?.columns.find((column) => column.primaryKey)?.name ||
      ""
  }));
  return { tables, relations: resolved };
}

export const completionSchema = (schema: SchemaInfo) =>
  Object.fromEntries(schema.tables.map((table) => [table.name, table.columns.map((column) => column.name)]));
