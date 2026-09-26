USE ecommerce_desafio;

-- 1. SELECT + WHERE + expressao derivada: pedidos de PF acima de R$100
SELECT p.id_pedido, c.nome, p.valor_total,
       p.valor_total * 0.95 AS valor_com_desconto_5pct
FROM pedido p
JOIN cliente c ON c.id_cliente = p.id_cliente
WHERE c.tipo = 'PF' AND p.valor_total > 100
ORDER BY p.valor_total DESC;

-- 2. JOIN entre 3 tabelas: itens de cada pedido com nome do produto e subtotal
SELECT ped.id_pedido, prod.nome AS produto, ip.quantidade, ip.valor_unitario_aplicado,
       ip.quantidade * ip.valor_unitario_aplicado AS subtotal
FROM item_pedido ip
JOIN pedido ped ON ped.id_pedido = ip.id_pedido
JOIN produto prod ON prod.id_produto = ip.id_produto
ORDER BY ped.id_pedido, produto;

-- 3. HAVING: clientes com mais de um pedido
SELECT c.nome, COUNT(p.id_pedido) AS total_pedidos, SUM(p.valor_total) AS total_gasto
FROM cliente c
JOIN pedido p ON p.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nome
HAVING COUNT(p.id_pedido) > 1
ORDER BY total_gasto DESC;

-- 4. Pergunta de negocio: qual forma de pagamento mais movimenta em valor?
SELECT forma, COUNT(*) AS qtd_transacoes, SUM(valor) AS total_movimentado
FROM pagamento
GROUP BY forma
ORDER BY total_movimentado DESC;

-- 5. Pergunta de negocio: pedidos que ainda nao foram entregues (status != entregue)
SELECT ped.id_pedido, c.nome, e.status, e.codigo_rastreio
FROM pedido ped
JOIN cliente c ON c.id_cliente = ped.id_cliente
JOIN entrega e ON e.id_pedido = ped.id_pedido
WHERE e.status <> 'entregue'
ORDER BY e.data_prevista;

-- 6. Pergunta de negocio: produto mais vendido em quantidade
SELECT prod.nome, SUM(ip.quantidade) AS total_vendido
FROM item_pedido ip
JOIN produto prod ON prod.id_produto = ip.id_produto
GROUP BY prod.id_produto, prod.nome
ORDER BY total_vendido DESC
LIMIT 1;

-- 7. Pergunta de negocio: pedidos pagos em mais de uma forma (parcelado/misto)
SELECT ped.id_pedido, COUNT(pg.id_pagamento) AS qtd_formas_pagamento
FROM pedido ped
JOIN pagamento pg ON pg.id_pedido = ped.id_pedido
GROUP BY ped.id_pedido
HAVING COUNT(pg.id_pagamento) > 1;
