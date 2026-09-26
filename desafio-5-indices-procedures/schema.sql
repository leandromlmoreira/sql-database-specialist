-- Desafio 5 — Personalizando o Banco de Dados com Indices e Procedures
-- Schema COMPANY classico (Elmasri & Navathe), usado nas aulas de Triggers/Indexacao

DROP DATABASE IF EXISTS company_desafio;
CREATE DATABASE company_desafio CHARACTER SET utf8mb4;
USE company_desafio;

CREATE TABLE department (
    Dnumber INT PRIMARY KEY,
    Dname VARCHAR(40) NOT NULL UNIQUE,
    Mgr_ssn CHAR(9),
    Mgr_start_date DATE
);

CREATE TABLE employee (
    Ssn CHAR(9) PRIMARY KEY,
    Fname VARCHAR(30) NOT NULL,
    Minit CHAR(1),
    Lname VARCHAR(30) NOT NULL,
    Bdate DATE,
    Address VARCHAR(100),
    Sex CHAR(1),
    Salary DECIMAL(10, 2),
    Super_ssn CHAR(9),
    Dno INT NOT NULL,
    CONSTRAINT fk_emp_dept FOREIGN KEY (Dno) REFERENCES department(Dnumber),
    CONSTRAINT fk_emp_super FOREIGN KEY (Super_ssn) REFERENCES employee(Ssn)
);

ALTER TABLE department
    ADD CONSTRAINT fk_dept_mgr FOREIGN KEY (Mgr_ssn) REFERENCES employee(Ssn);

CREATE TABLE dept_locations (
    Dnumber INT NOT NULL,
    Dlocation VARCHAR(60) NOT NULL,
    PRIMARY KEY (Dnumber, Dlocation),
    CONSTRAINT fk_deptloc_dept FOREIGN KEY (Dnumber) REFERENCES department(Dnumber)
);

CREATE TABLE project (
    Pnumber INT PRIMARY KEY,
    Pname VARCHAR(60) NOT NULL,
    Plocation VARCHAR(60),
    Dnum INT NOT NULL,
    CONSTRAINT fk_proj_dept FOREIGN KEY (Dnum) REFERENCES department(Dnumber)
);

CREATE TABLE works_on (
    Essn CHAR(9) NOT NULL,
    Pno INT NOT NULL,
    Hours DECIMAL(4, 1) NOT NULL,
    PRIMARY KEY (Essn, Pno),
    CONSTRAINT fk_workson_emp FOREIGN KEY (Essn) REFERENCES employee(Ssn),
    CONSTRAINT fk_workson_proj FOREIGN KEY (Pno) REFERENCES project(Pnumber)
);

CREATE TABLE dependent (
    Essn CHAR(9) NOT NULL,
    Dependent_name VARCHAR(30) NOT NULL,
    Sex CHAR(1),
    Bdate DATE,
    Relationship VARCHAR(20),
    PRIMARY KEY (Essn, Dependent_name),
    CONSTRAINT fk_dependent_emp FOREIGN KEY (Essn) REFERENCES employee(Ssn)
);

-- ============================================================
-- INDICES (com justificativa de uso)
-- ============================================================

-- 1. Busca frequente de funcionarios por sobrenome (relatorios, telas de busca por nome)
CREATE INDEX idx_employee_lname ON employee (Lname);

-- 2. Dno ja tem FK mas ganha indice explicito: consultas "funcionarios do departamento X"
--    sao muito mais comuns que alteracoes de departamento, e o MySQL nao cria indice
--    automatico em toda coluna de FK quando ela participa de mais de uma clausula
CREATE INDEX idx_employee_dno ON employee (Dno);

-- 3. Consulta por faixa salarial (folha de pagamento, relatorios de RH) - indice B-tree
--    aproveita bem operadores de intervalo (BETWEEN, >, <)
CREATE INDEX idx_employee_salary ON employee (Salary);

-- 4. Pesquisa exata por nome de projeto (tela "buscar projeto por nome") - unico e
--    consultado sempre por igualdade, entao HASH e mais eficiente que B-tree aqui.
--    Observacao testada: o InnoDB nao suporta indice HASH explicito e converte
--    silenciosamente para BTREE (confirmado com SHOW INDEX) - a clausula fica
--    documentando a intencao, mas so teria efeito real com ENGINE=MEMORY.
CREATE UNIQUE INDEX idx_project_pname ON project (Pname) USING HASH;

-- 5. works_on ja tem PK composta (Essn, Pno) que cobre buscas "horas do funcionario X no
--    projeto Y", mas falta indice para o sentido inverso: "quem trabalha no projeto Y"
CREATE INDEX idx_workson_pno ON works_on (Pno);
