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

CREATE INDEX idx_employee_lname ON employee (Lname);

CREATE INDEX idx_employee_dno ON employee (Dno);

CREATE INDEX idx_employee_salary ON employee (Salary);

CREATE UNIQUE INDEX idx_project_pname ON project (Pname) USING HASH;

CREATE INDEX idx_workson_pno ON works_on (Pno);
