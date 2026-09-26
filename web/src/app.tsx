import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { challenges, type ChallengeItem } from "./lib/challenges";
import { completionSchema, type TableInfo } from "./lib/schema";
import { workspaceSpecs } from "./lib/workspaces";
import { indexProbeSql, tablePreviewSql } from "./lib/probe";
import type { HistoryEntry } from "./lib/history";
import { useWorkspaces } from "./hooks/useWorkspaces";
import { useSession } from "./hooks/useSession";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { TopBar } from "./components/shell/TopBar";
import { EditorPanel, type QueryContext } from "./components/shell/EditorPanel";
import { BottomPanel, type BottomTab } from "./components/shell/BottomPanel";
import { StatusBar } from "./components/shell/StatusBar";
import { MobileNav, type MobileTab } from "./components/shell/MobileNav";
import { PanelHeader } from "./components/shell/PanelHeader";
import { SqlEditor } from "./components/editor/SqlEditor";
import { ResultView } from "./components/results/ResultView";
import { HistoryList } from "./components/HistoryList";
import { ErDiagram } from "./components/er/ErDiagram";
import { SchemaTree } from "./components/schema/SchemaTree";
import { SchemaStats } from "./components/schema/SchemaStats";
import { ChallengeList } from "./components/challenges/ChallengeList";
import { Toast } from "./components/ui/Toast";
import { LoadingState } from "./components/results/ResultStates";

const MOBILE_BOTTOM: Partial<Record<MobileTab, BottomTab>> = { query: "result", er: "er", history: "history" };

const EMPTY_SCHEMA = { tables: [], relations: [] };

function contextOf(item: ChallengeItem): QueryContext {
  const challenge = challenges.find((entry) => entry.items.includes(item));
  const position = challenge ? challenge.items.indexOf(item) + 1 : 0;
  const file = item.file.split("/").pop() ?? "";
  const label = item.kind === "query" ? `${file} · Q${position}` : file;
  return { title: item.title, detail: item.detail, crumbs: [item.workspace, item.file.split("/")[0], label], kind: item.kind };
}

export function App() {
  const lab = useWorkspaces();
  const session = useSession();
  const isMobile = useMediaQuery("(max-width: 1099px)");
  const [activeId, setActiveId] = useState(workspaceSpecs[0]?.id ?? "");
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>("result");
  const [mobileTab, setMobileTab] = useState<MobileTab>("challenges");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [toast, setToast] = useState<string | null>(null);
  const booted = useRef(false);

  const workspace = lab.workspaces[activeId];
  const schema = workspace?.schema ?? EMPTY_SCHEMA;
  const completion = useMemo(() => completionSchema(schema), [schema]);
  const tab = isMobile ? (MOBILE_BOTTOM[mobileTab] ?? "result") : bottomTab;

  const runIn = (id: string, source: string, title: string) => {
    const target = lab.workspaces[id];
    if (!target) return;
    session.run(target, source, title);
    lab.refresh(id);
    setBottomTab("result");
  };

  const loadItem = (item: ChallengeItem) => {
    setActiveId(item.workspace);
    setActiveItem(item.id);
    if (item.kind === "model") {
      setBottomTab("er");
      setMobileTab("er");
      return;
    }
    const target = lab.workspaces[item.workspace];
    const sql = item.sql ?? (item.probe && target ? indexProbeSql(target, item.probe) : "");
    session.setContext(contextOf(item));
    session.loadText(sql);
    runIn(item.workspace, sql, item.title);
    setMobileTab("query");
  };

  const openHistory = (entry: HistoryEntry) => {
    setActiveId(entry.workspace);
    setActiveItem(null);
    session.setContext({ title: entry.title, detail: "", crumbs: [entry.workspace, "histórico"], kind: "history" });
    session.loadText(entry.sql);
    runIn(entry.workspace, entry.sql, entry.title);
    setMobileTab("query");
  };

  const previewTable = (table: TableInfo) => {
    const sql = tablePreviewSql(table.name);
    setActiveItem(null);
    session.setContext({
      title: `Conteúdo de ${table.name}`,
      detail: `${table.kind === "view" ? "View" : "Tabela"} com ${table.columns.length} colunas e ${table.rowCount} linhas.`,
      crumbs: [activeId, table.kind === "view" ? "views" : "tabelas", table.name],
      kind: "table"
    });
    session.loadText(sql);
    runIn(activeId, sql, `Conteúdo de ${table.name}`);
    setMobileTab("query");
  };

  const runEditor = () => runIn(activeId, session.currentText(), session.context.title);

  const resetDatabase = async () => {
    await lab.reset(activeId);
    session.resetOutcome();
    setToast(`${activeId} recriado a partir dos scripts do repositório`);
  };

  useEffect(() => {
    if (lab.booting || booted.current) return;
    booted.current = true;
    const first = challenges.flatMap((challenge) => challenge.items).find((item) => item.kind === "query");
    if (first) loadItem(first);
    setMobileTab("challenges");
  }, [lab.booting]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      runEditor();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const tables = schema.tables.filter((table) => table.kind === "table").length;

  return (
    <div class={`app${lab.booting ? " is-booting" : ""}`} data-mobile-tab={mobileTab}>
      <TopBar
        specs={workspaceSpecs}
        workspaces={lab.workspaces}
        active={activeId}
        version={lab.version}
        booting={lab.booting}
        onSwitch={setActiveId}
        onReset={resetDatabase}
      />
      <main class="workbench">
        <aside class="panel sidebar" data-slot="schema" aria-label="Schema">
          <PanelHeader eyebrow="Explorer" title={activeId.replace(/_desafio$/, "")} meta={`${tables} tabelas`} />
          {workspace ? <SchemaTree key={activeId} schema={schema} onPreview={previewTable} /> : <LoadingState label="Lendo schema…" />}
          <SchemaStats schema={schema} />
        </aside>
        <div class="main-column" data-slot="main" data-tab={tab}>
          <EditorPanel context={session.context} disabled={!workspace} onRun={runEditor}>
            <SqlEditor
              schema={completion}
              wrap={isMobile}
              onEdit={() => session.setContext((current) => (current.edited ? current : { ...current, edited: true }))}
              onRun={runEditor}
              onCursor={(line, column) => setCursor({ line, column })}
              handle={session.attachEditor}
            />
          </EditorPanel>
          <BottomPanel
            tab={tab}
            onTab={setBottomTab}
            outcome={session.outcome}
            historyCount={session.history.length}
            showTabs={!isMobile}
          >
            {tab === "result" && <ResultView booting={lab.booting} outcome={session.outcome} runId={session.runId} />}
            <div class="er-slot" hidden={tab !== "er"}>
              {workspace && (
                <ErDiagram
                  workspace={activeId}
                  schema={schema}
                  stored={lab.positions[activeId] ?? null}
                  visible={tab === "er"}
                  onPositions={(next) => lab.storePositions(activeId, next)}
                />
              )}
            </div>
            {tab === "history" && <HistoryList entries={session.history} onOpen={openHistory} onClear={session.clear} />}
          </BottomPanel>
        </div>
        <aside class="panel challenges-panel" data-slot="challenges" aria-label="Desafios">
          <PanelHeader eyebrow="Repositório" title="Desafios" meta={`${challenges.length} módulos`} />
          <ChallengeList challenges={challenges} activeItem={activeItem} onLoad={loadItem} />
        </aside>
      </main>
      <StatusBar
        workspace={activeId}
        tables={tables}
        views={schema.tables.length - tables}
        cursor={cursor}
      />
      <MobileNav tab={mobileTab} onTab={setMobileTab} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
