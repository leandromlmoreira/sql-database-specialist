# Desafio 1 — Refinando um Projeto Conceitual de Banco de Dados (E-commerce)

Desafio de projeto da trilha [Formação SQL Database Specialist](https://web.dio.me/track/1a5a10ed-417c-4fef-8531-2097ff072817) (DIO), módulo *Modelo de Entidade Relacional*.

## Cenário

O modelo conceitual de e-commerce apresentado nas aulas (`Cliente`, `Pedido`, `Produto`, `Pagamento`, `Entrega`) precisa de três refinamentos:

1. **Cliente PJ/PF** — uma conta é sempre **Pessoa Física OU Pessoa Jurídica**, nunca as duas. Isso é uma especialização **disjunta** e **total** (toda conta cai em uma das duas categorias).
2. **Pagamento** — um pedido pode ter **mais de uma forma de pagamento** (ex.: parte no cartão, parte em boleto), então o relacionamento `Pedido`–`Pagamento` é **1:N**, e não 1:1.
3. **Entrega** — precisa registrar **status** (ex.: `preparando`, `enviado`, `em trânsito`, `entregue`) e **código de rastreio**.

## Modelo (EER)

```mermaid
erDiagram
    CLIENTE ||--o{ PEDIDO : realiza
    PEDIDO ||--o{ ITEM_PEDIDO : contem
    PRODUTO ||--o{ ITEM_PEDIDO : e_referenciado_em
    PEDIDO ||--o{ PAGAMENTO : "e pago por (1:N)"
    PEDIDO ||--|| ENTREGA : gera

    CLIENTE {
        int id_cliente PK
        string nome
        string email
        string tipo "PF ou PJ (discriminador)"
    }
    CLIENTE_PF {
        int id_cliente PK_FK
        string cpf
        date data_nascimento
    }
    CLIENTE_PJ {
        int id_cliente PK_FK
        string cnpj
        string razao_social
    }
    CLIENTE ||--o| CLIENTE_PF : "especializa (disjunto, total)"
    CLIENTE ||--o| CLIENTE_PJ : "especializa (disjunto, total)"

    PEDIDO {
        int id_pedido PK
        int id_cliente FK
        datetime data_pedido
        decimal valor_total
    }
    PAGAMENTO {
        int id_pagamento PK
        int id_pedido FK
        string forma "cartao, boleto, pix..."
        decimal valor
    }
    ENTREGA {
        int id_entrega PK
        int id_pedido FK
        string status "preparando, enviado, em_transito, entregue"
        string codigo_rastreio
        date data_prevista
    }
```

## Justificativas de projeto

| Refinamento | Regra de negócio | Decisão de modelagem |
|---|---|---|
| Cliente PJ/PF | Nenhuma conta é as duas coisas ao mesmo tempo, e toda conta é uma das duas | Especialização **disjunta (d) e total**: `CLIENTE` fica com os atributos comuns + um atributo `tipo` (discriminador); `CLIENTE_PF` e `CLIENTE_PJ` herdam a PK como FK (mapeamento clássico de especialização total: uma tabela por subclasse, ligada 1:1 à superclasse) |
| Pagamento | Um pedido pode ser pago em partes/formas diferentes | Relacionamento **1:N** (`PEDIDO` 1 — N `PAGAMENTO`), com `PAGAMENTO.id_pedido` como FK; a soma dos `valor` dos pagamentos de um pedido deve bater com `PEDIDO.valor_total` (regra de negócio validada em aplicação/trigger, não representável só no EER) |
| Entrega | Precisa rastrear o envio | `ENTREGA` ganha `status` (enum controlado) e `codigo_rastreio`; mantido 1:1 com `PEDIDO` pois cada pedido gera exatamente uma entrega neste escopo |

O mapeamento lógico (DDL executável) desses refinamentos está implementado e testado no [Desafio 3](../desafio-3-ecommerce-logico/), que reaproveita este modelo.
