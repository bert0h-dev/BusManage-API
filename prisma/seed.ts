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

  // =============== LIMPIEZA ===============

  // Se limpian los datos existentes de modulos, roles y permisos
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.module.deleteMany();

  // =============== MÓDULOS DEL SISTEMA ===============

  console.log('📊 Creando módulos principales...');

  // → Módulo principal

  // 1. Dashboard
  const moduleDashboard = await prisma.module.upsert({
    where: { name: 'm_dashboard' },
    update: {},
    create: {
      name: 'm_dashboard',
      displayName: 'Dashboard',
      description: 'Panel principal con métricas, KPIs y resumen general del sistema',
      menuType: 'principal',
      icon: 'layout-dashboard',
      path: '/',
      order: 1,
      isActive: true,
    },
  });

  // → Módulo de operaciones

  // 2. Boletos
  const moduleTickets = await prisma.module.upsert({
    where: { name: 'm_tickets' },
    update: {},
    create: {
      name: 'm_tickets',
      displayName: 'Boletos',
      description: 'Venta y gestión de boletos',
      menuType: 'operations',
      icon: 'tickets',
      path: '/tickets',
      order: 2,
      isActive: true,
    },
  });

  // 2.1 Taquilla
  const subModuleBoxOffice = await prisma.module.upsert({
    where: { name: 'sm_box-office' },
    update: {},
    create: {
      name: 'sm_box-office',
      displayName: 'Taquilla',
      description: 'Taquilla de boletos',
      menuType: 'operations',
      path: '/tickets/box-office',
      order: 1,
      parentId: moduleTickets.id,
      isActive: true,
    },
  });

  // 2.2 Reservaciones
  const subModuleReservations = await prisma.module.upsert({
    where: { name: 'sm_reservations' },
    update: {},
    create: {
      name: 'sm_reservations',
      displayName: 'Reservaciones',
      description: 'Gestión de reservas de boletos',
      menuType: 'operations',
      path: '/tickets/reservations',
      order: 2,
      parentId: moduleTickets.id,
      isActive: true,
    },
  });

  // 2.3 Cancelación y Cambios
  const subModuleCancellationsChanges = await prisma.module.upsert({
    where: { name: 'sm_cancellations-changes' },
    update: {},
    create: {
      name: 'sm_cancellations-changes',
      displayName: 'Cancelación y Cambios',
      description: 'Modificación y anulación de boletos',
      menuType: 'operations',
      path: '/tickets/cancellations-changes',
      order: 3,
      parentId: moduleTickets.id,
      isActive: true,
    },
  });

  // 2.4 Busqueda de boletos
  const subModuleTicketSearch = await prisma.module.upsert({
    where: { name: 'sm_ticket-search' },
    update: {},
    create: {
      name: 'sm_ticket-search',
      displayName: 'Búsqueda de Boletos',
      description: 'Consulta y seguimiento de boletos',
      menuType: 'operations',
      path: '/tickets/ticket-search',
      order: 4,
      parentId: moduleTickets.id,
      isActive: true,
    },
  });

  // 3. Viajes
  const moduleTripManagement = await prisma.module.upsert({
    where: { name: 'm_trip-management' },
    update: {},
    create: {
      name: 'm_trip-management',
      displayName: 'Gestión de Viajes',
      description: 'Administración completa de viajes y recorridos',
      menuType: 'operations',
      icon: 'bus-front',
      path: '/trips',
      order: 3,
      isActive: true,
    },
  });

  // 3.1 Viajes
  const subModuleTrips = await prisma.module.upsert({
    where: { name: 'sm_trips' },
    update: {},
    create: {
      name: 'sm_trips',
      displayName: 'Viajes',
      description: 'Viajes programados y activos',
      menuType: 'operations',
      path: '/trips/trips',
      order: 1,
      parentId: moduleTripManagement.id,
      isActive: true,
    },
  });

  // 3.2 Estado de Viaje
  const subModuleTripStatus = await prisma.module.upsert({
    where: { name: 'sm_trip-status' },
    update: {},
    create: {
      name: 'sm_trip-status',
      displayName: 'Estado de Viaje',
      description: 'Seguimiento de viajes',
      menuType: 'operations',
      path: '/trips/trip-status',
      order: 2,
      parentId: moduleTripManagement.id,
      isActive: true,
    },
  });

  // 4. Gestión de Rutas
  const moduleRoutesManagement = await prisma.module.upsert({
    where: { name: 'm_routes-management' },
    update: {},
    create: {
      name: 'm_routes-management',
      displayName: 'Gestión de Rutas',
      description: 'Definición de rutas, paradas y recorridos',
      menuType: 'operations',
      path: '/routes',
      icon: 'route',
      order: 4,
      isActive: true,
    },
  });

  // 4.1 Rutas
  const subModuleRoutes = await prisma.module.upsert({
    where: { name: 'sm_routes' },
    update: {},
    create: {
      name: 'sm_routes',
      displayName: 'Rutas',
      description: 'Definición de rutas operativas',
      menuType: 'operations',
      path: '/routes/routes',
      order: 1,
      parentId: moduleRoutesManagement.id,
      isActive: true,
    },
  });

  // 4.2 Paradas
  const subModuleStops = await prisma.module.upsert({
    where: { name: 'sm_stops' },
    update: {},
    create: {
      name: 'sm_stops',
      displayName: 'Paradas',
      description: 'Gestión de paradas y terminales intermedias',
      menuType: 'operations',
      path: '/routes/stops',
      order: 2,
      parentId: moduleRoutesManagement.id,
      isActive: true,
    },
  });

  // 4.3 Recorridos
  const subModulePaths = await prisma.module.upsert({
    where: { name: 'sm_paths' },
    update: {},
    create: {
      name: 'sm_paths',
      displayName: 'Recorridos',
      description: 'Gestión de recorridos',
      menuType: 'operations',
      path: '/routes/paths',
      order: 3,
      parentId: moduleRoutesManagement.id,
      isActive: true,
    },
  });

  // 4.4 Programación de Recorridos
  const subModulePathsScheduling = await prisma.module.upsert({
    where: { name: 'sm_paths-scheduling' },
    update: {},
    create: {
      name: 'sm_paths-scheduling',
      displayName: 'Planeación de Recorridos',
      description: 'Gestión de planificacion de recorridos',
      menuType: 'operations',
      path: '/routes/paths-scheduling',
      order: 4,
      parentId: moduleRoutesManagement.id,
      isActive: true,
    },
  });

  // 5. Flota
  const moduleFleet = await prisma.module.upsert({
    where: { name: 'm_fleet' },
    update: {},
    create: {
      name: 'm_fleet',
      displayName: 'Flota',
      description: 'Administración de vehículos y mantenimiento',
      menuType: 'operations',
      path: '/fleet',
      icon: 'bus',
      order: 5,
      isActive: true,
    },
  });

  // 5.1 Unidades Vehiculares
  const subModuleVehicleUnits = await prisma.module.upsert({
    where: { name: 'sm_vehicle-units' },
    update: {},
    create: {
      name: 'sm_vehicle-units',
      displayName: 'Vehiculos',
      description: 'Gestión de vehiculos',
      menuType: 'operations',
      path: '/fleet/vehicle-units',
      order: 1,
      parentId: moduleFleet.id,
      isActive: true,
    },
  });

  // 5.2 Servicios
  const subModuleServices = await prisma.module.upsert({
    where: { name: 'sm_vehicle-services' },
    update: {},
    create: {
      name: 'sm_vehicle-services',
      displayName: 'Servicios',
      description: 'Gestión de servicios de vehiculos',
      menuType: 'operations',
      path: '/fleet/services',
      order: 2,
      parentId: moduleFleet.id,
      isActive: true,
    },
  });

  // 6. Personal
  const moduleStaff = await prisma.module.upsert({
    where: { name: 'm_staff' },
    update: {},
    create: {
      name: 'm_staff',
      displayName: 'Personal',
      description: 'Gestión de personal',
      menuType: 'operations',
      path: '/staff',
      icon: 'users',
      order: 6,
      isActive: true,
    },
  });

  // 6.1 Empleados
  const subModuleEmployees = await prisma.module.upsert({
    where: { name: 'sm_employees' },
    update: {},
    create: {
      name: 'sm_employees',
      displayName: 'Empleados',
      description: 'Registro y gestión de personal',
      menuType: 'operations',
      path: '/staff/employees',
      order: 1,
      parentId: moduleStaff.id,
      isActive: true,
    },
  });

  // 6.2 Horarios de empleados
  const subModuleEmployeesSchedules = await prisma.module.upsert({
    where: { name: 'sm_employees-schedules' },
    update: {},
    create: {
      name: 'sm_employees-schedules',
      displayName: 'Horarios',
      description: 'Turnos y asignaciones de personal',
      menuType: 'operations',
      path: '/staff/employees-schedules',
      order: 2,
      parentId: moduleStaff.id,
      isActive: true,
    },
  });

  // 7. Clientes
  const moduleCustomers = await prisma.module.upsert({
    where: { name: 'm_customers' },
    update: {},
    create: {
      name: 'm_customers',
      displayName: 'Clientes',
      description: 'Gestión de clientes',
      menuType: 'operations',
      icon: 'circle-user',
      path: '/customers',
      order: 7,
      isActive: true,
    },
  });

  // → Módulo de configuración

  // 8. Infraestructura
  const moduleInfrastructure = await prisma.module.upsert({
    where: { name: 'm_infrastructure' },
    update: {},
    create: {
      name: 'm_infrastructure',
      displayName: 'Infraestructura',
      description: 'Gestión de terminales, centrales y andenes',
      menuType: 'config',
      icon: 'warehouse',
      path: '/infrastructure',
      order: 8,
      isActive: true,
    },
  });

  // 8.1 Terminales
  const subModuleTerminals = await prisma.module.upsert({
    where: { name: 'sm_terminals' },
    update: {},
    create: {
      name: 'sm_terminals',
      displayName: 'Terminales',
      description: 'Gestión de terminales principales',
      menuType: 'config',
      path: '/infrastructure/terminals',
      order: 1,
      parentId: moduleInfrastructure.id,
      isActive: true,
    },
  });

  // 8.2 Centrales
  const subModuleHeadquarters = await prisma.module.upsert({
    where: { name: 'sm_headquarters' },
    update: {},
    create: {
      name: 'sm_headquarters',
      displayName: 'Centrales',
      description: 'Oficinas y centros de operación',
      menuType: 'config',
      path: '/infrastructure/headquarters',
      order: 2,
      parentId: moduleInfrastructure.id,
      isActive: true,
    },
  });

  // 8.3 Andenes
  const subModulePlatforms = await prisma.module.upsert({
    where: { name: 'sm_platforms' },
    update: {},
    create: {
      name: 'sm_platforms',
      displayName: 'Andenes',
      description: 'Plataformas de abordaje',
      menuType: 'config',
      path: '/infrastructure/platforms',
      order: 3,
      parentId: moduleInfrastructure.id,
      isActive: true,
    },
  });

  // 9. Administración del Sistema
  const moduleSystemAdmin = await prisma.module.upsert({
    where: { name: 'm_system-admin' },
    update: {},
    create: {
      name: 'm_system-admin',
      displayName: 'Sistema',
      description: 'Configuración general y seguridad del sistema',
      menuType: 'config',
      icon: 'settings',
      path: '/system-admin',
      order: 9,
      isActive: true,
    },
  });

  // 9.1 Usuarios
  const subModuleUsers = await prisma.module.upsert({
    where: { name: 'sm_users' },
    update: {},
    create: {
      name: 'sm_users',
      displayName: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      menuType: 'config',
      path: '/system-admin/users',
      order: 1,
      parentId: moduleSystemAdmin.id,
      isActive: true,
    },
  });

  // 9.2 Roles y Permisos
  const subModuleRolesPermissions = await prisma.module.upsert({
    where: { name: 'sm_roles-permissions' },
    update: {},
    create: {
      name: 'sm_roles-permissions',
      displayName: 'Roles y Permisos',
      description: 'Configuración de accesos y permisos',
      menuType: 'config',
      path: '/system-admin/roles-permissions',
      order: 2,
      parentId: moduleSystemAdmin.id,
      isActive: true,
    },
  });

  // 9.3 Auditoria
  const subModuleAudit = await prisma.module.upsert({
    where: { name: 'sm_audit' },
    update: {},
    create: {
      name: 'sm_audit',
      displayName: 'Auditoría',
      description: 'Registro de cambios críticos del sistema',
      menuType: 'config',
      path: '/system-admin/audit',
      order: 3,
      parentId: moduleSystemAdmin.id,
      isActive: true,
    },
  });

  // 9.4 Bitácora
  const subModuleLogs = await prisma.module.upsert({
    where: { name: 'sm_logs' },
    update: {},
    create: {
      name: 'sm_logs',
      displayName: 'Bitácora',
      description: 'Log de actividades del sistema',
      menuType: 'config',
      path: '/system-admin/logs',
      order: 4,
      parentId: moduleSystemAdmin.id,
      isActive: true,
    },
  });

  // 10. Reportes
  const moduleReports = await prisma.module.upsert({
    where: { name: 'm_reports' },
    update: {},
    create: {
      name: 'm_reports',
      displayName: 'Reportes',
      description: 'Generación de reportes y análisis',
      menuType: 'config',
      icon: 'chart-bar-big',
      path: '/reports',
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
  const moduleDashboardPermissions = await createPermissions(
    moduleDashboard.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver el dashboard',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Boletos - Solo view
  const moduleTicketsPermissions = await createPermissions(
    moduleTickets.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver boletos',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Boletos - Taquilla
  const subModuleBoxOfficePermissions = await createPermissions(
    subModuleBoxOffice.id,
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

  // Boletos - Reservaciones
  const subModuleReservationsPermissions = await createPermissions(
    subModuleReservations.id,
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

  // Boletos - Cancelación y Cambios
  const subModuleCancellationsChangesPermissions = await createPermissions(
    subModuleCancellationsChanges.id,
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

  // Boletos - Busqueda de boletos
  const subModuleTicketSearchPermissions = await createPermissions(
    subModuleTicketSearch.id,
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

  // Gestion de viajes - Solo view
  const moduleTripManagementPermissions = await createPermissions(
    moduleTripManagement.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver gestión de viajes',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Gestion de viajes - Viajes
  const subModuleTripsPermissions = await createPermissions(
    subModuleTrips.id,
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

  // Gestion de viajes - Estado de viaje
  const subModuleTripStatusPermissions = await createPermissions(
    subModuleTripStatus.id,
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

  // Gestion de rutas - Solo view
  const moduleRoutesManagementPermissions = await createPermissions(
    moduleRoutesManagement.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver gestión de rutas',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Gestion de rutas - Rutas
  const subModuleRoutesPermissions = await createPermissions(
    subModuleRoutes.id,
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

  // Gestion de rutas - Paradas
  const subModuleStopsPermissions = await createPermissions(
    subModuleStops.id,
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

  // Gestion de rutas - Recorridos
  const subModulePathsPermissions = await createPermissions(
    subModulePaths.id,
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

  // Gestion de rutas - Programación de Recorridos
  const subModulePathsSchedulingPermissions = await createPermissions(
    subModulePathsScheduling.id,
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

  // Flota - Solo view
  const moduleFleetPermissions = await createPermissions(moduleFleet.id, [PermissionAction.view], {
    [PermissionAction.view]: 'Ver flota',
    [PermissionAction.create]: '',
    [PermissionAction.update]: '',
    [PermissionAction.delete]: '',
    [PermissionAction.export]: '',
    [PermissionAction.print]: '',
    [PermissionAction.manage]: '',
  });

  // Flota - Unidades Vehiculares
  const subModuleVehicleUnitsPermissions = await createPermissions(
    subModuleVehicleUnits.id,
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

  // Flota - Servicios
  const subModuleServicesPermissions = await createPermissions(
    subModuleServices.id,
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

  // Personal - Solo view
  const moduleStaffPermissions = await createPermissions(moduleStaff.id, [PermissionAction.view], {
    [PermissionAction.view]: 'Ver personal',
    [PermissionAction.create]: '',
    [PermissionAction.update]: '',
    [PermissionAction.delete]: '',
    [PermissionAction.export]: '',
    [PermissionAction.print]: '',
    [PermissionAction.manage]: '',
  });

  // Personal - Empleados
  const subModuleEmployeesPermissions = await createPermissions(
    subModuleEmployees.id,
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

  // Personal - Horarios de empleados
  const subModuleEmployeesSchedulesPermissions = await createPermissions(
    subModuleEmployeesSchedules.id,
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

  // Clientes - Solo view
  const moduleCustomersPermissions = await createPermissions(
    moduleCustomers.id,
    [
      PermissionAction.view,
      PermissionAction.create,
      PermissionAction.update,
      PermissionAction.delete,
    ],

    {
      [PermissionAction.view]: 'Ver clientes',
      [PermissionAction.create]: 'Registrar cliente',
      [PermissionAction.update]: 'Modificar cliente',
      [PermissionAction.delete]: 'Eliminar cliente',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Infraestructura - Solo view
  const moduleInfrastructurePermissions = await createPermissions(
    moduleInfrastructure.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver infraestructura',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Infraestructura - Terminales
  const subModuleTerminalsPermissions = await createPermissions(
    subModuleTerminals.id,
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

  // Infraestructura - Centrales
  const subModuleHeadquartersPermissions = await createPermissions(
    subModuleHeadquarters.id,
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

  // Infraestructura - Andenes
  const subModulePlatformsPermissions = await createPermissions(
    subModulePlatforms.id,
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

  // Administración - Solo view
  const moduleSystemAdminPermissions = await createPermissions(
    moduleSystemAdmin.id,
    [PermissionAction.view],
    {
      [PermissionAction.view]: 'Ver sistema',
      [PermissionAction.create]: '',
      [PermissionAction.update]: '',
      [PermissionAction.delete]: '',
      [PermissionAction.export]: '',
      [PermissionAction.print]: '',
      [PermissionAction.manage]: '',
    },
  );

  // Administración - Usuarios
  const subModuleUsersPermissions = await createPermissions(
    subModuleUsers.id,
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

  // Administración - Roles y Permisos
  const subModuleRolesPermissionsPermissions = await createPermissions(
    subModuleRolesPermissions.id,
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

  // Administración - Auditoria
  const subModuleAuditPermissions = await createPermissions(
    subModuleAudit.id,
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

  // Administración - Bitácora
  const subModuleLogsPermissions = await createPermissions(
    subModuleLogs.id,
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

  // Reportes - Solo view
  const moduleReportsPermissions = await createPermissions(
    moduleReports.id,
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

  // =============== ASIGNAR PERMISOS POR ROL ===============

  console.log('👥 Asignando permisos por rol...');

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
    moduleDashboard.id,
    moduleTickets.id,
    subModuleBoxOffice.id,
    subModuleReservations.id,
    subModuleCancellationsChanges.id,
    subModuleTicketSearch.id,
    moduleTripManagement.id,
    subModuleTrips.id,
    subModuleTripStatus.id,
    moduleRoutesManagement.id,
    subModuleRoutes.id,
    subModuleStops.id,
    subModulePaths.id,
    subModulePathsScheduling.id,
    moduleFleet.id,
    subModuleVehicleUnits.id,
    subModuleServices.id,
    moduleStaff.id,
    subModuleEmployees.id,
    subModuleEmployeesSchedules.id,
    moduleCustomers.id,
    moduleInfrastructure.id,
    subModuleTerminals.id,
    subModuleHeadquarters.id,
    subModulePlatforms.id,
    moduleReports.id,
  ];

  const coordinatorPermissions = allPermissions.filter((permission) =>
    coordinatorModules.includes(permission.moduleId),
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
    ...moduleDashboardPermissions,
    ...moduleTicketsPermissions,
    ...subModuleBoxOfficePermissions,
    ...subModuleReservationsPermissions,
    ...subModuleCancellationsChangesPermissions,
    ...moduleTripManagementPermissions,
    ...subModuleTripsPermissions.filter((p) => p.action === PermissionAction.view),
    ...subModuleTripStatusPermissions,
    ...moduleCustomersPermissions.filter(
      (p) => p.action === PermissionAction.view || PermissionAction.create,
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
    ...moduleDashboardPermissions,
    ...moduleTripManagementPermissions,
    ...subModuleTripsPermissions.filter((p) => p.action === PermissionAction.view),
    ...subModuleTripStatusPermissions,
    ...moduleRoutesManagementPermissions,
    ...subModuleRoutesPermissions.filter((p) => p.action === PermissionAction.view),
    ...subModulePathsPermissions.filter((p) => p.action === PermissionAction.view),
    ...moduleStaffPermissions,
    ...subModuleEmployeesSchedulesPermissions.filter((p) => p.action === PermissionAction.view),
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
    ...moduleDashboardPermissions,
    ...moduleTicketsPermissions,
    ...subModuleBoxOfficePermissions.filter(
      (p) => p.action === PermissionAction.view || p.action === PermissionAction.create,
    ),
    ...subModuleTicketSearchPermissions,
    ...moduleTripManagementPermissions,
    ...subModuleTripsPermissions.filter((p) => p.action === PermissionAction.view),
    ...subModuleTripStatusPermissions.filter((p) => p.action === PermissionAction.view),
    ...moduleRoutesManagementPermissions,
    ...subModuleRoutesPermissions.filter((p) => p.action === PermissionAction.view),
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
      ![
        moduleSystemAdmin.id,
        subModuleUsers.id,
        subModuleRolesPermissions.id,
        subModuleAudit.id,
        subModuleLogs.id,
      ].includes(p.moduleId),
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
