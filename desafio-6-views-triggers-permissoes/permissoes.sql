DROP USER IF EXISTS 'gerente_rh'@'localhost';
DROP USER IF EXISTS 'funcionario_rh'@'localhost';

CREATE USER 'gerente_rh'@'localhost' IDENTIFIED BY 'GerenteRh#2026';
CREATE USER 'funcionario_rh'@'localhost' IDENTIFIED BY 'FuncionarioRh#2026';

GRANT SELECT, INSERT, UPDATE, DELETE ON company_desafio.* TO 'gerente_rh'@'localhost';

GRANT SELECT ON company_desafio.vw_employee_public TO 'funcionario_rh'@'localhost';
GRANT SELECT ON company_desafio.vw_department_manager TO 'funcionario_rh'@'localhost';
GRANT SELECT ON company_desafio.vw_project_hours TO 'funcionario_rh'@'localhost';
GRANT SELECT ON company_desafio.vw_employee_dependents_count TO 'funcionario_rh'@'localhost';

FLUSH PRIVILEGES;
