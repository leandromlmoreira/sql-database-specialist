-- MySQL dump 10.13  Distrib 8.4.9, for Win64 (x86_64)
--
-- Host: localhost    Database: ecommerce_desafio
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ecommerce_desafio`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ecommerce_desafio` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `ecommerce_desafio`;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `tipo` enum('PF','PJ') NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'Ana Souza','ana@example.com','PF'),(2,'Bruno Lima','bruno@example.com','PF'),(3,'Comercial Tech Ltda','contato@comercialtech.com','PJ'),(4,'Carla Nunes','carla@example.com','PF'),(6,'Roberto Faria','roberto.faria@example.com','PF');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_cliente_before_delete` BEFORE DELETE ON `cliente` FOR EACH ROW BEGIN
    INSERT INTO cliente_removido (id_cliente, nome, email, tipo, removido_em)
    VALUES (OLD.id_cliente, OLD.nome, OLD.email, OLD.tipo, NOW());
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cliente_pf`
--

DROP TABLE IF EXISTS `cliente_pf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente_pf` (
  `id_cliente` int NOT NULL,
  `cpf` char(11) NOT NULL,
  `data_nascimento` date NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `cpf` (`cpf`),
  CONSTRAINT `fk_pf_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente_pf`
--

LOCK TABLES `cliente_pf` WRITE;
/*!40000 ALTER TABLE `cliente_pf` DISABLE KEYS */;
INSERT INTO `cliente_pf` VALUES (1,'11122233344','1990-05-12'),(2,'22233344455','1985-11-03'),(4,'33344455566','1998-02-20');
/*!40000 ALTER TABLE `cliente_pf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente_pj`
--

DROP TABLE IF EXISTS `cliente_pj`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente_pj` (
  `id_cliente` int NOT NULL,
  `cnpj` char(14) NOT NULL,
  `razao_social` varchar(150) NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `cnpj` (`cnpj`),
  CONSTRAINT `fk_pj_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente_pj`
--

LOCK TABLES `cliente_pj` WRITE;
/*!40000 ALTER TABLE `cliente_pj` DISABLE KEYS */;
INSERT INTO `cliente_pj` VALUES (3,'12345678000199','Comercial Tech Ltda');
/*!40000 ALTER TABLE `cliente_pj` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente_removido`
--

DROP TABLE IF EXISTS `cliente_removido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente_removido` (
  `id_cliente` int NOT NULL,
  `nome` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `tipo` enum('PF','PJ') NOT NULL,
  `removido_em` datetime NOT NULL,
  PRIMARY KEY (`id_cliente`,`removido_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente_removido`
--

LOCK TABLES `cliente_removido` WRITE;
/*!40000 ALTER TABLE `cliente_removido` DISABLE KEYS */;
INSERT INTO `cliente_removido` VALUES (5,'Cliente Teste Trigger','teste.trigger@example.com','PF','2026-09-26 13:01:38');
/*!40000 ALTER TABLE `cliente_removido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrega`
--

DROP TABLE IF EXISTS `entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrega` (
  `id_entrega` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `status` enum('preparando','enviado','em_transito','entregue') NOT NULL DEFAULT 'preparando',
  `codigo_rastreio` varchar(30) DEFAULT NULL,
  `data_prevista` date DEFAULT NULL,
  PRIMARY KEY (`id_entrega`),
  UNIQUE KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `fk_entrega_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrega`
--

LOCK TABLES `entrega` WRITE;
/*!40000 ALTER TABLE `entrega` DISABLE KEYS */;
INSERT INTO `entrega` VALUES (1,1,'entregue','BR123456789','2026-01-15'),(2,2,'em_transito','BR987654321','2026-02-10'),(3,3,'preparando',NULL,'2026-02-27'),(4,4,'enviado','BR555555555','2026-03-06');
/*!40000 ALTER TABLE `entrega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_pedido`
--

DROP TABLE IF EXISTS `item_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_pedido` (
  `id_item` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_produto` int NOT NULL,
  `quantidade` int NOT NULL,
  `valor_unitario_aplicado` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_item`),
  KEY `fk_item_pedido` (`id_pedido`),
  KEY `fk_item_produto` (`id_produto`),
  CONSTRAINT `fk_item_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `fk_item_produto` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`),
  CONSTRAINT `item_pedido_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_pedido`
--

LOCK TABLES `item_pedido` WRITE;
/*!40000 ALTER TABLE `item_pedido` DISABLE KEYS */;
INSERT INTO `item_pedido` VALUES (1,1,1,2,55.90),(2,2,3,1,799.00),(3,3,2,1,289.90),(4,3,1,1,55.90),(5,3,4,1,74.00),(6,4,4,1,129.90),(7,6,2,1,289.90),(8,6,4,1,129.90),(9,7,1,1,49.90);
/*!40000 ALTER TABLE `item_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamento`
--

DROP TABLE IF EXISTS `pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamento` (
  `id_pagamento` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `forma` enum('cartao','boleto','pix') NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pagamento`),
  KEY `fk_pagamento_pedido` (`id_pedido`),
  CONSTRAINT `fk_pagamento_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `pagamento_chk_1` CHECK ((`valor` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamento`
--

LOCK TABLES `pagamento` WRITE;
/*!40000 ALTER TABLE `pagamento` DISABLE KEYS */;
INSERT INTO `pagamento` VALUES (1,1,'pix',111.80),(2,2,'cartao',799.00),(3,3,'cartao',300.00),(4,3,'boleto',119.80),(5,4,'pix',129.90);
/*!40000 ALTER TABLE `pagamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `data_pedido` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valor_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_pedido`),
  KEY `fk_pedido_cliente` (`id_cliente`),
  CONSTRAINT `fk_pedido_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,1,'2026-01-10 14:30:00',111.80),(2,2,'2026-02-05 09:15:00',799.00),(3,3,'2026-02-20 16:45:00',419.80),(4,1,'2026-03-01 11:00:00',129.90),(5,6,'2026-09-26 13:02:52',55.90),(6,1,'2026-09-26 13:02:52',419.80),(7,2,'2026-09-26 13:02:53',49.90);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `id_produto` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `estoque` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_produto`),
  CONSTRAINT `produto_chk_1` CHECK ((`valor_unitario` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (1,'Mouse sem fio',49.90,119),(2,'Teclado mecanico',289.90,39),(3,'Monitor 24\"',799.00,15),(4,'Webcam HD',129.90,59);
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_produto_before_update` BEFORE UPDATE ON `produto` FOR EACH ROW BEGIN
    IF NEW.valor_unitario <> OLD.valor_unitario THEN
        INSERT INTO produto_historico_preco (id_produto, valor_anterior, valor_novo, alterado_em)
        VALUES (OLD.id_produto, OLD.valor_unitario, NEW.valor_unitario, NOW());
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `produto_historico_preco`
--

DROP TABLE IF EXISTS `produto_historico_preco`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_historico_preco` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `id_produto` int NOT NULL,
  `valor_anterior` decimal(10,2) NOT NULL,
  `valor_novo` decimal(10,2) NOT NULL,
  `alterado_em` datetime NOT NULL,
  PRIMARY KEY (`id_historico`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_historico_preco`
--

LOCK TABLES `produto_historico_preco` WRITE;
/*!40000 ALTER TABLE `produto_historico_preco` DISABLE KEYS */;
INSERT INTO `produto_historico_preco` VALUES (1,1,55.90,59.90,'2026-09-26 13:01:39'),(2,1,59.90,49.90,'2026-09-26 13:01:39');
/*!40000 ALTER TABLE `produto_historico_preco` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ecommerce_desafio'
--

--
-- Dumping routines for database 'ecommerce_desafio'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_registrar_pedido` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_registrar_pedido`(
    IN p_id_cliente INT,
    IN p_id_produto1 INT, IN p_qtd1 INT,
    IN p_id_produto2 INT, IN p_qtd2 INT,
    OUT p_mensagem VARCHAR(200)
)
BEGIN
    DECLARE v_id_pedido INT;
    DECLARE v_preco1 DECIMAL(10, 2);
    DECLARE v_preco2 DECIMAL(10, 2);
    DECLARE v_estoque1 INT;
    DECLARE v_estoque2 INT;
    DECLARE v_item1_ok BOOLEAN DEFAULT FALSE;
    DECLARE v_item2_ok BOOLEAN DEFAULT FALSE;

    -- Erro fatal (ex.: cliente inexistente via SIGNAL) -> desfaz a transacao inteira
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_mensagem = 'Erro fatal: ROLLBACK completo, nenhum pedido foi criado';
    END;

    START TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente inexistente';
    END IF;

    INSERT INTO pedido (id_cliente, valor_total) VALUES (p_id_cliente, 0);
    SET v_id_pedido = LAST_INSERT_ID();

    -- Item 1: se nao tiver estoque, desfaz SO esse item (ROLLBACK TO SAVEPOINT),
    -- mas mantem o pedido e o outro item que ja deu certo
    SAVEPOINT sp_item1;
    SELECT valor_unitario, estoque INTO v_preco1, v_estoque1
    FROM produto WHERE id_produto = p_id_produto1 FOR UPDATE;

    IF v_estoque1 >= p_qtd1 THEN
        INSERT INTO item_pedido (id_pedido, id_produto, quantidade, valor_unitario_aplicado)
        VALUES (v_id_pedido, p_id_produto1, p_qtd1, v_preco1);
        UPDATE produto SET estoque = estoque - p_qtd1 WHERE id_produto = p_id_produto1;
        SET v_item1_ok = TRUE;
    ELSE
        ROLLBACK TO SAVEPOINT sp_item1;
    END IF;

    -- Item 2: mesma logica, savepoint independente
    SAVEPOINT sp_item2;
    SELECT valor_unitario, estoque INTO v_preco2, v_estoque2
    FROM produto WHERE id_produto = p_id_produto2 FOR UPDATE;

    IF v_estoque2 >= p_qtd2 THEN
        INSERT INTO item_pedido (id_pedido, id_produto, quantidade, valor_unitario_aplicado)
        VALUES (v_id_pedido, p_id_produto2, p_qtd2, v_preco2);
        UPDATE produto SET estoque = estoque - p_qtd2 WHERE id_produto = p_id_produto2;
        SET v_item2_ok = TRUE;
    ELSE
        ROLLBACK TO SAVEPOINT sp_item2;
    END IF;

    UPDATE pedido
    SET valor_total = (SELECT COALESCE(SUM(quantidade * valor_unitario_aplicado), 0)
                        FROM item_pedido WHERE id_pedido = v_id_pedido)
    WHERE id_pedido = v_id_pedido;

    COMMIT;
    SET p_mensagem = CONCAT('Pedido ', v_id_pedido, ' criado. Item1_ok=', v_item1_ok, ' Item2_ok=', v_item2_ok);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26 13:03:00
