const readmeModules = import.meta.glob<string>("../../../desafio-*/README.md", {
  query: "?raw",
  import: "default",
  eager: true
});

const sqlModules = import.meta.glob<string>(["../../../desafio-*/*.sql", "!../../../desafio-*/backup_*.sql"], {
  query: "?raw",
  import: "default",
  eager: true
});

export interface SourceFile {
  path: string;
  name: string;
  text: string | null;
}

export interface ChallengeSource {
  folder: string;
  number: number;
  readme: string;
  files: SourceFile[];
}

const toRepoPath = (modulePath: string) => modulePath.replace(/^(\.\.\/)+/, "");

const folderOf = (repoPath: string) => repoPath.split("/")[0];

const normalize = (text: string) => text.replace(/\r\n/g, "\n");

const linkedSqlNames = (readme: string) =>
  [...readme.matchAll(/\]\(([\w-]+\.sql)\)/g)].map((match) => match[1]);

function filesOf(folder: string, readme: string): SourceFile[] {
  const bundled = Object.keys(sqlModules)
    .map(toRepoPath)
    .filter((path) => folderOf(path) === folder)
    .map((path) => path.split("/")[1]);
  const names = [...new Set([...bundled, ...linkedSqlNames(readme)])].sort();
  return names.map((name) => {
    const path = `${folder}/${name}`;
    const raw = sqlModules[`../../../${path}`];
    return { path, name, text: raw === undefined ? null : normalize(raw) };
  });
}

export const challengeSources: ChallengeSource[] = Object.entries(readmeModules)
  .map(([modulePath, raw]) => {
    const folder = folderOf(toRepoPath(modulePath));
    const readme = normalize(raw);
    return {
      folder,
      number: Number(folder.match(/desafio-(\d+)/)?.[1] ?? 0),
      readme,
      files: filesOf(folder, readme)
    };
  })
  .sort((a, b) => a.number - b.number);

export const repoUrl = "https://github.com/leandromlmoreira/sql-lab";

export const fileUrl = (path: string) => `${repoUrl}/blob/master/${path}`;
