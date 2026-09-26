export const schemaSql = `
CREATE TABLE cliente (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ'))
);

CREATE TABLE cliente_pf (
  id_cliente INTEGER PRIMARY KEY,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento TEXT NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE cliente_pj (
  id_cliente INTEGER PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE produto (
  id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  valor_unitario REAL NOT NULL CHECK (valor_unitario > 0),
  estoque INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pedido (
  id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  data_pedido TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valor_total REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE item_pedido (
  id_item INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  id_produto INTEGER NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario_aplicado REAL NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE pagamento (
  id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  forma TEXT NOT NULL CHECK (forma IN ('cartao', 'boleto', 'pix')),
  valor REAL NOT NULL CHECK (valor > 0),
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

CREATE TABLE entrega (
  id_entrega INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'preparando' CHECK (status IN ('preparando', 'enviado', 'em_transito', 'entregue')),
  codigo_rastreio TEXT,
  data_prevista TEXT,
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);
`;

export const seedSql = `
INSERT INTO cliente (nome, email, tipo) VALUES
  ('Ana Souza', 'ana@example.com', 'PF'),
  ('Bruno Lima', 'bruno@example.com', 'PF'),
  ('Comercial Tech Ltda', 'contato@comercialtech.com', 'PJ'),
  ('Carla Nunes', 'carla@example.com', 'PF');

INSERT INTO cliente_pf (id_cliente, cpf, data_nascimento) VALUES
  (1, '11122233344', '1990-05-12'),
  (2, '22233344455', '1985-11-03'),
  (4, '33344455566', '1998-02-20');

INSERT INTO cliente_pj (id_cliente, cnpj, razao_social) VALUES
  (3, '12345678000199', 'Comercial Tech Ltda');

INSERT INTO produto (nome, valor_unitario, estoque) VALUES
  ('Mouse sem fio', 55.90, 120),
  ('Teclado mecanico', 289.90, 40),
  ('Monitor 24"', 799.00, 15),
  ('Webcam HD', 129.90, 60);

INSERT INTO pedido (id_cliente, data_pedido, valor_total) VALUES
  (1, '2026-01-10 14:30:00', 111.80),
  (2, '2026-02-05 09:15:00', 799.00),
  (3, '2026-02-20 16:45:00', 419.80),
  (1, '2026-03-01 11:00:00', 129.90);

INSERT INTO item_pedido (id_pedido, id_produto, quantidade, valor_unitario_aplicado) VALUES
  (1, 1, 2, 55.90),
  (2, 3, 1, 799.00),
  (3, 2, 1, 289.90),
  (3, 1, 1, 55.90),
  (3, 4, 1, 74.00),
  (4, 4, 1, 129.90);

INSERT INTO pagamento (id_pedido, forma, valor) VALUES
  (1, 'pix', 111.80),
  (2, 'cartao', 799.00),
  (3, 'cartao', 300.00),
  (3, 'boleto', 119.80),
  (4, 'pix', 129.90);

INSERT INTO entrega (id_pedido, status, codigo_rastreio, data_prevista) VALUES
  (1, 'entregue', 'BR123456789', '2026-01-15'),
  (2, 'em_transito', 'BR987654321', '2026-02-10'),
  (3, 'preparando', NULL, '2026-02-27'),
  (4, 'enviado', 'BR555555555', '2026-03-06');
`;

export interface PlaygroundQuery {
  id: string;
  pergunta: string;
  sql: string;
}

export const queries: PlaygroundQuery[] = [
  {
    id: "pedidos-pf-desconto",
    pergunta: "Quais pedidos de clientes pessoa física acima de R$ 100 teriam com 5% de desconto?",
    sql: `SELECT p.id_pedido, c.nome, p.valor_total,
       p.valor_total * 0.95 AS valor_com_desconto_5pct
FROM pedido p
JOIN cliente c ON c.id_cliente = p.id_cliente
WHERE c.tipo = 'PF' AND p.valor_total > 100
ORDER BY p.valor_total DESC;`
  },
  {
    id: "itens-por-pedido",
    pergunta: "Quais itens compõem cada pedido, com subtotal calculado?",
    sql: `SELECT ped.id_pedido, prod.nome AS produto, ip.quantidade, ip.valor_unitario_aplicado,
       ip.quantidade * ip.valor_unitario_aplicado AS subtotal
FROM item_pedido ip
JOIN pedido ped ON ped.id_pedido = ip.id_pedido
JOIN produto prod ON prod.id_produto = ip.id_produto
ORDER BY ped.id_pedido, produto;`
  },
  {
    id: "clientes-recorrentes",
    pergunta: "Quais clientes fizeram mais de um pedido, e quanto gastaram no total?",
    sql: `SELECT c.nome, COUNT(p.id_pedido) AS total_pedidos, SUM(p.valor_total) AS total_gasto
FROM cliente c
JOIN pedido p ON p.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nome
HAVING COUNT(p.id_pedido) > 1
ORDER BY total_gasto DESC;`
  },
  {
    id: "movimentacao-por-forma",
    pergunta: "Qual forma de pagamento mais movimenta em valor?",
    sql: `SELECT forma, COUNT(*) AS qtd_transacoes, SUM(valor) AS total_movimentado
FROM pagamento
GROUP BY forma
ORDER BY total_movimentado DESC;`
  },
  {
    id: "entregas-pendentes",
    pergunta: "Quais pedidos ainda não foram entregues, ordenados pela data prevista?",
    sql: `SELECT ped.id_pedido, c.nome, e.status, e.codigo_rastreio
FROM pedido ped
JOIN cliente c ON c.id_cliente = ped.id_cliente
JOIN entrega e ON e.id_pedido = ped.id_pedido
WHERE e.status <> 'entregue'
ORDER BY e.data_prevista;`
  },
  {
    id: "produto-mais-vendido",
    pergunta: "Qual produto vendeu mais unidades no total?",
    sql: `SELECT prod.nome, SUM(ip.quantidade) AS total_vendido
FROM item_pedido ip
JOIN produto prod ON prod.id_produto = ip.id_produto
GROUP BY prod.id_produto, prod.nome
ORDER BY total_vendido DESC
LIMIT 1;`
  },
  {
    id: "pedidos-multiplas-formas",
    pergunta: "Quais pedidos foram pagos com mais de uma forma de pagamento?",
    sql: `SELECT ped.id_pedido, COUNT(pg.id_pagamento) AS qtd_formas_pagamento
FROM pedido ped
JOIN pagamento pg ON pg.id_pedido = ped.id_pedido
GROUP BY ped.id_pedido
HAVING COUNT(pg.id_pagamento) > 1;`
  }
];
