# Desafio 5 — Personalizando o Banco de Dados com Índices e Procedures

Desafio de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO), módulo *Técnicas Avançadas MySQL*.

Usa o schema **COMPANY** (clássico de Elmasri & Navathe, o mesmo referenciado nas aulas de Triggers/Indexação).

## Conteúdo

- [`schema.sql`](schema.sql) — tabelas `department`, `employee`, `dept_locations`, `project`, `works_on`, `dependent` + **5 índices**, cada um com a justificativa de uso comentada no próprio arquivo (busca por sobrenome, filtro por departamento, faixa salarial, busca exata por nome de projeto, e o sentido inverso da PK composta de `works_on`).
- [`seed.sql`](seed.sql) — dados de exemplo (3 departamentos, 5 funcionários, projetos, alocações e dependentes).
- [`procedure.sql`](procedure.sql) — `sp_employee_crud`: procedure parametrizada que recebe uma **variável de controle** (`p_operacao`: `I`/`U`/`D`/`S`) e usa `CASE` + `IF` para decidir entre inserir, atualizar salário, remover ou consultar um funcionário, retornando uma mensagem de status via parâmetro `OUT`. O arquivo já inclui uma bateria de chamadas de teste cobrindo sucesso, duplicidade, não encontrado e operação inválida.

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < schema.sql
mysql -u root --port=3307 --protocol=TCP < seed.sql
mysql -u root --port=3307 --protocol=TCP < procedure.sql
```

Todos os três arquivos foram executados contra uma instância local MySQL 8.4.9 — a saída da procedure (7 chamadas cobrindo todos os ramos do `CASE`) está reproduzida abaixo, exatamente como veio do servidor:

```
Funcionario Paulo inserido com sucesso
Erro: ja existe funcionario com Ssn 666666666
Salario atualizado para 5200.00
Consulta OK - ver resultado acima   (+ SELECT do funcionário 666666666)
Funcionario 666666666 removido
Erro: funcionario 666666666 nao encontrado
Erro: operacao invalida "X" (use I, U, D ou S)
```
