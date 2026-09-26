import { highlightCode, classHighlighter } from "@lezer/highlight";
import { MySQL } from "@codemirror/lang-sql";

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlightSql(code: string): string {
  let html = "";
  highlightCode(
    code,
    MySQL.language.parser.parse(code),
    classHighlighter,
    (text, classes) => {
      html += classes ? `<span class="${classes}">${escapeHtml(text)}</span>` : escapeHtml(text);
    },
    () => {
      html += "\n";
    }
  );
  return html;
}
