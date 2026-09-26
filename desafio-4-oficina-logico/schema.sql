DROP DATABASE IF EXISTS oficina_desafio;
CREATE DATABASE oficina_desafio CHARACTER SET utf8mb4;
USE oficina_desafio;

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20)
);

CREATE TABLE veiculo (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    placa CHAR(7) NOT NULL UNIQUE,
    modelo VARCHAR(80) NOT NULL,
    ano SMALLINT NOT NULL,
    CONSTRAINT fk_veiculo_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE mecanico (
    id_mecanico INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    endereco VARCHAR(200),
    especialidade VARCHAR(80) NOT NULL
);

CREATE TABLE servico (
    id_servico INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(120) NOT NULL,
    valor_mao_obra DECIMAL(10, 2) NOT NULL CHECK (valor_mao_obra >= 0)
);

CREATE TABLE peca (
    id_peca INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(120) NOT NULL,
    valor_unitario DECIMAL(10, 2) NOT NULL CHECK (valor_unitario >= 0),
    estoque INT NOT NULL DEFAULT 0
);

CREATE TABLE os (
    numero INT AUTO_INCREMENT PRIMARY KEY,
    id_veiculo INT NOT NULL,
    id_cliente INT NOT NULL,
    data_emissao DATE NOT NULL DEFAULT (CURRENT_DATE),
    data_conclusao DATE,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status ENUM('aberta', 'autorizada', 'em_execucao', 'concluida', 'cancelada') NOT NULL DEFAULT 'aberta',
    autorizado_cliente BOOLEAN NOT NULL DEFAULT FALSE,
    data_autorizacao DATETIME,
    CONSTRAINT fk_os_veiculo FOREIGN KEY (id_veiculo) REFERENCES veiculo(id_veiculo),
    CONSTRAINT fk_os_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE os_mecanico (
    numero_os INT NOT NULL,
    id_mecanico INT NOT NULL,
    PRIMARY KEY (numero_os, id_mecanico),
    CONSTRAINT fk_osmec_os FOREIGN KEY (numero_os) REFERENCES os(numero),
    CONSTRAINT fk_osmec_mecanico FOREIGN KEY (id_mecanico) REFERENCES mecanico(id_mecanico)
);

CREATE TABLE os_servico (
    id_os_servico INT AUTO_INCREMENT PRIMARY KEY,
    numero_os INT NOT NULL,
    id_servico INT NOT NULL,
    valor_mao_obra_aplicado DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_ossrv_os FOREIGN KEY (numero_os) REFERENCES os(numero),
    CONSTRAINT fk_ossrv_servico FOREIGN KEY (id_servico) REFERENCES servico(id_servico)
);

CREATE TABLE os_servico_peca (
    id_os_servico INT NOT NULL,
    id_peca INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    valor_unitario_aplicado DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_os_servico, id_peca),
    CONSTRAINT fk_ossp_ossrv FOREIGN KEY (id_os_servico) REFERENCES os_servico(id_os_servico),
    CONSTRAINT fk_ossp_peca FOREIGN KEY (id_peca) REFERENCES peca(id_peca)
);
