# 🌐 BusManage API

> Sistema backend integral para gestión de transporte de autobuses, rutas, boletos y reservas

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green?logo=node.js)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red?logo=nestjs)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://prisma.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?logo=docker)](https://www.docker.com)

## 📖 Descripción del Proyecto

BusManage API es una aplicación backend construida con **NestJS** que proporciona un sistema completo de gestión de transporte.

### Características principales

- 🔐 **Autenticación JWT** con Passport.js y Refresh Tokens
- 👥 **Control de roles y permisos** (admin, user, viewer)
- 🔑 **Recuperación de contraseña** con tokens seguros
- 🛡️ **Contraseñas hasheadas** con bcrypt
- 🔄 **Refresh Token** para renovación segura de sesiones (7 días)
- 📊 **Auditoría de sesiones** con timestamps de creación y expiración
- 🚫 **Logout** con revocación de refresh tokens
- 📈 **Rate Limiting** para protección contra ataques de fuerza bruta
- 📚 **Documentación API** automática con Swagger/OpenAPI
- ✅ **Validación robusta** con class-validator y class-transformer
- 🗄️ **ORM moderno** con Prisma y PostgreSQL
- 🐳 **Containerizado** con Docker y Docker Compose
- 🔧 **Completamente tipado** con TypeScript
- 🧪 **Testing** con Jest
- 📋 **Linting y formateo** con ESLint y Prettier

---

## 📁 Estructura del Proyecto

```
bus-manage-api/
├── 📁 prisma/
│   ├── migrations/           # Historial de migraciones de BD
│   ├── schema.prisma         # Esquema de datos con Prisma
│   └── migration_lock.toml   # Lock file de migraciones
│
├── 📁 src/
│   ├── 📁 auth/              # Módulo de autenticación
│   │   ├── decorators/       # Decoradores personalizados
│   │   │   ├── get-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── change-password.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── guards/           # Guards de protección
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interfaces/       # Interfaces TypeScript
│   │   │   ├── auth-response.interface.ts
│   │   │   └── jwt-payload.interface.ts
│   │   ├── strategies/       # Estrategias de Passport
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   │
│   ├── 📁 config/            # Configuración de la app
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── throttler.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── 📁 prisma/            # Módulo de Prisma ORM
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── app.controller.ts
│   ├── app.module.ts         # Módulo raíz
│   ├── app.service.ts
│   └── main.ts               # Entry point de la aplicación
│
├── 📁 test/                  # Pruebas
│   ├── app.e2e-spec.ts       # Tests E2E
│   └── jest-e2e.json         # Configuración de Jest
│
├── 📄 .env                   # Variables de entorno (local)
├── 📄 .env.example           # Plantilla de variables
├── 📄 .eslintrc.mjs          # Configuración ESLint
├── 📄 .gitignore             # Archivos ignorados por Git
├── 📄 docker-compose.yml     # Configuración Docker Compose
├── 📄 nest-cli.json          # Configuración NestJS CLI
├── 📄 package.json           # Dependencias y scripts
├── 📄 prisma.config.ts       # Configuración de Prisma
├── 📄 tsconfig.json          # Configuración TypeScript
├── 📄 tsconfig.build.json    # TypeScript para build
└── 📄 README.md              # Este archivo
```

---

## 🚀 Inicio Rápido

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/bert0h-dev/BusManage-API.git
cd bus-manage-api
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu entorno
nano .env
```

**Variables necesarias en `.env`:**

```env
# Servidor
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/busmanage

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 4️⃣ Iniciar la Base de Datos

```bash
# Levanta PostgreSQL en Docker
docker-compose up -d postgres

# Espera 10 segundos a que PostgreSQL esté listo
sleep 10
```

### 5️⃣ Configurar Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev
```

### 6️⃣ Iniciar el Servidor

```bash
# Modo desarrollo con watch
npm run start:dev

# O en modo producción
npm run build
npm run start:prod
```

El servidor estará disponible en: **http://localhost:3000**

### 7️⃣ Verificar que funciona

```bash
# Health check
curl http://localhost:3000/api

# Acceder a Swagger documentation
# Abre en tu navegador: http://localhost:3000/api/docs
```

---

## 🔧 Comandos Disponibles

### 📦 Scripts npm

```bash
# ============ DESARROLLO ============

# Iniciar en modo development con watch
npm run start:dev

# Iniciar en modo debug
npm run start:debug

# ============ PRODUCCIÓN ============

# Build para producción
npm run build

# Iniciar desde el build
npm run start:prod

# ============ TESTING ============

# Ejecutar tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests E2E
npm run test:e2e

# ============ CÓDIGO & FORMATO ============

# Linting con ESLint
npm run lint

# Formatear código con Prettier
npm run format

# ============ BASE DE DATOS ============

# Abrir Prisma Studio (GUI)
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Reset de BD (⚠️ borra todos los datos)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Generar cliente Prisma
npx prisma generate
```

---

## 🛠️ Stack Tecnológico

| Tecnología          | Versión | Propósito                    |
| ------------------- | ------- | ---------------------------- |
| **Node.js**         | 22.x    | Runtime JavaScript           |
| **NestJS**          | 11.x    | Framework backend            |
| **TypeScript**      | 5.x     | Lenguaje tipado              |
| **Prisma**          | 7.x     | ORM y migrations             |
| **PostgreSQL**      | 17      | Base de datos relacional     |
| **JWT**             | -       | Autenticación stateless      |
| **Passport.js**     | 0.7.x   | Estrategias de autenticación |
| **bcrypt**          | 6.x     | Hash de contraseñas          |
| **class-validator** | 0.14.x  | Validación de DTOs           |
| **Throttler**       | 5.x     | Rate Limiting                |
| **Swagger**         | 11.x    | Documentación API            |
| **Docker**          | 24.x    | Containerización             |
| **Jest**            | 30.x    | Testing framework            |
| **ESLint**          | 9.x     | Linting                      |
| **Prettier**        | 3.x     | Code formatting              |

---

## 📚 Documentación de API

La documentación interactiva de la API está disponible en **Swagger/OpenAPI** una vez el servidor esté corriendo:

```
http://localhost:3000/api/docs
```

### Endpoints principales disponibles

#### 🔐 Autenticación (`/api/auth`)

- `POST /auth/register` - Registrar nuevo usuario (⚠️ Rate limit: 5/10 min)
- `POST /auth/login` - Login con email y contraseña (⚠️ Rate limit: 3/15 min)
- `POST /auth/refresh` - Renovar access token con refresh token (⚠️ Rate limit: 10/60 seg)
- `POST /auth/logout` - Cerrar sesión (requiere JWT)
- `POST /auth/forgot-password` - Solicitar reset de contraseña (⚠️ Rate limit: 3/30 min)
- `POST /auth/reset-password` - Resetear contraseña con token
- `POST /auth/change-password` - Cambiar contraseña (requiere autenticación)

#### 📄 General (`/api`)

- `GET /` - Health check de la API

---

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación con Refresh Token

Este proyecto implementa autenticación **JWT** (JSON Web Tokens) con **Passport.js** y **Refresh Tokens** para mayor seguridad:

1. **Login**: El usuario envía credenciales a `/auth/login`
2. **Tokens**: El servidor retorna:
   - `accessToken` (JWT de corta duración: 15 minutos) - Para requests
   - `refreshToken` (JWT de larga duración: 7 días) - Para renovación
3. **Requests**: El cliente envía el `accessToken` en header `Authorization: Bearer <token>`
4. **Renovación**: Cuando el `accessToken` expira, usar `refreshToken` en `/auth/refresh` para obtener nuevos tokens
5. **Logout**: El `refreshToken` es revocado en la BD para invalidad la sesión

### Rate Limiting (Protección contra ataques)

Rate limiting está implementado usando `@nestjs/throttler` para proteger endpoints críticos:

| Endpoint                     | Límite      | Ventana     | Propósito                     |
| ---------------------------- | ----------- | ----------- | ----------------------------- |
| `POST /auth/register`        | 5 requests  | 10 minutos  | Prevenir spam                 |
| `POST /auth/login`           | 3 requests  | 15 minutos  | Prevenir fuerza bruta         |
| `POST /auth/forgot-password` | 3 requests  | 30 minutos  | Prevenir abuso                |
| `POST /auth/refresh`         | 10 requests | 60 segundos | Permitir renovación frecuente |
| **Global**                   | 10 requests | 60 segundos | Protección general            |

Respuesta cuando se alcanza el límite (HTTP 429):

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

Headers adicionales:

```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642704900000
```

### Roles y Permisos

```typescript
enum UserRole {
  admin   // Acceso total
  user    // Usuario regular
  viewer  // Solo lectura
}
```

### Ejemplo de flujo completo de Autenticación

```bash
# 1. Registrarse (Rate limit: 5 intentos / 10 minutos)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"SecurePass123!",
    "fullName":"John Doe"
  }'

# Respuesta:
{
  "user": {
    "id": "uuid-123",
    "email": "newuser@example.com",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-20T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 2. Login (Rate limit: 3 intentos / 15 minutos)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Respuesta: accessToken + refreshToken

# 3. Usar accessToken en requests normales
curl -X GET http://localhost:3000/api/auth/session-info \
  -H "Authorization: Bearer <accessToken>"

# 4. Cuando accessToken expira (15 min después), renovar con refreshToken
# (Rate limit: 10 intentos / 60 segundos)
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

# Respuesta: nuevos accessToken + refreshToken

# 5. Logout (revoca el refreshToken en BD)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <accessToken>"

# Respuesta:
{
  "message": "Sesión cerrada correctamente"
}
```

### Cambio de contraseña

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword":"password123",
    "newPassword":"NewSecurePass456!"
  }'
```

### Recuperación de contraseña

```bash
# 1. Solicitar reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Usuario recibe email con token (en desarrollo, verificar logs)

# 3. Resetear contraseña con token
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"<reset_token_from_email>",
    "newPassword":"NewSecurePass456!"
  }'
```

---

## 🐳 Docker

### Comandos Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Levantar solo PostgreSQL
docker-compose up -d postgres

# Ver logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f postgres

# Detener servicios
docker-compose down

# Detener y limpiar volúmenes
docker-compose down -v

# Rebuildar imagen
docker-compose up --build
```

### Archivo docker-compose.yml

El proyecto incluye configuración para PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:17-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: busmanage
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (re-ejecutan al cambiar archivos)
npm run test:watch

# Con cobertura de código
npm run test:cov
```

### Tests E2E (End-to-End)

```bash
# Ejecutar tests E2E
npm run test:e2e

# El proyecto incluye: test/app.e2e-spec.ts
```

---

## 🆘 Troubleshooting

### ❌ Error: "Cannot connect to database"

**Causa:** PostgreSQL no está corriendo o la conexión es incorrecta.

```bash
# Verificar que PostgreSQL esté activo
docker ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Recrear el contenedor
docker-compose down
docker-compose up -d postgres

# Verificar DATABASE_URL en .env
# Debe ser: postgresql://user:password@localhost:5432/busmanage
```

### ❌ Error: "Prisma Client not found"

**Causa:** El cliente de Prisma no ha sido generado.

```bash
# Regenerar cliente
npx prisma generate

# O hacer migrate
npx prisma migrate dev
```

### ❌ Error: "Port 3000 already in use"

**Causa:** Otro proceso usa el puerto 3000.

```bash
# Opción 1: Cambiar puerto en .env
# PORT=3001

# Opción 2: Matar el proceso
lsof -ti:3000 | xargs kill -9

# En Windows PowerShell
# Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### ❌ Error: "Relations not found in schema"

**Causa:** Las migraciones no coinciden con el schema.

```bash
# Reset completo (⚠️ borra datos)
npx prisma migrate reset

# O
npm run db:reset
```

### ❌ Error: ESLint o Prettier

```bash
# Verificar y arreglar linting
npm run lint

# Formatear código
npm run format
```

---

## 👥 Modelo de Datos Actual

### Usuario (User)

```prisma
model User {
  id                    String @id @default(dbgenerated("gen_random_uuid()"))
  email                 String @unique
  passwordHash          String
  role                  UserRole @default(user)
  fullName              String
  isActive              Boolean @default(true)

  // Session Management
  lastLogin             DateTime?
  refreshTokenHash      String?
  refreshTokenCreatedAt DateTime?
  refreshTokenExpiresAt DateTime?

  // Password Recovery
  resetToken            String?
  resetTokenExpiry      DateTime?

  // Audit
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum UserRole {
  admin    // Acceso total a todos los recursos
  user     // Usuario regular con acceso limitado
  viewer   // Solo lectura
}
```

#### Campos de Auditoría

| Campo                   | Propósito                     | Uso                    |
| ----------------------- | ----------------------------- | ---------------------- |
| `refreshTokenCreatedAt` | Fecha de emisión del token    | Auditoría de sesión    |
| `refreshTokenExpiresAt` | Fecha de expiración del token | Auditoría de sesión    |
| `lastLogin`             | Último login exitoso          | Auditoría de seguridad |
| `createdAt`             | Fecha de creación de usuario  | Auditoría general      |
| `updatedAt`             | Última modificación de perfil | Auditoría general      |

---

## 📋 Proyectos Futuros

Próximos módulos a implementar:

- [ ] 🚌 Gestión de Autobuses
- [ ] 🛣️ Gestión de Rutas
- [ ] 🎫 Sistema de Boletos/Reservas
- [ ] 👨‍✈️ Gestión de Conductores
- [ ] 🚏 Paradas/Estaciones
- [ ] 📅 Horarios y Viajes
- [ ] 💳 Pagos y Facturación
- [ ] 📊 Reportes y Analytics
- [ ] 🔔 Notificaciones en tiempo real

---

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de código

- Usar TypeScript en lugar de JavaScript
- Seguir la estructura de carpetas existente
- Ejecutar `npm run lint` y `npm run format` antes de commit
- Incluir tests para nuevas funcionalidades
- Mantener la documentación actualizada

---

## 📞 Contacto y Soporte

- **Autor:** bert0h-dev
- **Email:** support@busmanage.com
- **Issues:** [GitHub Issues](https://github.com/bert0h-dev/BusManage-API/issues)

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT**.

---

## 📚 Recursos y Referencias

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/) - Framework principal
- [Prisma Documentation](https://www.prisma.io/docs/) - ORM y migraciones
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Lenguaje
- [Passport.js Documentation](http://www.passportjs.org/) - Autenticación
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Base de datos
- [Docker Documentation](https://docs.docker.com/) - Containerización

### Tutoriales Útiles

- [NestJS Official Course](https://docs.nestjs.com/recipes/crud-generator)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [JWT Authentication Best Practices](https://tools.ietf.org/html/rfc7519)

### Herramientas Útiles

- [Swagger Editor](https://editor.swagger.io/) - Editar OpenAPI specs
- [Postman](https://www.postman.com/) - Testing de APIs
- [DBeaver](https://dbeaver.io/) - Gestor de base de datos
- [Prisma Studio](https://www.prisma.io/studio) - GUI para Prisma

---

**Última actualización:** enero 2026 (v1.0.0)

### ✅ Versión actual incluye:

- ✅ Autenticación JWT con Refresh Tokens
- ✅ Rate Limiting en endpoints críticos
- ✅ Auditoría de sesiones completa
- ✅ Logout con revocación de tokens
- ✅ Recuperación de contraseña
- ✅ Cambio de contraseña
- ✅ Validación de datos robusta
- ✅ Documentación API interactiva
