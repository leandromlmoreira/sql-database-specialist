import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { translate, translateStatements, VARIABLE_PREFIX } from "./dialect";
import { readSchema, type SchemaInfo } from "./schema";
import type { WorkspaceSpec } from "./workspaces";

export interface ResultSet {
  columns: string[];
  rows: SqlValue[][];
}

export interface RunOutcome {
  sets: ResultSet[];
  changes: number;
  statements: number;
  ms: number;
  adaptations: string[];
  error: string | null;
}

export interface Workspace {
  spec: WorkspaceSpec;
  db: Database;
  schema: SchemaInfo;
  variables: Record<string, SqlValue>;
}

let runtime: Promise<SqlJsStatic> | null = null;

const loadRuntime = () => (runtime ??= initSqlJs({ locateFile: () => wasmUrl }));

export async function sqliteVersion(): Promise<string> {
  const SQL = await loadRuntime();
  const db = new SQL.Database();
  const version = String(db.exec("SELECT sqlite_version()")[0]?.values[0]?.[0] ?? "");
  db.close();
  return version;
}

export async function openWorkspace(spec: WorkspaceSpec): Promise<Workspace> {
  const SQL = await loadRuntime();
  const db = new SQL.Database();
  db.exec(translateStatements(spec.boot).sql);
  return { spec, db, schema: readSchema(db), variables: {} };
}

export const refreshSchema = (workspace: Workspace): Workspace => ({ ...workspace, schema: readSchema(workspace.db) });

const MODIFYING = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i;

const HINTS: [RegExp, string][] = [
  [/no such table/i, "Essa tabela não existe no banco selecionado. Confira o schema ou troque de banco no topo."],
  [/no such column/i, "Coluna inexistente. O autocomplete (Ctrl+Espaço) lista as colunas do schema carregado."],
  [/syntax error/i, "Erro de sintaxe. Confira vírgulas, parênteses e o ponto e vírgula entre comandos."],
  [/UNIQUE constraint/i, "Violação de UNIQUE: já existe uma linha com esse valor."],
  [/CHECK constraint/i, "Violação de CHECK: o valor não passa na regra da coluna (ENUM ou faixa)."]
];

const describeError = (message: string) => {
  const hint = HINTS.find(([pattern]) => pattern.test(message))?.[1];
  return hint ? `${message}\n${hint}` : message;
};

const mysqlOnlyError = (keywords: string[]) =>
  `${[...new Set(keywords)].join(", ")}: recurso exclusivo do MySQL.\nProcedures, CALL e usuários/GRANT não existem no SQLite do navegador. O código e a saída registrada estão no card do desafio.`;

function rollbackQuietly(db: Database): void {
  try {
    db.exec("ROLLBACK");
  } catch {
    return;
  }
}

export function execute(workspace: Workspace, source: string): RunOutcome {
  const translation = translate(source);
  const base = { sets: [], changes: 0, statements: 0, ms: 0, adaptations: translation.adaptations };
  if (translation.mysqlOnly.length > 0) return { ...base, error: mysqlOnlyError(translation.mysqlOnly) };
  const sets: ResultSet[] = [];
  let changes = 0;
  let statements = 0;
  const started = performance.now();
  try {
    for (const statement of workspace.db.iterateStatements(translation.sql)) {
      statement.bind(workspace.variables);
      const columns = statement.getColumnNames();
      const rows: SqlValue[][] = [];
      while (statement.step()) rows.push(statement.get());
      statements += 1;
      if (columns.length === 1 && columns[0].startsWith(VARIABLE_PREFIX)) {
        workspace.variables[columns[0].slice(VARIABLE_PREFIX.length)] = rows[0]?.[0] ?? null;
      } else if (columns.length > 0) {
        sets.push({ columns, rows });
      } else if (MODIFYING.test(statement.getSQL() ?? "")) {
        changes += workspace.db.getRowsModified();
      }
    }
    return { ...base, sets, changes, statements, ms: performance.now() - started, error: null };
  } catch (error) {
    rollbackQuietly(workspace.db);
    const message = error instanceof Error ? error.message : String(error);
    return { ...base, sets, changes, statements, ms: performance.now() - started, error: describeError(message) };
  }
}
