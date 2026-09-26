import type { Column } from "../../lib/schema";

function Badge({ column }: { column: Column }) {
  if (column.primaryKey && column.foreignKey) return <span class="key-badge is-pk">PK·FK</span>;
  if (column.primaryKey) return <span class="key-badge is-pk">PK</span>;
  if (column.foreignKey) return <span class="key-badge is-fk">FK</span>;
  return <span class="key-badge is-none" aria-hidden="true" />;
}

const describeColumn = (column: Column) =>
  [
    column.notNull ? "NOT NULL" : "NULL",
    column.foreignKey ? `→ ${column.foreignKey.table}.${column.foreignKey.column}` : "",
    column.enumValues.length ? `valores: ${column.enumValues.join(", ")}` : ""
  ]
    .filter(Boolean)
    .join(" · ");

export function ColumnRow({ column }: { column: Column }) {
  return (
    <li class="tree-column" title={describeColumn(column)}>
      <Badge column={column} />
      <span class="column-name">{column.name}</span>
      <span class="column-type">{column.type}</span>
      {column.foreignKey && <span class="column-ref">→ {column.foreignKey.table}</span>}
    </li>
  );
}
