USE ecommerce_desafio;

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
