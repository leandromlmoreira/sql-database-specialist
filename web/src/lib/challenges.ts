import { challengeSources, type ChallengeSource, type SourceFile } from "./sources";
import {
  describe,
  firstList,
  numberedList,
  readmeSummary,
  readmeTitle,
  recordedOutput,
  sectionTitle,
  stripMarkdown,
  subItems
} from "./markdown";
import { joinStatements, splitMysqlScript, type ScriptStatement } from "./splitter";
import { isMysqlOnly } from "./dialect";
import { databaseOf, workspaceOfText, workspaceSpecs } from "./workspaces";

export type ItemKind = "query" | "index" | "view" | "demo" | "reference" | "model";

export interface IndexProbe {
  table: string;
  column: string;
}

export interface ChallengeItem {
  id: string;
  kind: ItemKind;
  title: string;
  detail: string;
  notes: string[];
  workspace: string;
  file: string;
  sql: string | null;
  probe: IndexProbe | null;
  code: string | null;
  output: string | null;
}

export interface Challenge {
  id: string;
  number: number;
  title: string;
  summary: string;
  tags: string[];
  workspace: string;
  files: SourceFile[];
  items: ChallengeItem[];
}

type Draft = Omit<ChallengeItem, "id" | "workspace" | "file" | "notes" | "sql" | "probe" | "code" | "output"> &
  Partial<ChallengeItem>;

const KIND_ORDER: ItemKind[] = ["model", "query", "index", "view", "demo", "reference"];

const statementsOf =(file: SourceFile) =>
  splitMysqlScript(file.text ?? "").filter((statement) => !/^USE\s/i.test(statement.text));

function queryItems(challenge: ChallengeSource, file: SourceFile): Draft[] {
  const questions = numberedList(challenge.readme, /Perguntas/i);
  return statementsOf(file).map((statement, index) => {
    const [question, technique = ""] = (questions[index] ?? `Consulta ${index + 1}`).split(/\s[—–]\s/);
    return { kind: "query", title: question, detail: technique, sql: `${statement.text};` };
  });
}

function indexItems(challenge: ChallengeSource, file: SourceFile): Draft[] {
  return statementsOf(file).flatMap((statement) => {
    const match = statement.text.match(/^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(\w+)\s+ON\s+(\w+)\s*\(\s*(\w+)/i);
    if (!match) return [];
    const [, name, table, column] = match;
    return [{ kind: "index", title: name, detail: describe(challenge.readme, name), probe: { table, column } }];
  });
}

function viewItems(challenge: ChallengeSource, file: SourceFile): Draft[] {
  return statementsOf(file).flatMap((statement) => {
    const name = statement.text.match(/^CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+(\w+)/i)?.[1];
    return name ? [{ kind: "view", title: name, detail: describe(challenge.readme, name), sql: `SELECT *\nFROM ${name};` }] : [];
  });
}

function demoBlocks(statements: ScriptStatement[]): ScriptStatement[][] {
  const runnable = statements.filter((statement) => !/^(CREATE|DROP|ALTER)\b/i.test(statement.keyword));
  return runnable.reduce<ScriptStatement[][]>((blocks, statement, index) => {
    const current = blocks[blocks.length - 1];
    current.push(statement);
    const closesBlock = /^SELECT\b/i.test(statement.keyword) && !/^SELECT\b/i.test(runnable[index + 1]?.keyword ?? "");
    if (closesBlock && index < runnable.length - 1) blocks.push([]);
    return blocks;
  }, [[]]);
}

const EVENT_PATTERN: Record<string, (table: string) => RegExp> = {
  DELETE: (table) => new RegExp(`DELETE\\s+FROM\\s+${table}\\b`, "i"),
  UPDATE: (table) => new RegExp(`UPDATE\\s+${table}\\b`, "i"),
  INSERT: (table) => new RegExp(`INSERT\\s+INTO\\s+${table}\\b`, "i")
};

function triggerItems(challenge: ChallengeSource, file: SourceFile): Draft[] {
  const statements = statementsOf(file);
  const blocks = demoBlocks(statements);
  return statements.flatMap((statement) => {
    const match = statement.text.match(/^CREATE\s+TRIGGER\s+(\w+)\s+(?:BEFORE|AFTER)\s+(INSERT|UPDATE|DELETE)\s+ON\s+(\w+)/i);
    if (!match) return [];
    const [, name, event, table] = match;
    const block = blocks.find((candidate) => EVENT_PATTERN[event.toUpperCase()](table).test(joinStatements(candidate)));
    return [{ kind: "demo", title: name, detail: describe(challenge.readme, name), sql: block ? joinStatements(block) : null }];
  });
}

function referenceItem(challenge: ChallengeSource, file: SourceFile): Draft {
  const routine = file.text?.match(/CREATE\s+PROCEDURE\s+(\w+)/i)?.[1];
  const detail = describe(challenge.readme, file.name) || (routine ? describe(challenge.readme, routine) : "");
  return {
    kind: "reference",
    title: routine ?? (sectionTitle(challenge.readme, file.name) || file.name),
    detail,
    notes: subItems(challenge.readme, file.name),
    code: file.text,
    output: file.text ? recordedOutput(challenge.readme, file.name) : null
  };
}

function scriptItem(challenge: ChallengeSource, file: SourceFile): Draft {
  return {
    kind: "demo",
    title: sectionTitle(challenge.readme, file.name) || file.name,
    detail: describe(challenge.readme, file.name),
    sql: joinStatements(statementsOf(file))
  };
}

function fileItems(challenge: ChallengeSource, file: SourceFile): Draft[] {
  const text = file.text;
  if (text === null) return [referenceItem(challenge, file)];
  if (file.name === "queries.sql") return queryItems(challenge, file);
  if (file.name === "schema.sql") return indexItems(challenge, file);
  if (file.name === "seed.sql") return [];
  if (/CREATE\s+TRIGGER/i.test(text)) return triggerItems(challenge, file);
  if (/CREATE\s+(OR\s+REPLACE\s+)?VIEW/i.test(text)) return viewItems(challenge, file);
  if (splitMysqlScript(text).some((statement) => isMysqlOnly(statement.text))) return [referenceItem(challenge, file)];
  return [scriptItem(challenge, file)];
}

const linkedWorkspace = (challenge: ChallengeSource) => {
  const linked = [...challenge.readme.matchAll(/\]\(\.\.\/(desafio-[\w-]+)\/?\)/g)].map((match) => match[1]);
  return workspaceSpecs.find((spec) => linked.includes(spec.origin))?.id ?? workspaceSpecs[0]?.id ?? "";
};

function modelItems(challenge: ChallengeSource): Draft[] {
  return [
    {
      kind: "model",
      title: "Modelo lógico no diagrama ER",
      detail: "Abre as tabelas que implementam este modelo, com chaves e relacionamentos.",
      notes: firstList(challenge.readme),
      workspace: linkedWorkspace(challenge)
    }
  ];
}

const TAGS: [RegExp, string][] = [
  [/erDiagram/, "EER"],
  [/CREATE\s+TABLE/i, "DDL"],
  [/CREATE\s+(UNIQUE\s+)?INDEX/i, "Índices"],
  [/CREATE\s+PROCEDURE/i, "Procedures"],
  [/CREATE\s+(OR\s+REPLACE\s+)?VIEW/i, "Views"],
  [/GRANT\s/i, "Permissões"],
  [/CREATE\s+TRIGGER/i, "Triggers"],
  [/START\s+TRANSACTION|SAVEPOINT/i, "Transações"],
  [/mysqldump/, "Backup"]
];

function tagsOf(challenge: ChallengeSource): string[] {
  const corpus = [challenge.readme, ...challenge.files.map((file) => file.text ?? "")].join("\n");
  const tags = TAGS.filter(([pattern]) => pattern.test(corpus)).map(([, tag]) => tag);
  return challenge.files.some((file) => file.name === "queries.sql") ? [...tags, "Consultas"] : tags;
}

function workspaceOf(challenge: ChallengeSource): string {
  const file = challenge.files.find((candidate) => candidate.text && databaseOf(candidate.text));
  return file?.text ? workspaceOfText(file.text) : linkedWorkspace(challenge);
}

function tidyDetail(detail: string, title: string): string {
  const text = detail.replace(new RegExp(`^\`${title}\`:?\\s*`), "").replace(/:$/, "").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildChallenge(challenge: ChallengeSource): Challenge {
  const workspace = workspaceOf(challenge);
  const drafts = challenge.files.length === 0 ? modelItems(challenge) : challenge.files.flatMap((file) =>
    fileItems(challenge, file).map((draft) => ({
      ...draft,
      file: file.path,
      workspace: file.text && databaseOf(file.text) ? workspaceOfText(file.text) : workspace
    }))
  );
  const ordered = [...drafts].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
  const items = ordered.map((draft, index) => ({
    id: `${challenge.folder}#${index + 1}`,
    workspace,
    file: challenge.folder,
    notes: [],
    sql: null,
    probe: null,
    code: null,
    output: null,
    ...draft,
    title: stripMarkdown(draft.title),
    detail: tidyDetail(draft.detail, stripMarkdown(draft.title))
  }));
  return {
    id: challenge.folder,
    number: challenge.number,
    title: readmeTitle(challenge.readme),
    summary: readmeSummary(challenge.readme),
    tags: tagsOf(challenge),
    workspace,
    files: challenge.files,
    items
  };
}

export const challenges: Challenge[] = challengeSources.map(buildChallenge);

export const findItem = (id: string) =>
  challenges.flatMap((challenge) => challenge.items).find((item) => item.id === id) ?? null;
