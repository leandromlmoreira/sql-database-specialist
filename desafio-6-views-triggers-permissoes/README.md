# Desafio 6 — Personalizando Acessos e Automatizando Ações no MySQL

Desafio de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO), módulo *Técnicas Avançadas MySQL*.

## Parte 1 — Views e permissões (schema COMPANY)

- [`views.sql`](views.sql) — 5 views: funcionários com departamento, departamentos com gerente, horas totais por projeto, quantidade de dependentes por funcionário, e uma view "pública" sem a coluna de salário.
- [`permissoes.sql`](permissoes.sql) — dois usuários com acesso bem diferente:
  - **`gerente_rh`**: `SELECT/INSERT/UPDATE/DELETE` em todo o schema `company_desafio`, inclusive a tabela `employee` (que tem o salário).
  - **`funcionario_rh`**: só `SELECT`, e só nas 4 views que **não** expõem salário — sem nenhum acesso direto às tabelas base.

Testado de verdade (não só o script rodando, mas conectando como cada usuário):

```
gerente_rh    → SELECT direto em employee.Salary: OK
funcionario_rh → SELECT direto em employee: ERROR 1142 (42000) "SELECT command denied ... for table 'employee'"
funcionario_rh → SELECT em vw_employee_public: OK (sem coluna Salary)
```

## Parte 2 — Triggers de automação (schema e-commerce, reaproveitado do Desafio 3)

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

Depende do [Desafio 5](../desafio-5-indices-procedures/) (schema `company_desafio`) e do [Desafio 3](../desafio-3-ecommerce-logico/) (schema `ecommerce_desafio`) já terem sido executados antes.
