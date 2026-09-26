# Índices e procedures — schema COMPANY

Usa o schema **COMPANY** (clássico de Elmasri & Navathe) para demonstrar indexação orientada a padrões de consulta e uma procedure CRUD parametrizada.

## Conteúdo

- [`schema.sql`](schema.sql) — tabelas `department`, `employee`, `dept_locations`, `project`, `works_on`, `dependent` + 5 índices:
  1. `idx_employee_lname` — busca frequente de funcionários por sobrenome (relatórios, telas de busca por nome).
  2. `idx_employee_dno` — consultas "funcionários do departamento X" são muito mais comuns que alterações de departamento, e o MySQL não cria índice automático em toda coluna de FK quando ela participa de mais de uma cláusula.
  3. `idx_employee_salary` — consulta por faixa salarial (folha de pagamento, relatórios de RH); índice B-tree aproveita bem operadores de intervalo (`BETWEEN`, `>`, `<`).
  4. `idx_project_pname` — pesquisa exata por nome de projeto (tela "buscar projeto por nome"), única e sempre por igualdade, então `HASH` seria mais eficiente que B-tree aqui. Observação testada: o InnoDB não suporta índice HASH explícito e converte silenciosamente para BTREE (confirmado com `SHOW INDEX`) — a cláusula documenta a intenção, mas só teria efeito real com `ENGINE=MEMORY`.
  5. `idx_workson_pno` — `works_on` já tem PK composta (`Essn`, `Pno`) que cobre buscas "horas do funcionário X no projeto Y", mas faltava índice para o sentido inverso: "quem trabalha no projeto Y".
- [`seed.sql`](seed.sql) — dados de exemplo (3 departamentos, 5 funcionários, projetos, alocações e dependentes).
- [`procedure.sql`](procedure.sql) — `sp_employee_crud`: procedure parametrizada que recebe uma variável de controle (`p_operacao`: `I`/`U`/`D`/`S`) e usa `CASE`/`IF` para decidir entre inserir, atualizar salário, remover ou consultar um funcionário, retornando uma mensagem de status via parâmetro `OUT`. O arquivo já inclui uma bateria de chamadas de teste cobrindo sucesso, duplicidade, não encontrado e operação inválida.

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < schema.sql
mysql -u root --port=3307 --protocol=TCP < seed.sql
mysql -u root --port=3307 --protocol=TCP < procedure.sql
```

Saída da procedure (7 chamadas cobrindo todos os ramos do `CASE`), reproduzida como veio do servidor:

```
Funcionario Paulo inserido com sucesso
Erro: ja existe funcionario com Ssn 666666666
Salario atualizado para 5200.00
Consulta OK - ver resultado acima   (+ SELECT do funcionário 666666666)
Funcionario 666666666 removido
Erro: funcionario 666666666 nao encontrado
Erro: operacao invalida "X" (use I, U, D ou S)
```
