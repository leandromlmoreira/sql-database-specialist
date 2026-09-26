# Modelo lógico — Oficina mecânica

Mapeamento lógico (DDL executável) do modelo conceitual em [`desafio-2-oficina-conceitual`](../desafio-2-oficina-conceitual/): equipe de mecânicos por OS (N:M), serviços com valor de mão de obra histórico e consumo de peças.

## Conteúdo

- [`schema.sql`](schema.sql) — tabelas `cliente`, `veiculo`, `mecanico`, `servico`, `peca`, `os`, `os_mecanico` (associativa N:M entre OS e mecânico), `os_servico` e `os_servico_peca` (associativa entre serviço executado e peça consumida).
- [`seed.sql`](seed.sql) — dados de exemplo (3 clientes, 3 veículos, 3 mecânicos, 4 serviços, 4 peças e 3 OS em estágios diferentes).
- [`queries.sql`](queries.sql) — 6 consultas: expressão derivada (prazo de execução em dias), JOIN entre várias tabelas (detalhamento completo de uma OS), agregação com `HAVING`, e perguntas de negócio (OS pendentes de autorização do cliente, faturamento por especialidade de mecânico, peças com estoque baixo em OS ainda abertas).

## Perguntas de negócio

Na ordem em que aparecem em [`queries.sql`](queries.sql):

1. Quantos dias cada OS concluída levou para ser executada? — expressão derivada com `DATEDIFF`
2. O que foi feito em cada OS: serviços, mão de obra e peças consumidas? — JOIN entre 6 tabelas com `LEFT JOIN`
3. Quantas OS cada mecânico já atendeu? — agregação com `HAVING`
4. Quais OS ainda aguardam autorização do cliente? — filtro em booleano
5. Quanto faturamento é atribuído a cada especialidade de mecânico? — agregação sobre a relação N:M
6. Quais peças com estoque baixo estão em OS ainda abertas? — `DISTINCT` com filtro por status

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < schema.sql
mysql -u root --port=3307 --protocol=TCP < seed.sql
mysql -u root --port=3307 --protocol=TCP < queries.sql
```

Schema independente (`oficina_desafio`), sem dependência de outros módulos deste repositório.
