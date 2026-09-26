import { challengeSources, type ChallengeSource, type SourceFile } from "./sources";
import { readmeTitle } from "./markdown";
import { splitMysqlScript, type ScriptStatement } from "./splitter";
import { isMysqlOnly } from "./dialect";

export interface WorkspaceSpec {
  id: string;
  domain: string;
  origin: string;
  boot: ScriptStatement[];
}

export const databaseOf = (text: string) =>
  text.match(/\bCREATE\s+DATABASE\s+(\w+)/i)?.[1] ??
  text.match(/^\s*USE\s+(\w+)\s*;/im)?.[1] ??
  text.match(/\bON\s+(\w+)\.[\w*]/i)?.[1] ??
  null;

const BOOT_FILES = ["schema.sql", "seed.sql"];

const isSetupStatement = (statement: ScriptStatement) =>
  /^(CREATE|DROP|ALTER)\b/i.test(statement.keyword) && !isMysqlOnly(statement.text);

const fileOf = (challenge: ChallengeSource, name: string) => challenge.files.find((file) => file.name === name);

const extensionFiles = (database: string) =>
  challengeSources.flatMap((challenge) =>
    challenge.files.filter(
      (file): file is SourceFile & { text: string } =>
        file.text !== null && !BOOT_FILES.includes(file.name) && databaseOf(file.text) === database
    )
  );

function bootStatements(challenge: ChallengeSource, database: string): ScriptStatement[] {
  const base = BOOT_FILES.flatMap((name) => splitMysqlScript(fileOf(challenge, name)?.text ?? ""));
  const extensions = extensionFiles(database).flatMap((file) =>
    splitMysqlScript(file.text).filter(isSetupStatement)
  );
  return [...base, ...extensions];
}

const domainOf = (challenge: ChallengeSource) => readmeTitle(challenge.readme).split(/\s[—–-]\s/).pop() ?? challenge.folder;

export const workspaceSpecs: WorkspaceSpec[] = challengeSources.flatMap((challenge) => {
  const schema = fileOf(challenge, "schema.sql");
  const database = schema?.text ? databaseOf(schema.text) : null;
  if (!database) return [];
  return [{ id: database, domain: domainOf(challenge), origin: challenge.folder, boot: bootStatements(challenge, database) }];
});

export const workspaceOfText = (text: string) => {
  const database = databaseOf(text);
  return workspaceSpecs.find((spec) => spec.id === database)?.id ?? workspaceSpecs[0]?.id ?? "";
};
