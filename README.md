# Formação SQL Database Specialist — Desafios de Projeto

Repositório com os 7 desafios de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO). Todo o SQL foi **executado e validado** contra uma instância local MySQL 8.4.9 (porta 3307), não apenas escrito.

| # | Desafio | Conteúdo |
|---|---|---|
| 1 | [Refinando um Projeto Conceitual (E-commerce)](desafio-1-ecommerce-conceitual/) | Especialização PJ/PF, pagamento 1:N, entrega com status/rastreio — modelo EER + justificativas |
| 2 | [Esquema Conceitual do Zero (Oficina Mecânica)](desafio-2-oficina-conceitual/) | Modelo EER completo a partir da narrativa: OS, equipe de mecânicos (N:M), serviços e peças |
| 3 | [Primeiro Projeto Lógico (E-commerce)](desafio-3-ecommerce-logico/) | DDL + seed + queries (JOIN, HAVING, expressões derivadas, perguntas de negócio) |
| 4 | [Projeto Lógico do Zero (Oficina)](desafio-4-oficina-logico/) | DDL + seed + queries para o modelo do Desafio 2 |
| 5 | [Índices e Procedures (COMPANY)](desafio-5-indices-procedures/) | 5 índices justificados + procedure CRUD parametrizada com `CASE`/`IF` |
| 6 | [Views, Permissões e Triggers](desafio-6-views-triggers-permissoes/) | 5 views + usuários `gerente_rh`/`funcionario_rh` com acesso diferenciado (testado de verdade) + 2 triggers de automação |
| 7 | [Transações, Backup e Recovery](desafio-7-transacoes-backup/) | Transação simples, procedure com `SAVEPOINT`/`ROLLBACK` total e parcial, backup com `mysqldump` e recovery testado (drop + restore) |

## Ambiente de teste

MySQL Community 8.4.9 instalado localmente, rodando **isolado na porta 3307** (instância separada do banco de produção que já existia na 3306). Datadir em `D:\mysql-data-sql-challenges`, fora de qualquer pasta do sistema.

```bash
mysql -u root --port=3307 --protocol=TCP
```

Ordem de execução recomendada (desafios 5/6/7 dependem de bancos criados por desafios anteriores):

```bash
# Desafio 3 (cria ecommerce_desafio, usado nos desafios 6 e 7)
mysql -u root --port=3307 --protocol=TCP < desafio-3-ecommerce-logico/schema.sql
mysql -u root --port=3307 --protocol=TCP < desafio-3-ecommerce-logico/seed.sql

# Desafio 4 (cria oficina_desafio, independente)
mysql -u root --port=3307 --protocol=TCP < desafio-4-oficina-logico/schema.sql
mysql -u root --port=3307 --protocol=TCP < desafio-4-oficina-logico/seed.sql

# Desafio 5 (cria company_desafio, usado no desafio 6)
mysql -u root --port=3307 --protocol=TCP < desafio-5-indices-procedures/schema.sql
mysql -u root --port=3307 --protocol=TCP < desafio-5-indices-procedures/seed.sql
mysql -u root --port=3307 --protocol=TCP < desafio-5-indices-procedures/procedure.sql

# Desafio 6 (views/permissoes em company_desafio, triggers em ecommerce_desafio)
mysql -u root --port=3307 --protocol=TCP < desafio-6-views-triggers-permissoes/views.sql
mysql -u root --port=3307 --protocol=TCP < desafio-6-views-triggers-permissoes/permissoes.sql
mysql -u root --port=3307 --protocol=TCP < desafio-6-views-triggers-permissoes/triggers.sql

# Desafio 7 (transacoes + backup/recovery em ecommerce_desafio)
mysql -u root --port=3307 --protocol=TCP < desafio-7-transacoes-backup/transacao_simples.sql
mysql -u root --port=3307 --protocol=TCP < desafio-7-transacoes-backup/procedure_transacao.sql
```

Os desafios 1 e 2 são conceituais (README + diagrama Mermaid), sem SQL executável.
