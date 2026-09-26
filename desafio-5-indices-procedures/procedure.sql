USE company_desafio;

-- Procedure CRUD parametrizada para a tabela employee.
-- p_operacao (variavel de controle) decide, via CASE, qual acao executar:
--   'I' = insere, 'U' = atualiza salario, 'D' = remove, 'S' = consulta por Ssn
DROP PROCEDURE IF EXISTS sp_employee_crud;

DELIMITER $$

CREATE PROCEDURE sp_employee_crud(
    IN p_operacao CHAR(1),
    IN p_ssn CHAR(9),
    IN p_fname VARCHAR(30),
    IN p_lname VARCHAR(30),
    IN p_salary DECIMAL(10, 2),
    IN p_dno INT,
    OUT p_mensagem VARCHAR(120)
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;

    SELECT COUNT(*) INTO v_existe FROM employee WHERE Ssn = p_ssn;

    CASE p_operacao
        WHEN 'I' THEN
            IF v_existe > 0 THEN
                SET p_mensagem = CONCAT('Erro: ja existe funcionario com Ssn ', p_ssn);
            ELSE
                INSERT INTO employee (Ssn, Fname, Lname, Salary, Dno)
                VALUES (p_ssn, p_fname, p_lname, p_salary, p_dno);
                SET p_mensagem = CONCAT('Funcionario ', p_fname, ' inserido com sucesso');
            END IF;

        WHEN 'U' THEN
            IF v_existe = 0 THEN
                SET p_mensagem = CONCAT('Erro: funcionario ', p_ssn, ' nao encontrado');
            ELSE
                UPDATE employee SET Salary = p_salary WHERE Ssn = p_ssn;
                SET p_mensagem = CONCAT('Salario atualizado para ', p_salary);
            END IF;

        WHEN 'D' THEN
            IF v_existe = 0 THEN
                SET p_mensagem = CONCAT('Erro: funcionario ', p_ssn, ' nao encontrado');
            ELSE
                DELETE FROM employee WHERE Ssn = p_ssn;
                SET p_mensagem = CONCAT('Funcionario ', p_ssn, ' removido');
            END IF;

        WHEN 'S' THEN
            IF v_existe = 0 THEN
                SET p_mensagem = CONCAT('Erro: funcionario ', p_ssn, ' nao encontrado');
            ELSE
                SET p_mensagem = 'Consulta OK - ver resultado acima';
                SELECT * FROM employee WHERE Ssn = p_ssn;
            END IF;

        ELSE
            SET p_mensagem = CONCAT('Erro: operacao invalida "', p_operacao, '" (use I, U, D ou S)');
    END CASE;
END$$

DELIMITER ;

-- ---- Testes manuais da procedure ----

CALL sp_employee_crud('I', '666666666', 'Paulo', 'Andrade', 4800.00, 3, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('I', '666666666', 'Paulo', 'Andrade', 4800.00, 3, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('U', '666666666', NULL, NULL, 5200.00, NULL, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('S', '666666666', NULL, NULL, NULL, NULL, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('D', '666666666', NULL, NULL, NULL, NULL, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('D', '666666666', NULL, NULL, NULL, NULL, @msg);
SELECT @msg AS resultado;

CALL sp_employee_crud('X', '999999999', NULL, NULL, NULL, NULL, @msg);
SELECT @msg AS resultado;
