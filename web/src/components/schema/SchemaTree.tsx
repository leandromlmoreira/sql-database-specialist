import { useMemo, useState } from "preact/hooks";
import type { SchemaInfo, TableInfo } from "../../lib/schema";
import { Icon } from "../Icon";
import { ColumnRow } from "./ColumnRow";
import { Collapse } from "../ui/Collapse";

interface SchemaTreeProps {
  schema: SchemaInfo;
  onPreview: (table: TableInfo) => void;
}

function TableRow({ table, onPreview }: { table: TableInfo; onPreview: (table: TableInfo) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li class={open ? "tree-table is-open" : "tree-table"}>
      <div class="tree-row">
        <button type="button" class="tree-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name="chevron" size={13} class="tree-chevron" />
          <Icon name={table.kind === "view" ? "view" : "table"} size={15} class="tree-kind" />
          <span class="tree-name">{table.name}</span>
          <span class="tree-count">{table.rowCount}</span>
        </button>
        <button type="button" class="tree-action" onClick={() => onPreview(table)} aria-label={`Consultar ${table.name}`} title="SELECT * FROM">
          <Icon name="play" size={12} filled />
        </button>
      </div>
      <Collapse open={open}>
        <ul class="tree-columns">
          {table.columns.map((column) => (
            <ColumnRow key={column.name} column={column} />
          ))}
        </ul>
      </Collapse>
    </li>
  );
}

export function SchemaTree({ schema, onPreview }: SchemaTreeProps) {
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return schema.tables;
    return schema.tables.filter(
      (table) => table.name.toLowerCase().includes(term) || table.columns.some((column) => column.name.toLowerCase().includes(term))
    );
  }, [schema, filter]);
  const groups = [
    { label: "Tabelas", items: visible.filter((table) => table.kind === "table") },
    { label: "Views", items: visible.filter((table) => table.kind === "view") }
  ].filter((group) => group.items.length > 0);

  return (
    <div class="schema">
      <label class="search">
        <Icon name="search" size={14} />
        <input
          type="search"
          placeholder="Filtrar tabelas e colunas"
          value={filter}
          onInput={(event) => setFilter(event.currentTarget.value)}
          aria-label="Filtrar tabelas e colunas"
        />
      </label>
      {groups.map((group) => (
        <section key={group.label} class="tree-group">
          <h3 class="eyebrow">
            {group.label}
            <span>{group.items.length}</span>
          </h3>
          <ul class="tree">
            {group.items.map((table) => (
              <TableRow key={table.name} table={table} onPreview={onPreview} />
            ))}
          </ul>
        </section>
      ))}
      {groups.length === 0 && <p class="tree-empty">Nada com “{filter}” neste banco.</p>}
    </div>
  );
}
