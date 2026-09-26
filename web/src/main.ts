import initSqlJs, { type Database, type QueryExecResult } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "./style.css";
import { diagramSvg } from "./diagram";
import { schemaSql, seedSql, queries, type PlaygroundQuery } from "./data";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="hero">
    <span class="eyebrow">sql-database-specialist</span>
    <h1>Playground SQL do e-commerce</h1>
    <p>
      Explore o modelo lógico de e-commerce do repositório
      <a href="https://github.com/leandromlmoreira/sql-database-specialist" target="_blank" rel="noreferrer">sql-database-specialist</a>
      direto no navegador. Escolha uma consulta real, entenda a pergunta de negócio por trás dela, edite o SQL e veja o resultado.
    </p>
    <span class="badge">Rodando em SQLite (WebAssembly) &middot; projeto original em MySQL</span>
  </header>

  <section aria-labelledby="diagram-heading">
    <h2 id="diagram-heading">Diagrama das tabelas</h2>
    <div class="diagram-wrap">${diagramSvg}</div>
  </section>

  <section aria-labelledby="playground-heading">
    <h2 id="playground-heading">Consultas</h2>
    <div class="panel">
      <div class="query-picker" id="query-picker" role="listbox" aria-label="Consultas disponíveis"></div>

      <div class="editor-wrap">
        <div class="editor-shell">
          <pre id="highlight" aria-hidden="true"><code class="language-sql"></code></pre>
          <textarea id="editor" spellcheck="false" aria-label="Editor SQL"></textarea>
        </div>
      </div>

      <div class="actions">
        <button class="run" id="run-btn" type="button">Executar</button>
        <span class="status" id="status"></span>
      </div>

      <div id="result-area"></div>
    </div>
  </section>

  <footer>
    Dados fictícios, gerados em memória a cada carregamento da página. Nenhuma informação é enviada a um servidor.
  </footer>
`;

const pickerEl = document.querySelector<HTMLDivElement>("#query-picker")!;
const editorEl = document.querySelector<HTMLTextAreaElement>("#editor")!;
const highlightEl = document.querySelector<HTMLElement>("#highlight code")!;
const statusEl = document.querySelector<HTMLSpanElement>("#status")!;
const resultAreaEl = document.querySelector<HTMLDivElement>("#result-area")!;
const runBtn = document.querySelector<HTMLButtonElement>("#run-btn")!;

let activeQueryId = queries[0]?.id ?? "";

function renderPicker(): void {
  pickerEl.innerHTML = queries
    .map(
      (query) => `
        <button type="button" class="query-option ${query.id === activeQueryId ? "active" : ""}" data-id="${query.id}" role="option" aria-selected="${query.id === activeQueryId}">
          <strong>${query.pergunta}</strong>
          <span>${query.id}</span>
        </button>
      `
    )
    .join("");

  pickerEl.querySelectorAll<HTMLButtonElement>(".query-option").forEach((button) => {
    button.addEventListener("click", () => {
      const query = queries.find((item) => item.id === button.dataset.id);
      if (!query) return;
      activeQueryId = query.id;
      setEditorValue(query.sql);
      renderPicker();
      runQuery(query.sql);
    });
  });
}

function setEditorValue(sql: string): void {
  editorEl.value = sql;
  updateHighlight();
}

function updateHighlight(): void {
  const grammar = Prism.languages.sql;
  highlightEl.innerHTML = grammar ? Prism.highlight(editorEl.value, grammar, "sql") : editorEl.value;
}

function renderResults(results: QueryExecResult[]): void {
  if (results.length === 0) {
    resultAreaEl.innerHTML = `<div class="empty-state">A consulta rodou, mas não retornou linhas.</div>`;
    return;
  }

  const { columns, values } = results[0];
  const head = columns.map((column: string) => `<th>${column}</th>`).join("");
  const rows = values
    .map(
      (row: unknown[]) => `<tr>${row.map((cell) => `<td>${formatCell(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  resultAreaEl.innerHTML = `
    <div class="result-wrap">
      <table class="result">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "<span style=\"color:#B9B8B4\">null</span>";
  return String(value);
}

let db: Database | null = null;

async function bootDatabase(): Promise<void> {
  statusEl.textContent = "Carregando SQLite (WebAssembly)...";
  const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
  db = new SQL.Database();
  db.run(schemaSql);
  db.run(seedSql);
  statusEl.textContent = "Banco pronto.";
}

function runQuery(sql: string): void {
  if (!db) {
    statusEl.textContent = "Banco ainda carregando, aguarde um instante.";
    statusEl.classList.add("error");
    return;
  }

  try {
    const results = db.exec(sql);
    statusEl.classList.remove("error");
    statusEl.textContent = `Executado com sucesso.`;
    renderResults(results);
  } catch (error) {
    statusEl.classList.add("error");
    statusEl.textContent = error instanceof Error ? error.message : "Erro ao executar a consulta.";
    resultAreaEl.innerHTML = "";
  }
}

editorEl.addEventListener("input", updateHighlight);
editorEl.addEventListener("scroll", () => {
  const pre = document.querySelector<HTMLElement>("#highlight")!;
  pre.scrollTop = editorEl.scrollTop;
  pre.scrollLeft = editorEl.scrollLeft;
});

runBtn.addEventListener("click", () => runQuery(editorEl.value));

function findInitialQuery(): PlaygroundQuery | undefined {
  return queries.find((query) => query.id === activeQueryId);
}

renderPicker();
const initialQuery = findInitialQuery();
if (initialQuery) setEditorValue(initialQuery.sql);

bootDatabase()
  .then(() => {
    if (initialQuery) runQuery(initialQuery.sql);
  })
  .catch((error) => {
    statusEl.classList.add("error");
    statusEl.textContent = `Falha ao iniciar o SQLite: ${error instanceof Error ? error.message : String(error)}`;
  });
