import { Permission, PermissionAction, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // =============== USUARIO DEL SISTEMA ===============

  console.log('👤 Creando usuarios...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@correo.com' },
    update: {},
    create: {
      email: 'admin@correo.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      fullName: 'Administrador del Sistema',
      isActive: true,
    },
  });

  const cooridnatorUser = await prisma.user.upsert({
    where: { email: 'coordinador@correo.com' },
    update: {},
    create: {
      email: 'coordinador@correo.com',
      passwordHash: await bcrypt.hash('Coord123!', 10),
      role: 'coordinator',
      fullName: 'Coordinador del Sistema',
      isActive: true,
    },
  });

  console.log('✅ Usuarios creados exitosamente');

  // =============== PERSONAL ===============

  console.log('👨‍✈️ Creando personal...');

  const staffCoordinator = await prisma.staff.upsert({
    where: { employeeNumber: 'EMP-001' },
    update: {},
    create: {
      userId: cooridnatorUser.id,
      employeeNumber: 'EMP-001',
      fullName: 'Coordinador del Sistema',
      email: 'coordinador@correo.com',
      phone: '+52 661 242 3585',
      role: 'supervisor',
      hireDate: new Date('2020-01-05'),
      birthDate: new Date('1985-05-20'),
      emergencyContact: 'Juan Rodríguez',
      emergencyPhone: '+52 661 242 3585',
      status: 'active',
      isActive: true,
    },
  });

  console.log('✅ Personal creados exitosamente');

  // =============== MÓDULOS DEL SISTEMA ===============

  console.log('📊 Creando módulos principales...');

  // Módulo principal

  // 1. Dashboard
  const dashboard = await prisma.module.upsert({
    where: { name: 'dashboard' },
    update: {},
    create: {
      name: 'dashboard',
      displayName: 'Dashboard',
      description: 'Panel principal con métricas, KPIs y resumen general del sistema',
      menuType: 'principal',
      icon: 'layout-dashboard',
      order: 1,
      isActive: true,
    },
  });

  // Módulo operaciones

  // 2. Boletos
  const ticketSales = await prisma.module.upsert({
    where: { name: 'ticket-sales' },
    update: {},
    create: {
      name: 'ticket-sales',
      displayName: 'Boletos',
      description: 'Venta y gestión de boletos',
      menuType: 'operations',
      icon: 'tickets',
      order: 2,
      isActive: true,
    },
  });

  // 2.1 Taquilla
  const boxOffice = await prisma.module.upsert({
    where: { name: 'box-office' },
    update: {},
    create: {
      name: 'box-office',
      displayName: 'Taquilla',
      description: 'Punto de venta',
      menuType: 'operations',
      order: 21,
      parentId: ticketSales.id,
      isActive: true,
    },
  });

  // 2.2 Reservaciones
  const reservations = await prisma.module.upsert({
    where: { name: 'reservations' },
    update: {},
    create: {
      name: 'reservations',
      displayName: 'Reservaciones',
      description: 'Gestión de reservas de boletos',
      menuType: 'operations',
      order: 22,
      parentId: ticketSales.id,
      isActive: true,
    },
  });

  // 2.3 Cancelación y Cambios
  const cancellationsChanges = await prisma.module.upsert({
    where: { name: 'cancellations_changes' },
    update: {},
    create: {
      name: 'cancellations_changes',
      displayName: 'Cancelación y Cambios',
      description: 'Modificación y anulación de boletos',
      menuType: 'operations',
      order: 23,
      parentId: ticketSales.id,
      isActive: true,
    },
  });

  // 2.4 Busqueda de boletos
  const ticketSearch = await prisma.module.upsert({
    where: { name: 'ticket-search' },
    update: {},
    create: {
      name: 'ticket-search',
      displayName: 'Búsqueda de Boletos',
      description: 'Consulta y seguimiento de boletos',
      menuType: 'operations',
      order: 24,
      parentId: ticketSales.id,
      isActive: true,
    },
  });

  // 3. Viajes
  const tripManagement = await prisma.module.upsert({
    where: { name: 'trip_management' },
    update: {},
    create: {
      name: 'trip_management',
      displayName: 'Gestión de Viajes',
      description: 'Administración completa de viajes y recorridos',
      menuType: 'operations',
      icon: 'bus-front',
      order: 3,
      isActive: true,
    },
  });

  // 3.1 Viajes
  const trips = await prisma.module.upsert({
    where: { name: 'trips' },
    update: {},
    create: {
      name: 'trips',
      displayName: 'Viajes',
      description: 'Viajes programados y activos',
      menuType: 'operations',
      order: 31,
      parentId: tripManagement.id,
      isActive: true,
    },
  });

  // 3.2 Programación de Recorridos
  const tripScheduling = await prisma.module.upsert({
    where: { name: 'trip_scheduling' },
    update: {},
    create: {
      name: 'trip_scheduling',
      displayName: 'Recorridos',
      description: 'Planificación de itinerarios',
      menuType: 'operations',
      order: 32,
      parentId: tripManagement.id,
      isActive: true,
    },
  });

  // 3.3 Estado de Viaje
  const tripStatus = await prisma.module.upsert({
    where: { name: 'trip_status' },
    update: {},
    create: {
      name: 'trip_status',
      displayName: 'Estado de Viaje',
      description: 'Seguimiento de viajes',
      menuType: 'operations',
      order: 33,
      parentId: tripManagement.id,
      isActive: true,
    },
  });

  // 3.4 Recorridos
  const routesCatalog = await prisma.module.upsert({
    where: { name: 'routes_catalog' },
    update: {},
    create: {
      name: 'routes_catalog',
      displayName: 'Recorridos',
      description: 'Gestión de recorridos establecidos',
      menuType: 'operations',
      order: 34,
      parentId: tripManagement.id,
      isActive: true,
    },
  });

  // 4. Rutas y Horarios
  const routesSchedules = await prisma.module.upsert({
    where: { name: 'routes_schedules' },
    update: {},
    create: {
      name: 'routes_schedules',
      displayName: 'Rutas y Horarios',
      description: 'Definición de rutas, paradas y horarios',
      menuType: 'operations',
      icon: 'route',
      order: 4,
      isActive: true,
    },
  });

  // 4.1 Rutas
  const routes = await prisma.module.upsert({
    where: { name: 'routes' },
    update: {},
    create: {
      name: 'routes',
      displayName: 'Rutas',
      description: 'Definición de rutas operativas',
      menuType: 'operations',
      order: 41,
      parentId: routesSchedules.id,
      isActive: true,
    },
  });

  // 4.2 Paradas
  const stops = await prisma.module.upsert({
    where: { name: 'stops' },
    update: {},
    create: {
      name: 'stops',
      displayName: 'Paradas',
      description: 'Gestión de paradas y terminales intermedias',
      menuType: 'operations',
      order: 42,
      parentId: routesSchedules.id,
      isActive: true,
    },
  });

  // 4.3 Horarios
  const schedules = await prisma.module.upsert({
    where: { name: 'schedules' },
    update: {},
    create: {
      name: 'schedules',
      displayName: 'Horarios',
      description: 'Configuración de horarios por ruta',
      menuType: 'operations',
      order: 43,
      parentId: routesSchedules.id,
      isActive: true,
    },
  });

  // 5. Flota
  const fleet = await prisma.module.upsert({
    where: { name: 'fleet' },
    update: {},
    create: {
      name: 'fleet',
      displayName: 'Flota',
      description: 'Administración de vehículos y mantenimiento',
      menuType: 'operations',
      icon: 'bus',
      order: 5,
      isActive: true,
    },
  });

  // 5.1 Unidades Vehiculares
  const vehicleUnits = await prisma.module.upsert({
    where: { name: 'vehicle-units' },
    update: {},
    create: {
      name: 'vehicle-units',
      displayName: 'Vehiculos',
      description: 'Gestión de vehiculos',
      menuType: 'operations',
      order: 51,
      parentId: fleet.id,
      isActive: true,
    },
  });

  // 5.2 Servicios
  const services = await prisma.module.upsert({
    where: { name: 'vehicle-services' },
    update: {},
    create: {
      name: 'vehicle-services',
      displayName: 'Servicios',
      description: 'Gestión de servicios de vehiculos',
      menuType: 'operations',
      order: 52,
      parentId: fleet.id,
      isActive: true,
    },
  });

  // 6. Personal
  const staff = await prisma.module.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff',
      displayName: 'Personal',
      description: 'Gestión de personal',
      menuType: 'operations',
      icon: 'users',
      order: 6,
      isActive: true,
    },
  });

  // 6.1 Empleados
  const employees = await prisma.module.upsert({
    where: { name: 'employees' },
    update: {},
    create: {
      name: 'employees',
      displayName: 'Empleados',
      description: 'Registro y gestión de personal',
      menuType: 'operations',
      order: 61,
      parentId: staff.id,
      isActive: true,
    },
  });

  // 6.2 Horarios de Personal
  const staffSchedules = await prisma.module.upsert({
    where: { name: 'staff_schedules' },
    update: {},
    create: {
      name: 'staff_schedules',
      displayName: 'Horarios de Personal',
      description: 'Turnos y asignaciones de personal',
      menuType: 'operations',
      order: 62,
      parentId: staff.id,
      isActive: true,
    },
  });

  // 7. Clientes
  const customers = await prisma.module.upsert({
    where: { name: 'customers' },
    update: {},
    create: {
      name: 'customers',
      displayName: 'Clientes',
      description: 'Gestión de clientes',
      menuType: 'operations',
      icon: 'circle-user',
      order: 7,
      isActive: true,
    },
  });

  // Modulo de configuración

  // 8. Infraestructura
  const infrastructure = await prisma.module.upsert({
    where: { name: 'infrastructure' },
    update: {},
    create: {
      name: 'infrastructure',
      displayName: 'Infraestructura',
      description: 'Gestión de terminales, centrales y andenes',
      menuType: 'config',
      icon: 'warehouse',
      order: 8,
      isActive: true,
    },
  });

  // 8.1 Terminales
  const terminals = await prisma.module.upsert({
    where: { name: 'terminals' },
    update: {},
    create: {
      name: 'terminals',
      displayName: 'Terminales',
      description: 'Gestión de terminales principales',
      menuType: 'config',
      order: 81,
      parentId: infrastructure.id,
      isActive: true,
    },
  });

  // 8.2 Centrales
  const headquarters = await prisma.module.upsert({
    where: { name: 'headquarters' },
    update: {},
    create: {
      name: 'headquarters',
      displayName: 'Centrales',
      description: 'Oficinas y centros de operación',
      menuType: 'config',
      order: 82,
      parentId: infrastructure.id,
      isActive: true,
    },
  });

  // 8.3 Andenes
  const platforms = await prisma.module.upsert({
    where: { name: 'platforms' },
    update: {},
    create: {
      name: 'platforms',
      displayName: 'Andenes',
      description: 'Plataformas de abordaje',
      menuType: 'config',
      order: 83,
      parentId: infrastructure.id,
      isActive: true,
    },
  });

  // 9. Administración del Sistema
  const systemAdmin = await prisma.module.upsert({
    where: { name: 'system_admin' },
    update: {},
    create: {
      name: 'system_admin',
      displayName: 'Sistema',
      description: 'Configuración general y seguridad del sistema',
      menuType: 'config',
      icon: 'settings',
      order: 9,
      isActive: true,
    },
  });

  // 9.1 Usuarios
  const users = await prisma.module.upsert({
    where: { name: 'users' },
    update: {},
    create: {
      name: 'users',
      displayName: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      menuType: 'config',
      order: 91,
      parentId: systemAdmin.id,
      isActive: true,
    },
  });

  // 9.2 Roles y Permisos
  const rolesPermissions = await prisma.module.upsert({
    where: { name: 'roles_permissions' },
    update: {},
    create: {
      name: 'roles_permissions',
      displayName: 'Roles y Permisos',
      description: 'Configuración de accesos y permisos',
      menuType: 'config',
      order: 92,
      parentId: systemAdmin.id,
      isActive: true,
    },
  });

  // 9.3 Auditoria
  const audit = await prisma.module.upsert({
    where: { name: 'audit' },
    update: {},
    create: {
      name: 'audit',
      displayName: 'Auditoría',
      description: 'Registro de cambios críticos del sistema',
      menuType: 'config',
      order: 93,
      parentId: systemAdmin.id,
      isActive: true,
    },
  });

  // 9.4 Bitácora
  const logs = await prisma.module.upsert({
    where: { name: 'logs' },
    update: {},
    create: {
      name: 'logs',
      displayName: 'Bitácora',
      description: 'Log de actividades del sistema',
      menuType: 'config',
      order: 94,
      parentId: systemAdmin.id,
      isActive: true,
    },
  });

  // 10. Reportes
  const reports = await prisma.module.upsert({
    where: { name: 'reports' },
    update: {},
    create: {
      name: 'reports',
      displayName: 'Reportes',
      description: 'Generación de reportes y análisis',
      menuType: 'config',
      icon: 'chart-bar-big',
      order: 10,
      isActive: true,
    },
  });

  console.log('✅ Modulos creados exitosamente');

  // =============== PERMISOS ===============

  console.log('🔐 Creando permisos...');

  // Helper function para crear permisos
  async function createPermissions(
    moduleId: string,
    actions: PermissionAction[],
    descriptions: Record<PermissionAction, string>,
  ) {
    const permissions: Permission[] = [];
    for (const action of actions) {
      const permission: Permission = await prisma.permission.upsert({
        where: { moduleId_action: { moduleId, action } },
        update: {},
        create: {
          moduleId,
          action,
          description: descriptions[action],
          isActive: true,
        },
      });
      permissions.push(permission);
    }
    return permissions;
  }

  // Dashboard - Solo view
  const dashboardPermissions = await createPermissions(dashboard.id, [PermissionAction.view], {
    [PermissionAction.view]: 'Ver el dashboard principal',
    [PermissionAction.create]: '',
    [PermissionAction.update]: '',
    [PermissionAction.delete]: '',
    [PermissionAction.export]: '',
    [PermissionAction.print]: '',
    [PermissionAction.manage]: '',
  });

  // Taquilla
  const boxOfficePermissions = await createPermissions(
    boxOffice.id,
    [PermissionAction.view, PermissionAction.create, PermissionAction.print],
    {
      [PermissionAction.view]: 'Ver la taquilla',
      [PermissionAction.create]: 'Crear tickets',
      [PermissionAction.print]: 'Imprimir tickets',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Reservaciones
  const reservationsPermissions = await createPermissions(
    reservations.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver reservaciones',
      [PermissionAction.create]: 'Crear reservaciones',
      [PermissionAction.update]: 'Actualizar reservaciones',
      [PermissionAction.delete]: 'Cancelar reservaciones',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Cancelación y Cambios
  const cancellationsPermissions = await createPermissions(
    cancellationsChanges.id,
    [PermissionAction.view, PermissionAction.update, PermissionAction.delete],
    {
      [PermissionAction.view]: 'Ver solicitudes de cambio',
      [PermissionAction.update]: 'Procesar solicitudes de cambio',
      [PermissionAction.delete]: 'Cancelar boletos',
      [PermissionAction.create]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Busqueda de boletos
  const ticketSearchPermissions = await createPermissions(
    ticketSearch.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Buscar y consultar boletos',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.create]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Viajes
  const tripsPermissions = await createPermissions(
    trips.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver viajes',
      [PermissionAction.create]: 'Crear viajes',
      [PermissionAction.update]: 'Actualizar viajes',
      [PermissionAction.delete]: 'Cancelar viajes',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Programación de Recorridos
  const tripSchedulingPermissions = await createPermissions(
    tripScheduling.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver programación',
      [PermissionAction.create]: 'Programar recorridos',
      [PermissionAction.update]: 'Actualizar programación',
      [PermissionAction.delete]: 'Eliminar programación',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Estado de viaje
  const tripStatusPermissions = await createPermissions(
    tripStatus.id,
    [PermissionAction.view, PermissionAction.update],
    {
      [PermissionAction.view]: 'Ver estado de viajes',
      [PermissionAction.update]: 'Actualizar estado de viajes',
      [PermissionAction.create]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Recorridos
  const routesCatalogPermissions = await createPermissions(
    routesCatalog.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver recorridos',
      [PermissionAction.create]: 'Crear recorridos',
      [PermissionAction.update]: 'Actualizar recorridos',
      [PermissionAction.delete]: 'Eliminar recorridos',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Rutas
  const routesPermissions = await createPermissions(
    routes.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver rutas',
      [PermissionAction.create]: 'Crear rutas',
      [PermissionAction.update]: 'Actualizar rutas',
      [PermissionAction.delete]: 'Eliminar rutas',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Paradas
  const stopsPermissions = await createPermissions(
    stops.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver paradas',
      [PermissionAction.create]: 'Crear paradas',
      [PermissionAction.update]: 'Actualizar paradas',
      [PermissionAction.delete]: 'Eliminar paradas',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Horarios
  const schedulesPermissions = await createPermissions(
    schedules.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver horarios',
      [PermissionAction.create]: 'Crear horarios',
      [PermissionAction.update]: 'Actualizar horarios',
      [PermissionAction.delete]: 'Eliminar horarios',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Unidades Vehiculares
  const vehicleUnitsPermissions = await createPermissions(
    vehicleUnits.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver vehiculos de la flota',
      [PermissionAction.create]: 'Crear vehiculos de la flota',
      [PermissionAction.update]: 'Actualizar vehiculos de la flota',
      [PermissionAction.delete]: 'Eliminar vehiculos de la flota',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Servicios
  const servicesPermissions = await createPermissions(
    services.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
      PermissionAction.manage,
    ],
    {
      [PermissionAction.view]: 'Ver servicios',
      [PermissionAction.create]: 'Crear servicios',
      [PermissionAction.update]: 'Actualizar servicios',
      [PermissionAction.delete]: 'Eliminar servicios',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: 'Programar servicio',
    },
  );

  // Empleados
  const employeesPermissions = await createPermissions(
    employees.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver empleados',
      [PermissionAction.create]: 'Registrar empleados',
      [PermissionAction.update]: 'Modificar empleados',
      [PermissionAction.delete]: 'Eliminar empleados',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Horarios de Personal
  const staffSchedulesPermissions = await createPermissions(
    staffSchedules.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver horarios de personal',
      [PermissionAction.create]: 'Asignar horarios',
      [PermissionAction.update]: 'Actualizar horarios',
      [PermissionAction.delete]: 'Eliminar horarios',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Clientes
  const customersPermissions = await createPermissions(
    customers.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver información de clientes',
      [PermissionAction.create]: 'Registrar cliente',
      [PermissionAction.update]: 'Modificar cliente',
      [PermissionAction.delete]: 'Eliminar cliente',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Terminales
  const terminalsPermissions = await createPermissions(
    terminals.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver terminales',
      [PermissionAction.create]: 'Crear terminales',
      [PermissionAction.update]: 'Modificar terminales',
      [PermissionAction.delete]: 'Eliminar terminales',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Centrales
  const headquartersPermissions = await createPermissions(
    headquarters.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver centrales',
      [PermissionAction.create]: 'Crear centrales',
      [PermissionAction.update]: 'Modificar centrales',
      [PermissionAction.delete]: 'Eliminar centrales',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Andenes
  const platformsPermissions = await createPermissions(
    platforms.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],
    {
      [PermissionAction.view]: 'Ver andenes',
      [PermissionAction.create]: 'Crear andenes',
      [PermissionAction.update]: 'Modificar andenes',
      [PermissionAction.delete]: 'Eliminar andenes',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Usuarios
  const usersPermissions = await createPermissions(
    users.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
      PermissionAction.manage,
    ],
    {
      [PermissionAction.view]: 'Ver usuarios',
      [PermissionAction.create]: 'Crear usuarios',
      [PermissionAction.update]: 'Modificar usuarios',
      [PermissionAction.delete]: 'Eliminar usuarios',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: 'Gestionar permisos',
    },
  );

  // Roles y Permisos
  const rolesPermissionsPermissions = await createPermissions(
    rolesPermissions.id,
    [PermissionAction.view, PermissionAction.update],
    {
      [PermissionAction.view]: 'Ver roles y permisos',
      [PermissionAction.create]: '',
      [PermissionAction.update]: 'Modificar permisos',
      [PermissionAction.delete]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Auditoria
  const auditPermissions = await createPermissions(
    audit.id,
    [PermissionAction.view, PermissionAction.export],
    {
      [PermissionAction.view]: 'Ver auditoría',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: 'Exportar auditoría',
      [PermissionAction.manage]: '',
    },
  );

  // Bitácora
  const logsPermissions = await createPermissions(
    logs.id,
    [PermissionAction.view, PermissionAction.export],
    {
      [PermissionAction.view]: 'Ver bitácora',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.print]: '',
      [PermissionAction.export]: 'Exportar bitácora',
      [PermissionAction.manage]: '',
    },
  );

  // Reportes
  const reportsPermissions = await createPermissions(
    reports.id,
    [PermissionAction.view, PermissionAction.export, PermissionAction.print],
    {
      [PermissionAction.view]: 'Ver reportes',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.print]: 'Imprimir reportes',
      [PermissionAction.export]: 'Exportar reportes',
      [PermissionAction.manage]: '',
    },
  );

  console.log('✅ Permisos creados exitosamente');

  // =============== ASIGNAR PERMISOS POR ROL ===============

  console.log('👥 Asignando permisos por rol...');

  console.log('🗑️  Limpiando roles existentes...');
  await prisma.rolePermission.deleteMany();

  // Obtener todos los permisos
  const allPermissions = await prisma.permission.findMany({
    where: { isActive: true },
  });

  // ADMIN: Acceso completo a todo
  console.log('   → Admin: acceso completo');
  for (const permission of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'admin',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // COORDINATOR: Acceso operativo (Sin administración del sistema)
  console.log('   → Coordinator: acceso operativo');
  const coordinatorModules = [
    dashboard.id,
    boxOffice.id,
    reservations.id,
    cancellationsChanges.id,
    ticketSearch.id,
    trips.id,
    tripScheduling.id,
    tripStatus.id,
    routesCatalog.id,
    routes.id,
    stops.id,
    schedules.id,
    vehicleUnits.id,
    services.id,
    employees.id,
    staffSchedules.id,
    customers.id,
    terminals.id,
    headquarters.id,
    platforms.id,
    reports.id,
  ];

  const coordinatorPermissions = allPermissions.filter((p) =>
    coordinatorModules.includes(p.moduleId),
  );

  for (const permission of coordinatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'coordinator',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // VENDOR: Venta de boletos y consultas
  console.log('   → Vendor: venta de boletos');
  const vendorAllowedPermissions = [
    ...dashboardPermissions,
    ...boxOfficePermissions,
    ...ticketSearchPermissions,
    ...cancellationsPermissions,
    ...routesPermissions.filter((p) => p.action === PermissionAction.view),
    ...schedulesPermissions.filter((p) => p.action === PermissionAction.view),
    ...customersPermissions.filter(
      (p) => p.action === PermissionAction.view || p.action === PermissionAction.create,
    ),
  ];

  for (const permission of vendorAllowedPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'vendor',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // DRIVER: Vista de viajes y estado
  console.log('   → Driver: vista de viajes');
  const driverAllowedPermissions = [
    ...dashboardPermissions,
    ...tripsPermissions.filter((p) => p.action === PermissionAction.view),
    ...tripStatusPermissions,
    ...routesPermissions.filter((p) => p.action === PermissionAction.view),
    ...schedulesPermissions.filter((p) => p.action === PermissionAction.view),
    ...staffSchedulesPermissions.filter((p) => p.action === PermissionAction.view),
  ];

  for (const permission of driverAllowedPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'driver',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // COLLECTOR: Similar a driver + consulta de boletos
  console.log('   → Collector: vista de viajes y boletos');
  const collectorAllowedPermissions = [
    ...dashboardPermissions,
    ...boxOfficePermissions.filter(
      (p) => p.action === PermissionAction.view || p.action === PermissionAction.create,
    ),
    ...ticketSearchPermissions,
    ...tripsPermissions.filter((p) => p.action === PermissionAction.view),
    ...tripStatusPermissions.filter((p) => p.action === PermissionAction.view),
    ...routesPermissions.filter((p) => p.action === PermissionAction.view),
    ...schedulesPermissions.filter((p) => p.action === PermissionAction.view),
  ];

  for (const permission of collectorAllowedPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'collector',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  // VIEWER: Solo lectura en módulos operativos
  console.log('   → Viewer: solo lectura');
  const viewerAllowedPermissions = allPermissions.filter(
    (p) =>
      p.action === PermissionAction.view &&
      ![users.id, rolesPermissions.id, audit.id, logs.id].includes(p.moduleId),
  );

  for (const permission of viewerAllowedPermissions) {
    await prisma.rolePermission.create({
      data: {
        userRole: 'viewer',
        moduleId: permission.moduleId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  console.log('✅ Permisos asignados por rol exitosamente');

  // =============== RESUMEN ===============

  const usersCount = await prisma.user.count();
  const staffCount = await prisma.staff.count();
  const modulesCount = await prisma.module.count();
  const permissionsCount = await prisma.permission.count();
  const rolePermissionsCount = await prisma.rolePermission.count();

  console.log('\n📊 RESUMEN DEL SEED:');
  console.log(`   ✓ Usuarios creados: ${usersCount}`);
  console.log(`   ✓ Empleados creados: ${staffCount}`);
  console.log(`   ✓ Módulos creados: ${modulesCount}`);
  console.log(`   ✓ Permisos creados: ${permissionsCount}`);
  console.log(`   ✓ Asignaciones de roles: ${rolePermissionsCount}`);
  console.log('\n🎉 Seed completado exitosamente!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
