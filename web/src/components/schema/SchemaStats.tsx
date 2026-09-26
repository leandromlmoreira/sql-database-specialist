import type { SchemaInfo } from "../../lib/schema";

export function SchemaStats({ schema }: { schema: SchemaInfo }) {
  const tables = schema.tables.filter((table) => table.kind === "table");
  const stats = [
    { label: "tabelas", value: tables.length },
    { label: "relações", value: schema.relations.length },
    { label: "linhas", value: tables.reduce((sum, table) => sum + table.rowCount, 0) }
  ];
  return (
    <dl class="schema-stats">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
