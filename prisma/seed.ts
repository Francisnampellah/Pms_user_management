import { PrismaClient, RoleScope, ItemStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create Roles
  console.log('Creating roles...');
  
  const systemAdminRole = await prisma.role.upsert({
    where: { name: 'System Admin' },
    update: {},
    create: {
      name: 'System Admin',
      scope: RoleScope.system,
      description: 'Full system access with all permissions',
      permissions: [
        'system:admin',
        'org:create', 'org:read', 'org:update', 'org:delete', 'org:manage',
        'property:create', 'property:read', 'property:update', 'property:delete', 'property:manage',
        'item:create', 'item:read', 'item:update', 'item:delete', 'item:manage',
        'staff:create', 'staff:read', 'staff:update', 'staff:delete', 'staff:manage',
        'user:read', 'user:update', 'user:delete',
        'role:create', 'role:read', 'role:update', 'role:delete',
        'audit:read',
        'settings:read', 'settings:update',
      ],
      isActive: true,
    },
  });

  const orgAdminRole = await prisma.role.upsert({
    where: { name: 'Organization Admin' },
    update: {},
    create: {
      name: 'Organization Admin',
      scope: RoleScope.organization,
      description: 'Full access to organization resources',
      permissions: [
        'org:read', 'org:update', 'org:manage',
        'property:create', 'property:read', 'property:update', 'property:delete', 'property:manage',
        'item:create', 'item:read', 'item:update', 'item:delete', 'item:manage',
        'staff:create', 'staff:read', 'staff:update', 'staff:delete', 'staff:manage',
        'user:read', 'user:update',
        'role:read',
        'audit:read',
      ],
      isActive: true,
    },
  });

  const propertyManagerRole = await prisma.role.upsert({
    where: { name: 'Property Manager' },
    update: {},
    create: {
      name: 'Property Manager',
      scope: RoleScope.property,
      description: 'Full access to property resources',
      permissions: [
        'property:read', 'property:update',
        'item:create', 'item:read', 'item:update', 'item:delete', 'item:manage',
        'staff:read', 'staff:update',
        'user:read',
      ],
      isActive: true,
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      scope: RoleScope.property,
      description: 'Basic staff access to property resources',
      permissions: [
        'property:read',
        'item:read', 'item:update',
      ],
      isActive: true,
    },
  });

  await prisma.role.upsert({
    where: { name: 'Guest' },
    update: {},
    create: {
      name: 'Guest',
      scope: RoleScope.property,
      description: 'Read-only guest access',
      permissions: [
        'property:read',
        'item:read',
      ],
      isActive: true,
    },
  });

  console.log('✅ Roles created');

  // Create Users
  console.log('Creating users...');
  
  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pms.com' },
    update: {},
    create: {
      email: 'admin@pms.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const orgAdmin1 = await prisma.user.upsert({
    where: { email: 'orgadmin1@pms.com' },
    update: {},
    create: {
      email: 'orgadmin1@pms.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567891',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const orgAdmin2 = await prisma.user.upsert({
    where: { email: 'orgadmin2@pms.com' },
    update: {},
    create: {
      email: 'orgadmin2@pms.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567892',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const propManager1 = await prisma.user.upsert({
    where: { email: 'propmanager1@pms.com' },
    update: {},
    create: {
      email: 'propmanager1@pms.com',
      password: userPassword,
      firstName: 'Michael',
      lastName: 'Johnson',
      phone: '+1234567893',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const propManager2 = await prisma.user.upsert({
    where: { email: 'propmanager2@pms.com' },
    update: {},
    create: {
      email: 'propmanager2@pms.com',
      password: userPassword,
      firstName: 'Sarah',
      lastName: 'Williams',
      phone: '+1234567894',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const staffUser1 = await prisma.user.upsert({
    where: { email: 'staff1@pms.com' },
    update: {},
    create: {
      email: 'staff1@pms.com',
      password: userPassword,
      firstName: 'Robert',
      lastName: 'Brown',
      phone: '+1234567895',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const staffUser2 = await prisma.user.upsert({
    where: { email: 'staff2@pms.com' },
    update: {},
    create: {
      email: 'staff2@pms.com',
      password: userPassword,
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+1234567896',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Users created');

  // Create Organizations
  console.log('Creating organizations...');
  
  const org1 = await prisma.organization.upsert({
    where: { code: 'LUXE-HOTELS' },
    update: {},
    create: {
      name: 'Luxe Hotels International',
      code: 'LUXE-HOTELS',
      description: 'Premium luxury hotel chain with properties worldwide',
      timezone: 'America/New_York',
      isActive: true,
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { code: 'SUNSET-RESORTS' },
    update: {},
    create: {
      name: 'Sunset Resorts Group',
      code: 'SUNSET-RESORTS',
      description: 'Beach and mountain resort destinations',
      timezone: 'America/Los_Angeles',
      isActive: true,
    },
  });

  console.log('✅ Organizations created');

  // Create Properties
  console.log('Creating properties...');
  
  // Properties for Organization 1
  const prop1 = await prisma.property.upsert({
    where: { code: 'LUXE-NYC' },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'Luxe Hotel New York',
      code: 'LUXE-NYC',
      address: '123 Fifth Avenue',
      city: 'New York',
      state: 'New York',
      country: 'USA',
      postalCode: '10001',
      phone: '+1-212-555-0100',
      email: 'nyc@luxehotels.com',
      capacity: 200,
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isActive: true,
    },
  });

  const prop2 = await prisma.property.upsert({
    where: { code: 'LUXE-LA' },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'Luxe Hotel Los Angeles',
      code: 'LUXE-LA',
      address: '456 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      postalCode: '90028',
      phone: '+1-323-555-0200',
      email: 'la@luxehotels.com',
      capacity: 150,
      timezone: 'America/Los_Angeles',
      latitude: 34.0522,
      longitude: -118.2437,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isActive: true,
    },
  });

  const prop3 = await prisma.property.upsert({
    where: { code: 'LUXE-MIA' },
    update: {},
    create: {
      organizationId: org1.id,
      name: 'Luxe Hotel Miami',
      code: 'LUXE-MIA',
      address: '789 Ocean Drive',
      city: 'Miami',
      state: 'Florida',
      country: 'USA',
      postalCode: '33139',
      phone: '+1-305-555-0300',
      email: 'miami@luxehotels.com',
      capacity: 180,
      timezone: 'America/New_York',
      latitude: 25.7617,
      longitude: -80.1918,
      checkInTime: '16:00',
      checkOutTime: '11:00',
      isActive: true,
    },
  });

  // Properties for Organization 2
  const prop4 = await prisma.property.upsert({
    where: { code: 'SUNSET-MALIBU' },
    update: {},
    create: {
      organizationId: org2.id,
      name: 'Sunset Beach Resort Malibu',
      code: 'SUNSET-MALIBU',
      address: '1000 Pacific Coast Highway',
      city: 'Malibu',
      state: 'California',
      country: 'USA',
      postalCode: '90265',
      phone: '+1-310-555-0400',
      email: 'malibu@sunsetresorts.com',
      capacity: 100,
      timezone: 'America/Los_Angeles',
      latitude: 34.0259,
      longitude: -118.7798,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      isActive: true,
    },
  });

  const prop5 = await prisma.property.upsert({
    where: { code: 'SUNSET-ASPEN' },
    update: {},
    create: {
      organizationId: org2.id,
      name: 'Sunset Mountain Lodge Aspen',
      code: 'SUNSET-ASPEN',
      address: '500 Aspen Mountain Road',
      city: 'Aspen',
      state: 'Colorado',
      country: 'USA',
      postalCode: '81611',
      phone: '+1-970-555-0500',
      email: 'aspen@sunsetresorts.com',
      capacity: 80,
      timezone: 'America/Denver',
      latitude: 39.1911,
      longitude: -106.8175,
      checkInTime: '15:00',
      checkOutTime: '10:00',
      isActive: true,
    },
  });

  console.log('✅ Properties created');

  // Create Items (Rooms)
  console.log('Creating items...');
  
  const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Premium Suite', 'Presidential'];
  const statuses: ItemStatus[] = ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'];
  
  const createRooms = async (propertyId: number, prefix: string, count: number) => {
    const rooms = [];
    for (let floor = 1; floor <= Math.ceil(count / 5); floor++) {
      for (let room = 1; room <= Math.min(5, count - (floor - 1) * 5); room++) {
        const roomNum = floor * 100 + room;
        const typeIndex = Math.floor(Math.random() * roomTypes.length);
        const statusIndex = Math.floor(Math.random() * statuses.length);
        
        rooms.push({
          propertyId,
          name: `Room ${roomNum}`,
          code: `${prefix}-${roomNum}`,
          description: `${roomTypes[typeIndex]} room on floor ${floor}`,
          status: statuses[statusIndex],
          itemType: roomTypes[typeIndex].toLowerCase().replace(' ', '-'),
          floor,
          maxOccupancy: typeIndex === 0 ? 2 : typeIndex === 1 ? 2 : typeIndex === 2 ? 4 : typeIndex === 3 ? 4 : 6,
          price: 150 + typeIndex * 100,
          isActive: true,
        });
      }
    }
    return rooms;
  };

  // Create rooms for each property
  const rooms1 = await createRooms(prop1.id, 'NYC', 10);
  const rooms2 = await createRooms(prop2.id, 'LA', 8);
  const rooms3 = await createRooms(prop3.id, 'MIA', 10);
  const rooms4 = await createRooms(prop4.id, 'MAL', 6);
  const rooms5 = await createRooms(prop5.id, 'ASP', 5);

  const allRooms = [...rooms1, ...rooms2, ...rooms3, ...rooms4, ...rooms5];

  for (const room of allRooms) {
    await prisma.item.upsert({
      where: { code: room.code },
      update: {},
      create: room,
    });
  }

  console.log('✅ Items created');

  // Create Staff Assignments
  console.log('Creating staff assignments...');
  
  // Clear existing staff assignments
  await prisma.staff.deleteMany({});
  
  // System Admin assignment
  await prisma.staff.create({
    data: {
      userId: adminUser.id,
      organizationId: org1.id,
      roleId: systemAdminRole.id,
      isActive: true,
      startDate: new Date('2020-01-01'),
      employeeId: 'SYS-001',
      department: 'IT',
    },
  });

  // Org Admin 1 for Organization 1
  await prisma.staff.create({
    data: {
      userId: orgAdmin1.id,
      organizationId: org1.id,
      roleId: orgAdminRole.id,
      isActive: true,
      startDate: new Date('2021-06-15'),
      employeeId: 'ORG1-001',
      department: 'Management',
    },
  });

  // Org Admin 2 for Organization 2
  await prisma.staff.create({
    data: {
      userId: orgAdmin2.id,
      organizationId: org2.id,
      roleId: orgAdminRole.id,
      isActive: true,
      startDate: new Date('2022-01-10'),
      employeeId: 'ORG2-001',
      department: 'Management',
    },
  });

  // Property Manager 1 for NYC property
  await prisma.staff.create({
    data: {
      userId: propManager1.id,
      organizationId: org1.id,
      propertyId: prop1.id,
      roleId: propertyManagerRole.id,
      isActive: true,
      startDate: new Date('2022-03-01'),
      employeeId: 'NYC-PM-001',
      department: 'Operations',
    },
  });

  // Property Manager 2 for Malibu property
  await prisma.staff.create({
    data: {
      userId: propManager2.id,
      organizationId: org2.id,
      propertyId: prop4.id,
      roleId: propertyManagerRole.id,
      isActive: true,
      startDate: new Date('2022-05-15'),
      employeeId: 'MAL-PM-001',
      department: 'Operations',
    },
  });

  // Staff 1 for NYC property
  await prisma.staff.create({
    data: {
      userId: staffUser1.id,
      organizationId: org1.id,
      propertyId: prop1.id,
      roleId: staffRole.id,
      isActive: true,
      startDate: new Date('2023-01-15'),
      employeeId: 'NYC-ST-001',
      department: 'Front Desk',
    },
  });

  // Staff 2 for LA property
  await prisma.staff.create({
    data: {
      userId: staffUser2.id,
      organizationId: org1.id,
      propertyId: prop2.id,
      roleId: staffRole.id,
      isActive: true,
      startDate: new Date('2023-02-01'),
      employeeId: 'LA-ST-001',
      department: 'Housekeeping',
    },
  });

  console.log('✅ Staff assignments created');

  // Create System Settings
  console.log('Creating system settings...');
  
  const settings = [
    {
      key: 'app.name',
      value: 'Property Management System',
      description: 'Application name',
      isPublic: true,
    },
    {
      key: 'app.version',
      value: '1.0.0',
      description: 'Application version',
      isPublic: true,
    },
    {
      key: 'app.maintenance_mode',
      value: 'false',
      description: 'Enable maintenance mode',
      isPublic: false,
    },
    {
      key: 'booking.max_advance_days',
      value: '365',
      description: 'Maximum days in advance for booking',
      isPublic: false,
    },
    {
      key: 'booking.cancellation_hours',
      value: '24',
      description: 'Hours before check-in when cancellation is free',
      isPublic: true,
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ System settings created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('================');
  console.log('System Admin:      admin@pms.com / Admin123!');
  console.log('Org Admin (Luxe):  orgadmin1@pms.com / User123!');
  console.log('Org Admin (Sunset): orgadmin2@pms.com / User123!');
  console.log('Property Manager:  propmanager1@pms.com / User123!');
  console.log('Staff:             staff1@pms.com / User123!');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
