import { rewriteCalls } from "./calls";
import { splitMysqlScript, type ScriptStatement } from "./splitter";

export const VARIABLE_PREFIX = "__set__";

interface Rule {
  label: string;
  apply: (sql: string) => string;
}

const IGNORED = /^(USE\s|DROP DATABASE|CREATE DATABASE|FLUSH PRIVILEGES|SET AUTOCOMMIT)/i;

const MYSQL_ONLY = /^(CREATE|DROP)\s+(PROCEDURE|FUNCTION|USER)\b|^(CALL|GRANT|REVOKE)\b/i;

const rules: Rule[] = [
  { label: "START TRANSACTION → BEGIN", apply: (sql) => sql.replace(/^START\s+TRANSACTION\b/i, "BEGIN") },
  {
    label: "AUTO_INCREMENT → AUTOINCREMENT",
    apply: (sql) =>
      sql
        .replace(/\bINT(?:EGER)?\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, "INTEGER PRIMARY KEY AUTOINCREMENT")
        .replace(/\s+AUTO_INCREMENT\b/gi, "")
  },
  {
    label: "ENUM → CHECK",
    apply: (sql) => sql.replace(/(\w+)\s+ENUM\s*\(([^)]*)\)/gi, "$1 TEXT CHECK ($1 IN ($2))")
  },
  { label: "USING HASH/BTREE removido", apply: (sql) => sql.replace(/\s+USING\s+(HASH|BTREE)\b/gi, "") },
  {
    label: "CREATE OR REPLACE VIEW → DROP + CREATE",
    apply: (sql) => sql.replace(/^CREATE\s+OR\s+REPLACE\s+VIEW\s+(\w+)/i, "DROP VIEW IF EXISTS $1;\nCREATE VIEW $1")
  },
  {
    label: "IF no trigger → WHEN",
    apply: (sql) =>
      sql.replace(
        /FOR\s+EACH\s+ROW\s+BEGIN\s+IF\s+([\s\S]+?)\s+THEN\s+([\s\S]+?)\s+END\s+IF;\s*END/i,
        "FOR EACH ROW WHEN $1 BEGIN\n    $2\nEND"
      )
  },
  {
    label: "CONCAT → ||",
    apply: (sql) => rewriteCalls(sql, "CONCAT", (args) => `(${args.join(" || ")})`)
  },
  {
    label: "DATEDIFF → julianday",
    apply: (sql) =>
      rewriteCalls(sql, "DATEDIFF", ([end, start]) => `CAST(julianday(${end}) - julianday(${start}) AS INTEGER)`)
  },
  { label: "NOW() → CURRENT_TIMESTAMP", apply: (sql) => rewriteCalls(sql, "NOW", () => "CURRENT_TIMESTAMP") },
  { label: "CURDATE() → CURRENT_DATE", apply: (sql) => rewriteCalls(sql, "CURDATE", () => "CURRENT_DATE") },
  {
    label: "LAST_INSERT_ID → last_insert_rowid",
    apply: (sql) => rewriteCalls(sql, "LAST_INSERT_ID", () => "last_insert_rowid()")
  },
  {
    label: "SET @variável",
    apply: (sql) => sql.replace(/^SET\s+(@\w+)\s*:?=\s*([\s\S]+)$/i, `SELECT ($2) AS "${VARIABLE_PREFIX}$1"`)
  }
];

export interface Translation {
  sql: string;
  adaptations: string[];
  mysqlOnly: string[];
}

function mergeAlterForeignKeys(statements: ScriptStatement[]): ScriptStatement[] {
  const alters = statements.filter((statement) =>
    /^ALTER\s+TABLE\s+\w+\s+ADD\s+CONSTRAINT\s+\w+\s+FOREIGN\s+KEY/i.test(statement.text)
  );
  if (alters.length === 0) return statements;
  const merged = new Set<ScriptStatement>();
  const result = statements.map((statement) => {
    const table = statement.text.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1];
    if (!table) return statement;
    const constraints = alters
      .filter((alter) => alter.text.match(/^ALTER\s+TABLE\s+(\w+)/i)?.[1].toLowerCase() === table.toLowerCase())
      .map((alter) => {
        merged.add(alter);
        return alter.text.replace(/^ALTER\s+TABLE\s+\w+\s+ADD\s+/i, "");
      });
    if (constraints.length === 0) return statement;
    const text = statement.text.replace(/\)\s*$/, `,\n    ${constraints.join(",\n    ")}\n)`);
    return { ...statement, text };
  });
  return result.filter((statement) => !merged.has(statement));
}

export const isMysqlOnly = (text: string) => MYSQL_ONLY.test(text.trim());

export function translateStatements(original: ScriptStatement[]): Translation {
  const adaptations = new Set<string>();
  const mysqlOnly: string[] = [];
  const statements = mergeAlterForeignKeys(original);
  if (statements.length < original.length) adaptations.add("ALTER TABLE ADD FOREIGN KEY → CREATE TABLE");
  const translated = statements
    .filter((statement) => {
      if (IGNORED.test(statement.text)) {
        adaptations.add("USE/CREATE DATABASE ignorados");
        return false;
      }
      if (isMysqlOnly(statement.text)) {
        mysqlOnly.push(statement.keyword);
        return false;
      }
      return true;
    })
    .map((statement) =>
      rules.reduce((sql, rule) => {
        const next = rule.apply(sql);
        if (next !== sql) adaptations.add(rule.label);
        return next;
      }, statement.text)
    );
  return { sql: translated.map((sql) => `${sql};`).join("\n"), adaptations: [...adaptations], mysqlOnly };
}

export const translate = (source: string) => translateStatements(splitMysqlScript(source));
