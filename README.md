# 🚀 Estructura del Proyecto Backend - BusManage

## 📁 Estructura de Carpetas

```
bus-management-api/
├── prisma/
│   ├── migrations/       # Migraciones de base de datos
│   └── schema.prisma     # Schema de Prisma
│
├── src/
│   ├── auth/             # Módulo de autenticación
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── guards/
│   │   │   └──jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── prisma/         # Módulo de Prisma
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── config/         # Configuración
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── app.controller.ts       # Controlador principal
│   ├── app.service.ts          # Servicio principal
│   ├── app.module.ts           # Módulo raíz
│   └── main.ts                 # Entry point
│
├── test/                       # Tests
│   ├── e2e/
│   │   └── app.e2e-spec.ts
│   └── unit/
│       └── (tests unitarios)
│
├── .env                       # Variables de entorno
├── .env.example               # Ejemplo de variables
├── .eslintrc.js               # Configuración ESLint
├── .prettierrc                # Configuración Prettier
├── .gitignore                 # Git ignore
├── docker-compose.yml         # Docker compose
├── Dockerfile                 # Dockerfile
├── nest-cli.json              # Configuración Nest CLI
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Documentación
```

---

## 🔧 Comandos de Setup

### Paso 1: Instalar Dependencias

```bash
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar ejemplo y editar
cp .env.example .env

# Editar .env con tus valores
nano .env
```

### Paso 3: Levantar Base de Datos

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres
```

### Paso 4: Configurar Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init
```

### Paso 5: Iniciar Servidor

```bash
# Modo desarrollo
npm run start:dev

# El servidor iniciará en http://localhost:3000
```

### Paso 6: Verificar

```bash
# Health check
curl http://localhost:3000/api/health
```

---

## 🎯 Tecnologías y Librerías

### Core

- NestJS 11.x
- Prisma 7.x
- PostgreSQL 17
- TypeScript 5.x

### Autenticación

- Passport.js
- JWT
- bcrypt

### Validación

- class-validator
- class-transformer

### Documentación

- Swagger/OpenAPI

### DevOps

- Docker
- Docker Compose

---

## 📊 Módulos y Responsabilidades

| Módulo   | Responsabilidad                   |
| -------- | --------------------------------- |
| **auth** | Login, registro, tokens, permisos |

---

## 🔐 Seguridad

- ✅ JWT para autenticación
- ✅ Login/Register endpoints
- ✅ Password hashing (bcrypt)
- ✅ Auth guards para proteger rutas
- ✅ Role-based access control

---

## 📈 Performance

- ✅ Database connection pooling
- ✅ Query optimization con Prisma
- ✅ Compresión de respuestas

---

## 🔧 Comandos Útiles

```bash
# Generar nuevo módulo
nest g module nombre
nest g controller nombre
nest g service nombre

# Generar recurso completo (CRUD)
nest g resource nombre

# Ver estructura del proyecto
tree -I 'node_modules|dist'

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Reset de base de datos
npm run db:reset

# Prisma Studio (GUI)
npm run prisma:studio

# Logs de Docker
docker-compose logs -f

# Rebuild Docker
docker-compose down
docker-compose up --build
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar que Postgre esté corriendo
docker ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Recrear contenedor
docker-compose down
docker-compose up -d postgres
```

### Error: Prisma Client not found

```bash
# Regenerar cliente
npx prisma generate
```

### Error: Port 3000 already in use

```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## License

[MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
