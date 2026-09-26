import { useEffect, useRef } from "preact/hooks";
import { Compartment, EditorState, Prec, Transaction } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete";
import { MySQL, sql } from "@codemirror/lang-sql";
import { editorHighlight, editorTheme } from "./theme";

export interface EditorHandle {
  text: () => string;
  runnableText: () => string;
  load: (text: string) => void;
}

interface SqlEditorProps {
  schema: Record<string, string[]>;
  wrap: boolean;
  onRun: () => void;
  onEdit: () => void;
  onCursor: (line: number, column: number) => void;
  handle: (api: EditorHandle) => void;
}

const language = (schema: Record<string, string[]>) =>
  sql({ dialect: MySQL, schema, upperCaseKeywords: true });

export function SqlEditor({ schema, wrap, onRun, onEdit, onCursor, handle }: SqlEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const languageSlot = useRef(new Compartment());
  const wrapSlot = useRef(new Compartment());
  const callbacks = useRef({ onRun, onEdit, onCursor });
  callbacks.current = { onRun, onEdit, onCursor };

  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: "",
        extensions: [
          Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => (callbacks.current.onRun(), true) }])),
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          bracketMatching(),
          closeBrackets(),
          autocompletion({ activateOnTyping: true, icons: true }),
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap]),
          languageSlot.current.of(language(schema)),
          editorHighlight,
          editorTheme,
          wrapSlot.current.of(wrap ? EditorView.lineWrapping : []),
          EditorView.contentAttributes.of({ "aria-label": "Editor SQL" }),
          placeholder("Escreva uma consulta SQL…  Ctrl+Enter executa"),
          EditorView.updateListener.of((update) => {
            if (update.transactions.some((transaction) => transaction.docChanged && transaction.annotation(Transaction.userEvent))) {
              callbacks.current.onEdit();
            }
            if (!update.selectionSet && !update.docChanged) return;
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            callbacks.current.onCursor(line.number, head - line.from + 1);
          })
        ]
      })
    });
    view.current = editor;
    handle({
      text: () => editor.state.doc.toString(),
      runnableText: () => {
        const { from, to } = editor.state.selection.main;
        return from === to ? editor.state.doc.toString() : editor.state.sliceDoc(from, to);
      },
      load: (text) => {
        editor.dispatch({
          changes: { from: 0, to: editor.state.doc.length, insert: text },
          selection: { anchor: text.length }
        });
      }
    });
    return () => editor.destroy();
  }, []);

  useEffect(() => {
    view.current?.dispatch({ effects: languageSlot.current.reconfigure(language(schema)) });
  }, [schema]);

  useEffect(() => {
    view.current?.dispatch({ effects: wrapSlot.current.reconfigure(wrap ? EditorView.lineWrapping : []) });
  }, [wrap]);

  return <div class="sql-editor" ref={host} />;
}
