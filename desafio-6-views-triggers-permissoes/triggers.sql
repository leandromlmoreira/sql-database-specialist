USE ecommerce_desafio;

-- ============================================================
-- 1) BEFORE DELETE em cliente: preserva os dados do cliente removido
--    (LGPD/auditoria - nao pode simplesmente sumir com o historico)
-- ============================================================

CREATE TABLE IF NOT EXISTS cliente_removido (
    id_cliente INT NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    tipo ENUM('PF', 'PJ') NOT NULL,
    removido_em DATETIME NOT NULL,
    PRIMARY KEY (id_cliente, removido_em)
);

DROP TRIGGER IF EXISTS trg_cliente_before_delete;

DELIMITER $$
CREATE TRIGGER trg_cliente_before_delete
BEFORE DELETE ON cliente
FOR EACH ROW
BEGIN
    INSERT INTO cliente_removido (id_cliente, nome, email, tipo, removido_em)
    VALUES (OLD.id_cliente, OLD.nome, OLD.email, OLD.tipo, NOW());
END$$
DELIMITER ;

-- ============================================================
-- 2) BEFORE UPDATE em produto: toda alteracao de preco fica registrada
--    automaticamente no historico, sem depender da aplicacao lembrar de gravar
-- ============================================================

CREATE TABLE IF NOT EXISTS produto_historico_preco (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    valor_anterior DECIMAL(10, 2) NOT NULL,
    valor_novo DECIMAL(10, 2) NOT NULL,
    alterado_em DATETIME NOT NULL
);

DROP TRIGGER IF EXISTS trg_produto_before_update;

DELIMITER $$
CREATE TRIGGER trg_produto_before_update
BEFORE UPDATE ON produto
FOR EACH ROW
BEGIN
    IF NEW.valor_unitario <> OLD.valor_unitario THEN
        INSERT INTO produto_historico_preco (id_produto, valor_anterior, valor_novo, alterado_em)
        VALUES (OLD.id_produto, OLD.valor_unitario, NEW.valor_unitario, NOW());
    END IF;
END$$
DELIMITER ;

-- ---- Testes manuais dos triggers ----

-- Testa o BEFORE DELETE (usa um cliente sem pedidos para nao violar FK de pedido)
INSERT INTO cliente (nome, email, tipo) VALUES ('Cliente Teste Trigger', 'teste.trigger@example.com', 'PF');
SET @id_teste = LAST_INSERT_ID();
DELETE FROM cliente WHERE id_cliente = @id_teste;
SELECT * FROM cliente_removido WHERE id_cliente = @id_teste;

-- Testa o BEFORE UPDATE (2 alteracoes de preco no mesmo produto)
UPDATE produto SET valor_unitario = 59.90 WHERE id_produto = 1;
UPDATE produto SET valor_unitario = 49.90 WHERE id_produto = 1;
SELECT * FROM produto_historico_preco WHERE id_produto = 1;
