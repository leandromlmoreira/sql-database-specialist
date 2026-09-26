# Views, permissões e triggers

## Parte 1 — Views e permissões (schema COMPANY)

- [`views.sql`](views.sql) — 5 views:
  1. `vw_employee_department` — funcionários com o nome do departamento (visão geral usada em quase toda tela de RH).
  2. `vw_department_manager` — departamentos com o nome do gerente responsável.
  3. `vw_project_hours` — total de horas alocadas por projeto (visão de gestão de projetos).
  4. `vw_employee_dependents_count` — quantidade de dependentes por funcionário (usada pelo RH para benefícios).
  5. `vw_employee_public` — funcionários sem informação salarial (dado sensível), para uso por perfis sem permissão de ver salário: expõe só nome e departamento.
- [`permissoes.sql`](permissoes.sql) — dois usuários com acesso bem diferente:
  - **`gerente_rh`**: `SELECT/INSERT/UPDATE/DELETE` em todo o schema `company_desafio`, inclusive a tabela `employee` (que tem o salário).
  - **`funcionario_rh`**: só `SELECT`, e só nas 4 views que **não** expõem salário — sem nenhum acesso direto às tabelas base.

Testado de verdade (não só o script rodando, mas conectando como cada usuário):

```
gerente_rh    → SELECT direto em employee.Salary: OK
funcionario_rh → SELECT direto em employee: ERROR 1142 (42000) "SELECT command denied ... for table 'employee'"
funcionario_rh → SELECT em vw_employee_public: OK (sem coluna Salary)
```

## Parte 2 — Triggers de automação (schema e-commerce, reaproveitado de `desafio-3-ecommerce-logico`)

- [`triggers.sql`](triggers.sql):
  - **`trg_cliente_before_delete`** (`BEFORE DELETE` em `cliente`): copia os dados do cliente para `cliente_removido` antes de apagar — preserva o histórico de quem foi removido (auditoria/LGPD).
  - **`trg_produto_before_update`** (`BEFORE UPDATE` em `produto`): sempre que o `valor_unitario` muda, grava automaticamente o valor antigo e o novo em `produto_historico_preco`, sem depender da aplicação lembrar de registrar.

Testado com duas alterações de preço seguidas no mesmo produto e uma exclusão de cliente — o histórico e a auditoria ficaram gravados corretamente (ver saída completa no output do `triggers.sql`).

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < views.sql
mysql -u root --port=3307 --protocol=TCP < permissoes.sql
mysql -u root --port=3307 --protocol=TCP < triggers.sql

# validar a diferenciacao de acesso de verdade:
mysql -u funcionario_rh -p --port=3307 --protocol=TCP -e "USE company_desafio; SELECT * FROM employee;"   # deve falhar
mysql -u funcionario_rh -p --port=3307 --protocol=TCP -e "USE company_desafio; SELECT * FROM vw_employee_public;"  # deve funcionar
```

Depende de [`desafio-5-indices-procedures`](../desafio-5-indices-procedures/) (schema `company_desafio`) e de [`desafio-3-ecommerce-logico`](../desafio-3-ecommerce-logico/) (schema `ecommerce_desafio`) já terem sido executados antes.
