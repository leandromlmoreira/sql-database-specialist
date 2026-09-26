-- Desafio 7 — Parte 1: transacao simples com autocommit desligado

USE ecommerce_desafio;

SET autocommit = 0;

START TRANSACTION;

INSERT INTO cliente (nome, email, tipo) VALUES ('Roberto Faria', 'roberto.faria@example.com', 'PF');
SET @id_cliente_novo = LAST_INSERT_ID();

INSERT INTO pedido (id_cliente, valor_total) VALUES (@id_cliente_novo, 55.90);

-- confirma os dois inserts como uma unica unidade atomica
COMMIT;

SELECT * FROM cliente WHERE id_cliente = @id_cliente_novo;
SELECT * FROM pedido WHERE id_cliente = @id_cliente_novo;

-- ---- Agora um exemplo que desfaz tudo (ROLLBACK) ----

START TRANSACTION;

INSERT INTO cliente (nome, email, tipo) VALUES ('Cliente Que Nao Deveria Ficar', 'nao.deveria@example.com', 'PF');
SET @id_cliente_rollback = LAST_INSERT_ID();

ROLLBACK;

-- confirma que NAO ficou gravado
SELECT COUNT(*) AS deve_ser_zero FROM cliente WHERE id_cliente = @id_cliente_rollback;

SET autocommit = 1;
