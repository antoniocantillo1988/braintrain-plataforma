-- ============================================
-- SQL para crear las tablas del chat con IA
-- Ejecutar en phpMyAdmin sobre tu base de datos
-- ============================================

-- 1. Tabla de conversaciones (una por usuario)
CREATE TABLE IF NOT EXISTS `conversaciones_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'abierta',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_conv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de mensajes
CREATE TABLE IF NOT EXISTS `mensajes_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversacion_id` int NOT NULL,
  `autor` enum('usuario','ia','sistema') NOT NULL,
  `texto` text NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversacion_id` (`conversacion_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones_chat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
