# Modelo lógico — E-commerce

Mapeamento lógico (DDL executável) do modelo conceitual em [`desafio-1-ecommerce-conceitual`](../desafio-1-ecommerce-conceitual/): especialização PJ/PF, pagamento 1:N por pedido e entrega com status/rastreio.

## Conteúdo

- [`schema.sql`](schema.sql) — tabelas `cliente`, `cliente_pf`, `cliente_pj` (especialização total e disjunta: cada cliente cai em exatamente uma das duas), `produto`, `pedido`, `item_pedido`, `pagamento` (1:N com `pedido`, um pedido pode ser pago em mais de uma forma) e `entrega`.
- [`seed.sql`](seed.sql) — dados de exemplo (4 clientes, 4 produtos, 4 pedidos com itens, pagamentos e entregas).
- [`queries.sql`](queries.sql) — 7 consultas: filtro com expressão derivada, JOIN entre 3 tabelas, agregação com `HAVING`, e perguntas de negócio (forma de pagamento que mais movimenta, pedidos ainda não entregues, produto mais vendido, pedidos pagos em mais de uma forma).

## Perguntas de negócio

Na ordem em que aparecem em [`queries.sql`](queries.sql):

1. Quais pedidos de clientes pessoa física acima de R$ 100 teriam com 5% de desconto? — filtro com expressão derivada
2. Quais itens compõem cada pedido, com subtotal calculado? — JOIN entre 3 tabelas
3. Quais clientes fizeram mais de um pedido, e quanto gastaram no total? — agregação com `HAVING`
4. Qual forma de pagamento mais movimenta em valor? — `GROUP BY` com soma
5. Quais pedidos ainda não foram entregues, ordenados pela data prevista? — JOIN com filtro de status
6. Qual produto vendeu mais unidades no total? — agregação com `LIMIT`
7. Quais pedidos foram pagos com mais de uma forma de pagamento? — `HAVING` sobre relação 1:N

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < schema.sql
mysql -u root --port=3307 --protocol=TCP < seed.sql
mysql -u root --port=3307 --protocol=TCP < queries.sql
```

Este schema (`ecommerce_desafio`) também é reaproveitado em [`desafio-6-views-triggers-permissoes`](../desafio-6-views-triggers-permissoes/) (triggers) e [`desafio-7-transacoes-backup`](../desafio-7-transacoes-backup/) (transações e backup).
