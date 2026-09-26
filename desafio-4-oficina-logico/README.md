# Modelo lógico — Oficina mecânica

Mapeamento lógico (DDL executável) do modelo conceitual em [`desafio-2-oficina-conceitual`](../desafio-2-oficina-conceitual/): equipe de mecânicos por OS (N:M), serviços com valor de mão de obra histórico e consumo de peças.

## Conteúdo

- [`schema.sql`](schema.sql) — tabelas `cliente`, `veiculo`, `mecanico`, `servico`, `peca`, `os`, `os_mecanico` (associativa N:M entre OS e mecânico), `os_servico` e `os_servico_peca` (associativa entre serviço executado e peça consumida).
- [`seed.sql`](seed.sql) — dados de exemplo (3 clientes, 3 veículos, 3 mecânicos, 4 serviços, 4 peças e 3 OS em estágios diferentes).
- [`queries.sql`](queries.sql) — 6 consultas: expressão derivada (prazo de execução em dias), JOIN entre várias tabelas (detalhamento completo de uma OS), agregação com `HAVING`, e perguntas de negócio (OS pendentes de autorização do cliente, faturamento por especialidade de mecânico, peças com estoque baixo em OS ainda abertas).

## Como testar

```bash
mysql -u root --port=3307 --protocol=TCP < schema.sql
mysql -u root --port=3307 --protocol=TCP < seed.sql
mysql -u root --port=3307 --protocol=TCP < queries.sql
```

Schema independente (`oficina_desafio`), sem dependência de outros módulos deste repositório.
