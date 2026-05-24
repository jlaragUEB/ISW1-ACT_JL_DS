-- ============================================================
-- Script de Base de Datos — Sistema Gestión Financiera ISW1
-- Base de datos: PostgreSQL
-- ============================================================

-- Crear base de datos (ejecutar como superusuario si es necesario)
-- CREATE DATABASE financiero_db;

-- Conectarse a la base de datos antes de ejecutar el resto:
-- \c financiero_db

-- ============================================================
-- TABLA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id          SERIAL PRIMARY KEY,
    numero_id   VARCHAR(20)  NOT NULL UNIQUE,
    nombre      VARCHAR(150) NOT NULL,
    correo      VARCHAR(150) NOT NULL UNIQUE,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: tarjetas
-- ============================================================
CREATE TABLE IF NOT EXISTS tarjetas (
    id               SERIAL PRIMARY KEY,
    numero_tarjeta   VARCHAR(16)    NOT NULL UNIQUE,
    fecha_vencimiento VARCHAR(7)    NOT NULL,          -- Formato MM/YYYY
    franquicia       VARCHAR(20)    NOT NULL,           -- VISA | MASTERCARD | AMEX
    estado           VARCHAR(10)    NOT NULL DEFAULT 'ACTIVO', -- ACTIVO | INACTIVO
    cupo_total       NUMERIC(15,2)  NOT NULL,
    cupo_disponible  NUMERIC(15,2)  NOT NULL,
    cupo_utilizado   NUMERIC(15,2)  NOT NULL,
    cliente_id       INTEGER        NOT NULL REFERENCES clientes(id),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DATOS DE PRUEBA (opcional)
-- ============================================================
INSERT INTO clientes (numero_id, nombre, correo)
VALUES ('123456789', 'Ana García López', 'ana.garcia@ejemplo.com')
ON CONFLICT DO NOTHING;

INSERT INTO clientes (numero_id, nombre, correo)
VALUES ('987654321', 'Carlos Rodríguez', 'carlos.rodriguez@ejemplo.com')
ON CONFLICT DO NOTHING;
