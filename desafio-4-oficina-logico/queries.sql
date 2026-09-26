USE oficina_desafio;

SELECT numero, data_emissao, data_conclusao,
       DATEDIFF(data_conclusao, data_emissao) AS dias_execucao,
       valor_total
FROM os
WHERE status = 'concluida'
ORDER BY dias_execucao;

SELECT o.numero, v.placa, s.descricao AS servico, os_s.valor_mao_obra_aplicado,
       p.descricao AS peca, osp.quantidade, osp.valor_unitario_aplicado
FROM os o
JOIN veiculo v ON v.id_veiculo = o.id_veiculo
JOIN os_servico os_s ON os_s.numero_os = o.numero
JOIN servico s ON s.id_servico = os_s.id_servico
LEFT JOIN os_servico_peca osp ON osp.id_os_servico = os_s.id_os_servico
LEFT JOIN peca p ON p.id_peca = osp.id_peca
ORDER BY o.numero;

SELECT m.nome, COUNT(om.numero_os) AS total_os
FROM mecanico m
JOIN os_mecanico om ON om.id_mecanico = m.id_mecanico
GROUP BY m.id_mecanico, m.nome
HAVING COUNT(om.numero_os) >= 1
ORDER BY total_os DESC;

SELECT o.numero, c.nome AS cliente, v.placa, o.status
FROM os o
JOIN cliente c ON c.id_cliente = o.id_cliente
JOIN veiculo v ON v.id_veiculo = o.id_veiculo
WHERE o.autorizado_cliente = FALSE;

SELECT m.especialidade, SUM(o.valor_total) AS faturamento_atribuido
FROM os o
JOIN os_mecanico om ON om.numero_os = o.numero
JOIN mecanico m ON m.id_mecanico = om.id_mecanico
GROUP BY m.especialidade
ORDER BY faturamento_atribuido DESC;

SELECT DISTINCT p.descricao, p.estoque
FROM peca p
JOIN os_servico_peca osp ON osp.id_peca = p.id_peca
JOIN os_servico os_s ON os_s.id_os_servico = osp.id_os_servico
JOIN os o ON o.numero = os_s.numero_os
WHERE p.estoque < 20 AND o.status IN ('aberta', 'autorizada', 'em_execucao');
