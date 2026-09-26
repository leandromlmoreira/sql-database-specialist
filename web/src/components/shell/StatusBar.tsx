interface StatusBarProps {
  workspace: string;
  tables: number;
  views: number;
  cursor: { line: number; column: number };
}

export function StatusBar({ workspace, tables, views, cursor }: StatusBarProps) {
  return (
    <footer class="statusbar">
      <span class="status-item is-live">
        <span class="engine-dot" />
        Tudo roda no seu navegador · nenhum dado sai daqui
      </span>
      <span class="status-item">
        {workspace} · {tables} tabelas{views > 0 ? ` · ${views} views` : ""}
      </span>
      <span class="status-spacer" />
      <span class="status-item">Dialeto MySQL → SQLite</span>
      <span class="status-item">
        Ln {cursor.line}, Col {cursor.column}
      </span>
    </footer>
  );
}
