-- ============================================
-- MIGRACIÓN: seguridad + chat de apoyo
-- Ejecutar en phpMyAdmin sobre 4739677_braintraining
-- ============================================

-- 1. Renombramos la columna password actual y preparamos el hash
ALTER TABLE `usuarios` CHANGE `password` `password_legacy` varchar(255) NOT NULL;
ALTER TABLE `usuarios` ADD `password_hash` varchar(255) DEFAULT NULL AFTER `password_legacy`;

-- IMPORTANTE: tras esta migración, cada usuario debe re-establecer su contraseña
-- (o el backend la migra automáticamente la primera vez que inicien sesión,
-- comparando contra password_legacy y guardando el hash bcrypt). El código
-- del backend que te paso ya hace esto.

-- 2. Tabla de conversaciones de chat (una por usuario, se reabre la misma)
CREATE TABLE `conversaciones_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'abierta',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_conv_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de mensajes
CREATE TABLE `mensajes_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversacion_id` int NOT NULL,
  `autor` enum('usuario','ia','sistema') NOT NULL,
  `texto` text NOT NULL,
  `derivado_a_cita` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversacion_id` (`conversacion_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones_chat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Reutilizamos tu sistema de citas: tabla simple de huecos + solicitudes
CREATE TABLE `disponibilidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `ocupado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `disponibilidad_id` int NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `enlace_videollamada` varchar(255) DEFAULT NULL,
  `motivo_consulta` text,
  `origen` varchar(20) DEFAULT 'manual' COMMENT 'manual | chat_ia',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `disponibilidad_id` (`disponibilidad_id`),
  CONSTRAINT `fk_cita_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_disp` FOREIGN KEY (`disponibilidad_id`) REFERENCES `disponibilidad` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
