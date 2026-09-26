import { useMemo, useState } from "preact/hooks";
import type { ResultSet } from "../../lib/engine";
import { columnDecimals, compareValues, formatCell, isNumeric } from "../../lib/format";
import { Icon } from "../Icon";

interface Sort {
  column: number;
  direction: 1 | -1;
}

const nextSort = (current: Sort | null, column: number): Sort | null => {
  if (!current || current.column !== column) return { column, direction: 1 };
  return current.direction === 1 ? { column, direction: -1 } : null;
};

function SortGlyph({ active, direction }: { active: boolean; direction: 1 | -1 }) {
  if (!active) return <Icon name="sort" size={12} class="sort-idle" />;
  return <Icon name={direction === 1 ? "arrowUp" : "arrowDown"} size={12} class="sort-active" />;
}

export function ResultGrid({ set }: { set: ResultSet }) {
  const [sort, setSort] = useState<Sort | null>(null);
  const numericColumns = useMemo(
    () => set.columns.map((_, index) => set.rows.some((row) => isNumeric(row[index])) && set.rows.every((row) => row[index] === null || isNumeric(row[index]))),
    [set]
  );
  const decimals = useMemo(() => set.columns.map((_, index) => columnDecimals(set.rows.map((row) => row[index]))), [set]);
  const rows = useMemo(() => {
    if (!sort) return set.rows;
    return [...set.rows].sort((a, b) => compareValues(a[sort.column], b[sort.column]) * sort.direction);
  }, [set, sort]);

  return (
    <div class="grid-scroll" role="region" aria-label="Resultado da consulta" tabIndex={0}>
      <table class="grid">
        <thead>
          <tr>
            <th class="grid-index" scope="col">#</th>
            {set.columns.map((column, index) => (
              <th
                key={`${column}-${index}`}
                scope="col"
                class={numericColumns[index] ? "is-numeric" : ""}
                aria-sort={sort?.column === index ? (sort.direction === 1 ? "ascending" : "descending") : "none"}
              >
                <button type="button" class="grid-sort" onClick={() => setSort(nextSort(sort, index))}>
                  <span>{column}</span>
                  <SortGlyph active={sort?.column === index} direction={sort?.direction ?? 1} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td class="grid-index">{rowIndex + 1}</td>
              {row.map((value, index) => (
                <td key={index} class={numericColumns[index] ? "is-numeric" : ""}>
                  {value === null ? <span class="null-pill">NULL</span> : formatCell(value, decimals[index])}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td class="grid-empty" colSpan={set.columns.length + 1}>
                Nenhuma linha atende aos filtros desta consulta.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
