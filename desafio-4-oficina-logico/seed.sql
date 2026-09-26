USE oficina_desafio;

INSERT INTO cliente (nome, cpf_cnpj, telefone) VALUES
    ('Joao Pereira', '11122233344', '11988887777'),
    ('Marcia Alves', '22233344455', '11977776666'),
    ('Transportes Rapido Ltda', '12345678000199', '1133334444');

INSERT INTO veiculo (id_cliente, placa, modelo, ano) VALUES
    (1, 'ABC1D23', 'Fiat Uno', 2015),
    (2, 'XYZ9E88', 'Honda Civic', 2020),
    (3, 'JJJ4K11', 'Mercedes Sprinter', 2019);

INSERT INTO mecanico (nome, endereco, especialidade) VALUES
    ('Carlos Souza', 'Rua A, 100', 'motor'),
    ('Fernanda Lima', 'Rua B, 200', 'eletrica'),
    ('Roberto Dias', 'Rua C, 300', 'suspensao');

INSERT INTO servico (descricao, valor_mao_obra) VALUES
    ('Troca de oleo', 80.00),
    ('Revisao eletrica', 150.00),
    ('Alinhamento e balanceamento', 120.00),
    ('Troca de amortecedor', 200.00);

INSERT INTO peca (descricao, valor_unitario, estoque) VALUES
    ('Oleo motor 1L', 35.00, 200),
    ('Filtro de oleo', 25.00, 80),
    ('Amortecedor dianteiro', 180.00, 10),
    ('Fusivel 10A', 3.50, 500);

-- valor_total = soma da mao de obra aplicada + pecas usadas (calculado a partir de os_servico/os_servico_peca abaixo)
INSERT INTO os (id_veiculo, id_cliente, data_emissao, data_conclusao, valor_total, status, autorizado_cliente, data_autorizacao) VALUES
    (1, 1, '2026-01-05', '2026-01-06', 245.00, 'concluida', TRUE, '2026-01-05 09:00:00'),
    (2, 2, '2026-02-10', NULL, 157.00, 'em_execucao', TRUE, '2026-02-10 08:30:00'),
    (3, 3, '2026-02-20', NULL, 0.00, 'aberta', FALSE, NULL);

INSERT INTO os_mecanico (numero_os, id_mecanico) VALUES
    (1, 1),
    (2, 2),
    (2, 3);

INSERT INTO os_servico (numero_os, id_servico, valor_mao_obra_aplicado) VALUES
    (1, 1, 80.00),
    (2, 2, 150.00);

INSERT INTO os_servico_peca (id_os_servico, id_peca, quantidade, valor_unitario_aplicado) VALUES
    (1, 1, 4, 35.00),
    (1, 2, 1, 25.00),
    (2, 4, 2, 3.50);
