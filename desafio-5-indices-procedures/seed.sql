USE company_desafio;

INSERT INTO department (Dnumber, Dname, Mgr_ssn, Mgr_start_date) VALUES
    (1, 'Headquarters', NULL, NULL),
    (2, 'Research', NULL, NULL),
    (3, 'Administration', NULL, NULL);

INSERT INTO employee (Ssn, Fname, Minit, Lname, Bdate, Address, Sex, Salary, Super_ssn, Dno) VALUES
    ('111111111', 'James', 'E', 'Borg', '1965-03-29', 'Rua 1', 'M', 15000.00, NULL, 1),
    ('222222222', 'Franklin', 'T', 'Wong', '1970-06-15', 'Rua 2', 'M', 9000.00, '111111111', 2),
    ('333333333', 'Alicia', 'J', 'Zelaya', '1980-01-19', 'Rua 3', 'F', 6000.00, '111111111', 3),
    ('444444444', 'Jennifer', 'S', 'Wallace', '1975-06-20', 'Rua 4', 'F', 7500.00, '222222222', 2),
    ('555555555', 'Ramesh', 'K', 'Narayan', '1988-09-15', 'Rua 5', 'M', 5500.00, '222222222', 2);

UPDATE department SET Mgr_ssn = '111111111', Mgr_start_date = '2015-01-01' WHERE Dnumber = 1;
UPDATE department SET Mgr_ssn = '222222222', Mgr_start_date = '2018-05-01' WHERE Dnumber = 2;
UPDATE department SET Mgr_ssn = '333333333', Mgr_start_date = '2019-03-01' WHERE Dnumber = 3;

INSERT INTO dept_locations (Dnumber, Dlocation) VALUES
    (1, 'Sao Paulo'),
    (2, 'Sao Paulo'),
    (2, 'Campinas'),
    (3, 'Rio de Janeiro');

INSERT INTO project (Pnumber, Pname, Plocation, Dnum) VALUES
    (10, 'Sistema de Folha', 'Sao Paulo', 3),
    (20, 'Plataforma de Dados', 'Campinas', 2),
    (30, 'App Mobile', 'Sao Paulo', 2);

INSERT INTO works_on (Essn, Pno, Hours) VALUES
    ('222222222', 20, 20.0),
    ('222222222', 30, 15.0),
    ('444444444', 20, 30.0),
    ('555555555', 30, 25.0),
    ('333333333', 10, 40.0);

INSERT INTO dependent (Essn, Dependent_name, Sex, Bdate, Relationship) VALUES
    ('222222222', 'Joana Wong', 'F', '1998-01-01', 'Filha'),
    ('222222222', 'Pedro Wong', 'M', '2001-05-10', 'Filho'),
    ('444444444', 'Marcos Wallace', 'M', '2010-08-14', 'Filho');
