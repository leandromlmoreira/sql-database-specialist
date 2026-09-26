export const diagramSvg = `
<svg viewBox="0 0 900 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama das tabelas do e-commerce">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#B9B8B4" />
    </marker>
  </defs>
  <g fill="none" stroke="#B9B8B4" stroke-width="1.5" marker-end="url(#arrow)">
    <path d="M170,80 L170,140" />
    <path d="M230,80 L360,140" />
    <path d="M460,120 L460,150" />
    <path d="M400,190 L400,230" />
    <path d="M600,190 L520,230" />
    <path d="M400,290 L400,330" />
    <path d="M460,290 L620,330" />
    <path d="M400,290 L200,390" />
  </g>
  <g font-family="'SF Mono','JetBrains Mono',monospace" font-size="11">
    ${table(60, 20, 160, "cliente_pf", ["id_cliente PK/FK", "cpf", "data_nascimento"])}
    ${table(230, 20, 160, "cliente_pj", ["id_cliente PK/FK", "cnpj", "razao_social"])}
    ${table(320, 100, 170, "cliente", ["id_cliente PK", "nome", "email", "tipo"])}
    ${table(560, 100, 170, "produto", ["id_produto PK", "nome", "valor_unitario", "estoque"])}
    ${table(320, 210, 170, "pedido", ["id_pedido PK", "id_cliente FK", "data_pedido", "valor_total"])}
    ${table(540, 210, 190, "item_pedido", ["id_item PK", "id_pedido FK", "id_produto FK", "quantidade"])}
    ${table(260, 320, 170, "pagamento", ["id_pagamento PK", "id_pedido FK", "forma", "valor"])}
    ${table(540, 320, 190, "entrega", ["id_entrega PK", "id_pedido FK/UQ", "status", "codigo_rastreio"])}
  </g>
</svg>
`;

function table(x: number, y: number, width: number, name: string, fields: string[]): string {
  const rowHeight = 18;
  const headerHeight = 24;
  const height = headerHeight + fields.length * rowHeight + 8;
  const rows = fields
    .map(
      (field, index) =>
        `<text x="${x + 10}" y="${y + headerHeight + index * rowHeight + 13}" fill="#57564F">${field}</text>`
    )
    .join("");
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#FBFBFA" stroke="#EAEAEA" />
    <rect x="${x}" y="${y}" width="${width}" height="${headerHeight}" rx="8" fill="#111111" />
    <rect x="${x}" y="${y + headerHeight - 8}" width="${width}" height="8" fill="#111111" />
    <text x="${x + 10}" y="${y + 16}" fill="#FBFBFA" font-weight="600">${name}</text>
    ${rows}
  `;
}
