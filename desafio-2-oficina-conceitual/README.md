# Desafio 2 — Construindo um Esquema Conceitual para Banco de Dados (Oficina Mecânica)

Desafio de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO), módulo *Modelo de Entidade Relacional*.

## Narrativa

Uma oficina mecânica precisa de um sistema para controlar suas ordens de serviço (OS):

- Cada **OS** tem número, data de emissão, valor, status e data de conclusão.
- Um **veículo** do cliente é atendido por uma **equipe de mecânicos** (não um só) — cada mecânico tem código, nome, endereço e especialidade.
- A OS lista os **serviços** executados; cada serviço tem um custo de mão de obra (tabela de referência) e pode consumir **peças**.
- O **cliente** precisa **autorizar** a execução antes do início do serviço.

## Modelo (EER)

```mermaid
erDiagram
    CLIENTE ||--o{ VEICULO : possui
    CLIENTE ||--o{ OS : solicita
    VEICULO ||--o{ OS : e_atendido_em
    OS }o--o{ MECANICO : "e executada por (equipe, N:M)"
    OS ||--o{ OS_SERVICO : detalha
    SERVICO ||--o{ OS_SERVICO : e_referenciado_em
    OS_SERVICO ||--o{ OS_SERVICO_PECA : consome
    PECA ||--o{ OS_SERVICO_PECA : e_usada_em

    CLIENTE {
        int id_cliente PK
        string nome
        string cpf_cnpj
        string telefone
    }
    VEICULO {
        int id_veiculo PK
        int id_cliente FK
        string placa
        string modelo
        int ano
    }
    MECANICO {
        int id_mecanico PK
        string nome
        string endereco
        string especialidade
    }
    OS {
        int numero PK
        int id_veiculo FK
        int id_cliente FK
        date data_emissao
        date data_conclusao
        decimal valor_total
        string status "aberta, autorizada, em_execucao, concluida, cancelada"
        boolean autorizado_cliente
        datetime data_autorizacao
    }
    OS_MECANICO {
        int numero_os PK_FK
        int id_mecanico PK_FK
    }
    OS ||--o{ OS_MECANICO : ""
    MECANICO ||--o{ OS_MECANICO : ""
    SERVICO {
        int id_servico PK
        string descricao
        decimal valor_mao_obra "tabela de referencia"
    }
    OS_SERVICO {
        int id_os_servico PK
        int numero_os FK
        int id_servico FK
        decimal valor_mao_obra_aplicado "copia do valor de referencia no momento da OS"
    }
    PECA {
        int id_peca PK
        string descricao
        decimal valor_unitario
        int estoque
    }
    OS_SERVICO_PECA {
        int id_os_servico FK
        int id_peca FK
        int quantidade
        decimal valor_unitario_aplicado
    }
```

## Decisões de modelagem

| Regra de negócio | Decisão |
|---|---|
| Equipe de mecânicos (não um só) atende a OS | Relacionamento **N:M** entre `OS` e `MECANICO`, resolvido com a tabela associativa `OS_MECANICO` (PK composta = as duas FKs) |
| Serviço tem custo de mão de obra de referência, mas o valor cobrado na OS não deve mudar se a tabela de referência mudar depois | `SERVICO.valor_mao_obra` é a tabela de referência; `OS_SERVICO.valor_mao_obra_aplicado` copia esse valor no momento em que o serviço é lançado na OS (histórico imutável) |
| Serviço pode consumir peças (N:M entre serviço-executado-na-OS e peça) | Entidade associativa `OS_SERVICO_PECA`, com PK composta (`id_os_servico`, `id_peca`) e atributo `quantidade` |
| Cliente precisa autorizar antes da execução | `OS.autorizado_cliente` (booleano) + `data_autorizacao`; regra de negócio (bloquear início sem autorização) fica na aplicação/trigger, não no EER |
| Veículo pertence a um cliente, mas a OS referencia os dois | `OS` guarda `id_veiculo` e `id_cliente` como FK — redundante em relação a `VEICULO.id_cliente`, mas intencional: preserva o histórico caso o veículo mude de dono depois da OS ser fechada |

O mapeamento lógico (DDL executável, com seed e queries) está no [Desafio 4](../desafio-4-oficina-logico/).
