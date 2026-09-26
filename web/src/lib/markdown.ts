interface Section {
  heading: string;
  body: string;
}

const LIST_ITEM = /^\s*(?:\d+\.|-)\s+(.+)$/;

export const readmeTitle = (readme: string) => readme.match(/^#\s+(.+)$/m)?.[1].trim() ?? "";

export function sections(readme: string): Section[] {
  return readme
    .split(/^##\s+/m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split("\n");
      return { heading: heading.trim(), body: rest.join("\n") };
    });
}

const isProse = (line: string) => line.trim() !== "" && !/^\s*(#|```|\||-|\d+\.)/.test(line);

export function firstParagraph(text: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex(isProse);
  if (start === -1) return "";
  const end = lines.findIndex((line, index) => index > start && !isProse(line));
  return lines
    .slice(start, end === -1 ? undefined : end)
    .join(" ")
    .trim();
}

const cleanHeading = (heading: string) => heading.replace(/\s*\(\[.*$/, "").replace(/^\d+\.\s*/, "").trim();

export function readmeSummary(readme: string): string {
  const intro = readme.replace(/^#\s+.+$/m, "").split(/^##\s/m)[0];
  return firstParagraph(intro) || sections(readme).map((section) => cleanHeading(section.heading)).join(" · ");
}

export const listItems = (text: string) =>
  text
    .split("\n")
    .map((line) => line.match(LIST_ITEM)?.[1].trim())
    .filter((item): item is string => Boolean(item));

export function firstList(readme: string): string[] {
  const lines = readme.split("\n");
  const start = lines.findIndex((line) => LIST_ITEM.test(line));
  if (start === -1) return [];
  const end = lines.findIndex((line, index) => index > start && !LIST_ITEM.test(line) && line.trim() !== "");
  return listItems(lines.slice(start, end === -1 ? undefined : end).join("\n"));
}

export function numberedList(readme: string, headingPattern: RegExp): string[] {
  const section = sections(readme).find((item) => headingPattern.test(item.heading));
  return section ? listItems(section.body) : [];
}

function afterIdentifier(item: string, identifier: string): string {
  const index = item.indexOf(`\`${identifier}\``);
  const tail = item.slice(index + identifier.length + 2);
  const separator = tail.match(/\s[—–]\s|:\s/);
  return (separator ? tail.slice((separator.index ?? 0) + separator[0].length) : tail).replace(/^\*+|\*+$/g, "").trim();
}

export function describe(readme: string, identifier: string): string {
  const item = listItems(readme).find((line) => line.includes(`\`${identifier}\``));
  if (item) return afterIdentifier(item, identifier);
  const section = sections(readme).find((entry) => entry.heading.includes(identifier));
  return section ? firstParagraph(section.body) : "";
}

const indentOf = (line: string) => line.match(/^\s*/)?.[0].length ?? 0;

export function subItems(readme: string, identifier: string): string[] {
  const lines = readme.split("\n");
  const start = lines.findIndex((line) => LIST_ITEM.test(line) && line.includes(`\`${identifier}\``));
  if (start !== -1) {
    const children: string[] = [];
    for (const line of lines.slice(start + 1)) {
      if (!LIST_ITEM.test(line) || indentOf(line) <= indentOf(lines[start])) break;
      children.push(line.match(LIST_ITEM)?.[1].trim() ?? "");
    }
    return children;
  }
  const section = sections(readme).find((entry) => entry.heading.includes(identifier));
  return section ? listItems(section.body) : [];
}

export function sectionTitle(readme: string, identifier: string): string {
  return cleanHeading(sections(readme).find((entry) => entry.heading.includes(identifier))?.heading ?? "");
}

function plainBlocks(text: string): string[] {
  const blocks: string[] = [];
  let current: string[] | null = null;
  let plain = false;
  for (const line of text.split("\n")) {
    const fence = line.match(/^\s*```(\w*)/);
    if (fence && current === null) {
      current = [];
      plain = fence[1] === "";
    } else if (fence && current !== null) {
      if (plain) blocks.push(current.join("\n"));
      current = null;
    } else if (current !== null) {
      current.push(line);
    }
  }
  return blocks;
}

export function recordedOutput(readme: string, identifier: string): string | null {
  const section = sections(readme).find((entry) => entry.heading.includes(identifier));
  const scoped = section ? plainBlocks(section.body) : [];
  return scoped[0] ?? plainBlocks(readme)[0] ?? null;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const inlineMarkdown = (text: string) =>
  escapeHtml(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

export const stripMarkdown = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*]/g, "")
    .trim();
