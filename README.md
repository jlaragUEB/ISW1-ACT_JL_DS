# ISW1-ACT-DS_JL — Sistema de Gestión de Información Financiera

**Universidad El Bosque | Ingeniería de Software 1**  
**Equipo:** Dayana (DS) + Jhonatan (JL)

---

## Descripción

Aplicación web de página única (SPA) para el registro y visualización de información financiera de clientes y sus tarjetas de crédito.

---

## Herramientas y tecnologías

| Capa | Tecnología |
|------|-----------|
| Lenguaje Backend | Java 17 |
| Framework Backend | Spring Boot 3.2 |
| Build Tool | Apache Maven |
| Base de Datos | PostgreSQL 15 |
| Lenguaje Frontend | JavaScript (ES2022) |
| Framework Frontend | React 18 + Vite 5 |
| IDE recomendado | IntelliJ IDEA / VS Code |
| Control de versiones | Git + GitHub |
| Gestión de tareas | Jira |
| Análisis estático | SonarCloud + GitHub Actions |

---

## Requisitos previos

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 15+

---

## Configuración de la Base de Datos

1. Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE financiero_db;
```

2. Ejecuta el script:
```bash
psql -U postgres -d financiero_db -f db_script.sql
```

3. Ajusta las credenciales en `backend/src/main/resources/application.properties` si es necesario.

---

## Ejecutar el Backend

```bash
cd backend
mvn spring-boot:run
```

El servidor inicia en: `http://localhost:8080`

### Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/clientes` | Listar todos los clientes |
| POST | `/api/clientes` | Registrar un cliente |
| GET | `/api/tarjetas` | Listar todas las tarjetas |
| POST | `/api/tarjetas` | Registrar una tarjeta |
| PATCH | `/api/tarjetas/{id}/estado` | Eliminar lógicamente una tarjeta |
| PUT | `/api/tarjetas/{id}/cupo` | Actualizar cupo total de una tarjeta |

---

## Ejecutar el Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend inicia en: `http://localhost:5173`

---

## Ejecutar las Pruebas Unitarias

```bash
cd backend
mvn test
```

---

## Reglas de negocio implementadas

- **Franquicia calculada automáticamente:**
  - VISA: 16 dígitos, inicia con 4
  - MASTERCARD: 16 dígitos, primeros dos entre 51-55
  - AMEX: 15 dígitos, inicia con 34 o 37
- **Cupo Utilizado** = Cupo Total − Cupo Disponible
- **Estado** siempre `ACTIVO` al registrar, `INACTIVO` al eliminar lógicamente
- La **modificación** solo permite actualizar el Cupo Total
- Los números de tarjeta son **únicos**
- Los nuevos registros aparecen **sin refrescar la página**

---

## Formato de commits

```
[iniciales]-[código_jira]: descripción corta
Ejemplo: DS-ISW1JLDS-7: Implementar tabla de tarjetas
```
# SCRUM-9
