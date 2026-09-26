export interface ScriptStatement {
  text: string;
  keyword: string;
}

const leadingKeyword = (text: string) =>
  text
    .replace(/^(\s|--[^\n]*\n)+/, "")
    .split(/\s+/)
    .slice(0, 2)
    .join(" ")
    .toUpperCase();

function scanUntil(source: string, start: number, delimiter: string): number {
  let quote: string | null = null;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") quote = char;
    else if (char === "-" && source[index + 1] === "-") index = source.indexOf("\n", index) === -1 ? source.length : source.indexOf("\n", index);
    else if (source.startsWith(delimiter, index)) return index;
  }
  return source.length;
}

export function splitMysqlScript(source: string): ScriptStatement[] {
  const statements: ScriptStatement[] = [];
  let delimiter = ";";
  let cursor = 0;
  while (cursor < source.length) {
    const rest = source.slice(cursor);
    const directive = rest.match(/^\s*DELIMITER\s+(\S+)[^\n]*\n?/i);
    if (directive) {
      delimiter = directive[1];
      cursor += directive[0].length;
      continue;
    }
    const end = scanUntil(source, cursor, delimiter);
    const text = source.slice(cursor, end).trim();
    if (text) statements.push({ text, keyword: leadingKeyword(text) });
    cursor = end + delimiter.length;
  }
  return statements;
}

export const joinStatements = (statements: ScriptStatement[]) =>
  statements.map((statement) => `${statement.text};`).join("\n\n");
