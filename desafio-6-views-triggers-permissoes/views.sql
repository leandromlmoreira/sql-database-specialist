USE company_desafio;

-- 1. Funcionarios com o nome do departamento (visao geral usada em quase toda tela de RH)
CREATE OR REPLACE VIEW vw_employee_department AS
SELECT e.Ssn, e.Fname, e.Lname, e.Salary, d.Dname AS Departamento
FROM employee e
JOIN department d ON d.Dnumber = e.Dno;

-- 2. Departamentos com o nome do gerente responsavel
CREATE OR REPLACE VIEW vw_department_manager AS
SELECT d.Dnumber, d.Dname, CONCAT(m.Fname, ' ', m.Lname) AS Gerente, d.Mgr_start_date
FROM department d
LEFT JOIN employee m ON m.Ssn = d.Mgr_ssn;

-- 3. Total de horas alocadas por projeto (visao de gestao de projetos)
CREATE OR REPLACE VIEW vw_project_hours AS
SELECT p.Pnumber, p.Pname, SUM(w.Hours) AS total_horas, COUNT(DISTINCT w.Essn) AS qtd_funcionarios
FROM project p
JOIN works_on w ON w.Pno = p.Pnumber
GROUP BY p.Pnumber, p.Pname;

-- 4. Quantidade de dependentes por funcionario (usada pelo RH para beneficios)
CREATE OR REPLACE VIEW vw_employee_dependents_count AS
SELECT e.Ssn, e.Fname, e.Lname, COUNT(dep.Dependent_name) AS qtd_dependentes
FROM employee e
LEFT JOIN dependent dep ON dep.Essn = e.Ssn
GROUP BY e.Ssn, e.Fname, e.Lname;

-- 5. Funcionarios sem informacao salarial (dado sensivel), para uso por perfis sem
--    permissao de ver salario - expoe so nome e departamento
CREATE OR REPLACE VIEW vw_employee_public AS
SELECT e.Ssn, e.Fname, e.Lname, d.Dname AS Departamento
FROM employee e
JOIN department d ON d.Dnumber = e.Dno;
