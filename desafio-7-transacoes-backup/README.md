# Desafio 7 — Criando Transações, Executando Backup e Recovery de Banco de Dados

Desafio de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO), módulo *Transações & Gerenciamento MySQL*. Reaproveita o schema `ecommerce_desafio` dos desafios 3 e 6.

## 1. Transação simples ([`transacao_simples.sql`](transacao_simples.sql))

`autocommit = 0`, um bloco `START TRANSACTION ... COMMIT` que grava cliente + pedido como uma unidade atômica, e um segundo bloco que faz `ROLLBACK` e prova (com `SELECT COUNT(*)`) que nada ficou gravado.

## 2. Transação dentro de uma procedure, com rollback total e parcial ([`procedure_transacao.sql`](procedure_transacao.sql))

`sp_registrar_pedido` cria um pedido com até 2 itens:
- **`DECLARE EXIT HANDLER FOR SQLEXCEPTION`** → se o cliente não existe (`SIGNAL SQLSTATE '45000'`), faz **`ROLLBACK`** completo: nenhum pedido é criado.
- **`SAVEPOINT`** por item → se um item não tem estoque suficiente, só aquele item sofre **`ROLLBACK TO SAVEPOINT`**; o pedido e o outro item (se válido) permanecem e são commitados normalmente.

Testado com 3 cenários, saída real do servidor:

```
cenario_1_ambos_itens_ok                        → Pedido 6 criado. Item1_ok=1 Item2_ok=1
cenario_2_item1_sem_estoque_rollback_parcial     → Pedido 7 criado. Item1_ok=0 Item2_ok=1   (item sem estoque foi descartado, pedido e item 2 ficaram)
cenario_3_cliente_inexistente_rollback_total     → Erro fatal: ROLLBACK completo, nenhum pedido foi criado
pedidos_cliente_inexistente = 0                  → confirma que o rollback total realmente não deixou rastro
```

## 3. Backup e recovery ([`backup_ecommerce_desafio.sql`](backup_ecommerce_desafio.sql))

Backup real com `mysqldump`, incluindo rotinas, eventos e **triggers** (os do [Desafio 6](../desafio-6-views-triggers-permissoes/)):

```bash
mysqldump -u root --port=3307 --protocol=TCP --routines --events --triggers --databases ecommerce_desafio > backup_ecommerce_desafio.sql
```

Recovery testado de verdade — não só o dump gerado, mas a restauração completa validada:

1. `DROP DATABASE ecommerce_desafio;` (apaguei o banco de propósito)
2. `SHOW DATABASES LIKE 'ecommerce_desafio';` → nada retornado, banco realmente sumiu
3. `mysql ... < backup_ecommerce_desafio.sql` → restaura
4. Contagem de `cliente`/`pedido`/`produto` **antes e depois bateu exatamente igual** (5 clientes, 7 pedidos, 4 produtos)
5. `SHOW TRIGGERS;` confirmou que `trg_cliente_before_delete` e `trg_produto_before_update` voltaram junto com os dados

O arquivo de dump está commitado neste repositório junto com os scripts, como pedido pelo desafio.

## Como reproduzir tudo

```bash
mysql -u root --port=3307 --protocol=TCP < transacao_simples.sql
mysql -u root --port=3307 --protocol=TCP < procedure_transacao.sql

# gerar backup
mysqldump -u root --port=3307 --protocol=TCP --routines --events --triggers --databases ecommerce_desafio > backup_ecommerce_desafio.sql

# simular perda de dados e recuperar
mysql -u root --port=3307 --protocol=TCP -e "DROP DATABASE ecommerce_desafio;"
mysql -u root --port=3307 --protocol=TCP < backup_ecommerce_desafio.sql
```
