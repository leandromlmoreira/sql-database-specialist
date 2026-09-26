-- Desafio 7 — Parte 2: transacao dentro de uma procedure, com tratamento de erro
-- e ROLLBACK total (cliente inexistente) ou parcial via SAVEPOINT (item sem estoque)

USE ecommerce_desafio;

DROP PROCEDURE IF EXISTS sp_registrar_pedido;

DELIMITER $$

CREATE PROCEDURE sp_registrar_pedido(
    IN p_id_cliente INT,
    IN p_id_produto1 INT, IN p_qtd1 INT,
    IN p_id_produto2 INT, IN p_qtd2 INT,
    OUT p_mensagem VARCHAR(200)
)
BEGIN
    DECLARE v_id_pedido INT;
    DECLARE v_preco1 DECIMAL(10, 2);
    DECLARE v_preco2 DECIMAL(10, 2);
    DECLARE v_estoque1 INT;
    DECLARE v_estoque2 INT;
    DECLARE v_item1_ok BOOLEAN DEFAULT FALSE;
    DECLARE v_item2_ok BOOLEAN DEFAULT FALSE;

    -- Erro fatal (ex.: cliente inexistente via SIGNAL) -> desfaz a transacao inteira
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensagem = 'Erro fatal: ROLLBACK completo, nenhum pedido foi criado';
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente inexistente';
    END IF;

    INSERT INTO pedido (id_cliente, valor_total) VALUES (p_id_cliente, 0);
    SET v_id_pedido = LAST_INSERT_ID();

    -- Item 1: se nao tiver estoque, desfaz SO esse item (ROLLBACK TO SAVEPOINT),
    -- mas mantem o pedido e o outro item que ja deu certo
    SAVEPOINT sp_item1;
    SELECT valor_unitario, estoque INTO v_preco1, v_estoque1
    FROM produto WHERE id_produto = p_id_produto1 FOR UPDATE;

    IF v_estoque1 >= p_qtd1 THEN
        INSERT INTO item_pedido (id_pedido, id_produto, quantidade, valor_unitario_aplicado)
        VALUES (v_id_pedido, p_id_produto1, p_qtd1, v_preco1);
        UPDATE produto SET estoque = estoque - p_qtd1 WHERE id_produto = p_id_produto1;
        SET v_item1_ok = TRUE;
    ELSE
        ROLLBACK TO SAVEPOINT sp_item1;
    END IF;

    -- Item 2: mesma logica, savepoint independente
    SAVEPOINT sp_item2;
    SELECT valor_unitario, estoque INTO v_preco2, v_estoque2
    FROM produto WHERE id_produto = p_id_produto2 FOR UPDATE;

    IF v_estoque2 >= p_qtd2 THEN
        INSERT INTO item_pedido (id_pedido, id_produto, quantidade, valor_unitario_aplicado)
        VALUES (v_id_pedido, p_id_produto2, p_qtd2, v_preco2);
        UPDATE produto SET estoque = estoque - p_qtd2 WHERE id_produto = p_id_produto2;
        SET v_item2_ok = TRUE;
    ELSE
        ROLLBACK TO SAVEPOINT sp_item2;
    END IF;

    UPDATE pedido
    SET valor_total = (SELECT COALESCE(SUM(quantidade * valor_unitario_aplicado), 0)
                        FROM item_pedido WHERE id_pedido = v_id_pedido)
    WHERE id_pedido = v_id_pedido;

    COMMIT;
    SET p_mensagem = CONCAT('Pedido ', v_id_pedido, ' criado. Item1_ok=', v_item1_ok, ' Item2_ok=', v_item2_ok);
END$$

DELIMITER ;

-- ---- Testes ----

-- 1) Cenario feliz: os dois itens tem estoque -> commit total, os dois itens entram
CALL sp_registrar_pedido(1, 2, 1, 4, 1, @msg);
SELECT @msg AS cenario_1_ambos_itens_ok;

-- 2) Cenario de rollback PARCIAL: produto 3 (Monitor) tem estoque 15, pedimos 999999
--    (deve falhar so esse item via SAVEPOINT, mantendo o pedido e o item 2 valido)
CALL sp_registrar_pedido(2, 3, 999999, 1, 1, @msg);
SELECT @msg AS cenario_2_item1_sem_estoque_rollback_parcial;

-- 3) Cenario de rollback TOTAL: cliente inexistente (id 9999) -> nenhum pedido criado
CALL sp_registrar_pedido(9999, 1, 1, 2, 1, @msg);
SELECT @msg AS cenario_3_cliente_inexistente_rollback_total;

-- Verificacao: quantos pedidos existem para o cliente 9999 (deve ser 0, prova do rollback total)
SELECT COUNT(*) AS pedidos_cliente_inexistente FROM pedido WHERE id_cliente = 9999;
