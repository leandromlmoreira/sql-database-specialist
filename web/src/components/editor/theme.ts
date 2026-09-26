import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const editorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      color: "var(--text)",
      backgroundColor: "transparent",
      fontSize: "13.5px"
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      lineHeight: "1.75",
      overflow: "auto"
    },
    ".cm-content": { padding: "14px 0 24px", caretColor: "var(--accent)" },
    ".cm-line": { padding: "0 20px 0 14px" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "var(--text-4)",
      border: "none",
      paddingLeft: "10px"
    },
    ".cm-lineNumbers .cm-gutterElement": { minWidth: "28px", padding: "0 6px 0 0", fontSize: "12px" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--accent)" },
    ".cm-activeLine": { backgroundColor: "var(--active-line)" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)", borderLeftWidth: "2px" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: "var(--selection) !important"
    },
    ".cm-matchingBracket": { backgroundColor: "var(--accent-soft)", color: "var(--text) !important", outline: "none" },
    ".cm-placeholder": { color: "var(--text-4)" },
    ".cm-tooltip": {
      border: "1px solid var(--line-2)",
      backgroundColor: "var(--bg-3)",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "var(--shadow-pop)"
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      fontFamily: "var(--font-mono)",
      fontSize: "12.5px",
      maxHeight: "240px",
      padding: "4px"
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
      padding: "4px 10px 4px 6px",
      borderRadius: "6px",
      color: "var(--text-2)"
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "var(--accent-soft)",
      color: "var(--text)"
    },
    ".cm-completionIcon": { opacity: "0.7", width: "1.4em" },
    ".cm-completionDetail": { color: "var(--text-4)", fontStyle: "normal", marginLeft: "10px" },
    ".cm-completionMatchedText": { color: "var(--accent)", textDecoration: "none" }
  },
  { dark: true }
);

export const editorHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, color: "var(--syntax-keyword)", fontWeight: "500" },
    { tag: [tags.operatorKeyword, tags.modifier], color: "var(--syntax-keyword)" },
    { tag: [tags.string, tags.special(tags.string)], color: "var(--syntax-string)" },
    { tag: [tags.number, tags.bool, tags.null], color: "var(--syntax-number)" },
    { tag: [tags.typeName, tags.standard(tags.name)], color: "var(--syntax-type)" },
    { tag: [tags.function(tags.variableName), tags.special(tags.name)], color: "var(--syntax-function)" },
    { tag: tags.comment, color: "var(--text-4)", fontStyle: "italic" },
    { tag: [tags.punctuation, tags.operator, tags.bracket], color: "var(--text-3)" },
    { tag: [tags.variableName, tags.name, tags.propertyName], color: "var(--text)" }
  ])
);
