import { PrismaClient, UserRole, RegionName, PoleStatus, MaintenanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.maintenanceReport.deleteMany();
  await prisma.inventoryRequest.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.pole.deleteMany();
  await prisma.importHistory.deleteMany();
  await prisma.subcity.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();

  // Create Regions
  const north = await prisma.region.create({ data: { name: 'NORTH', code: 'NR' } });
  const south = await prisma.region.create({ data: { name: 'SOUTH', code: 'SR' } });
  const west = await prisma.region.create({ data: { name: 'WEST', code: 'WR' } });
  const east = await prisma.region.create({ data: { name: 'EAST', code: 'ER' } });

  // Create Subcities
  const subcities = await Promise.all([
    prisma.subcity.create({ data: { name: 'Gulele', regionId: north.id } }),
    prisma.subcity.create({ data: { name: 'Arada', regionId: north.id } }),
    prisma.subcity.create({ data: { name: 'Addis Ketema', regionId: north.id } }),
    prisma.subcity.create({ data: { name: 'Nifas Silk', regionId: south.id } }),
    prisma.subcity.create({ data: { name: 'Akaki Kality', regionId: south.id } }),
    prisma.subcity.create({ data: { name: 'Kolfe Keranyo', regionId: west.id } }),
    prisma.subcity.create({ data: { name: 'Lideta', regionId: west.id } }),
    prisma.subcity.create({ data: { name: 'Kirkos', regionId: west.id } }),
    prisma.subcity.create({ data: { name: 'Bole', regionId: east.id } }),
    prisma.subcity.create({ data: { name: 'Yeka', regionId: east.id } }),
    prisma.subcity.create({ data: { name: 'Lemikura', regionId: east.id } }),
  ]);

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // Create Users for each role
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'director.general@streetlight.gov', password: hashedPassword, firstName: 'Amanuel', lastName: 'Tadesse', role: UserRole.DIRECTOR_GENERAL } }),
    prisma.user.create({ data: { email: 'engineering.ddg@streetlight.gov', password: hashedPassword, firstName: 'Biruk', lastName: 'Lemma', role: UserRole.ENGINEERING_REGULATORY_DDG } }),
    prisma.user.create({ data: { email: 'procurement.director@streetlight.gov', password: hashedPassword, firstName: 'Chaltu', lastName: 'Bekele', role: UserRole.PROCUREMENT_DIRECTOR } }),
    prisma.user.create({ data: { email: 'design.director@streetlight.gov', password: hashedPassword, firstName: 'Dawit', lastName: 'Eshetu', role: UserRole.DESIGN_PROJECT_DIRECTOR } }),
    prisma.user.create({ data: { email: 'license.ddg@streetlight.gov', password: hashedPassword, firstName: 'Eden', lastName: 'Fikru', role: UserRole.LICENSE_PERMIT_DDG } }),
    prisma.user.create({ data: { email: 'ict.director@streetlight.gov', password: hashedPassword, firstName: 'Feven', lastName: 'Girma', role: UserRole.ICT_DIRECTOR } }),
    prisma.user.create({ data: { email: 'customer.director@streetlight.gov', password: hashedPassword, firstName: 'Gebre', lastName: 'Hailu', role: UserRole.LICENSE_CUSTOMER_SERVICE_DIRECTOR } }),
    prisma.user.create({ data: { email: 'om.ddg@streetlight.gov', password: hashedPassword, firstName: 'Hanna', lastName: 'Mekonnen', role: UserRole.OPERATION_MAINTENANCE_DDG } }),
    prisma.user.create({ data: { email: 'om.director@streetlight.gov', password: hashedPassword, firstName: 'Ibrahim', lastName: 'Nuru', role: UserRole.OPERATION_MAINTENANCE_DIRECTOR } }),
    prisma.user.create({ data: { email: 'mc.director@streetlight.gov', password: hashedPassword, firstName: 'Kebede', lastName: 'Tilahun', role: UserRole.MAINTENANCE_CENTER_DIRECTOR } }),
    prisma.user.create({ data: { email: 'north.director@streetlight.gov', password: hashedPassword, firstName: 'Lensa', lastName: 'Fikadu', role: UserRole.NORTH_REGION_DIRECTOR, region: RegionName.NORTH } }),
    prisma.user.create({ data: { email: 'south.director@streetlight.gov', password: hashedPassword, firstName: 'Mekdes', lastName: 'Yonas', role: UserRole.SOUTH_REGION_DIRECTOR, region: RegionName.SOUTH } }),
    prisma.user.create({ data: { email: 'west.director@streetlight.gov', password: hashedPassword, firstName: 'Netsanet', lastName: 'Berhane', role: UserRole.WEST_REGION_DIRECTOR, region: RegionName.WEST } }),
    prisma.user.create({ data: { email: 'east.director@streetlight.gov', password: hashedPassword, firstName: 'Tsion', lastName: 'Worku', role: UserRole.EAST_REGION_DIRECTOR, region: RegionName.EAST } }),
    prisma.user.create({ data: { email: 'agent@streetlight.gov', password: hashedPassword, firstName: 'Samson', lastName: 'Kebede', role: UserRole.CALL_CENTER_AGENT } }),
    prisma.user.create({ data: { email: 'engineer@streetlight.gov', password: hashedPassword, firstName: 'Tekle', lastName: 'Hailemariam', role: UserRole.MAINTENANCE_ENGINEER } }),
    prisma.user.create({ data: { email: 'supervisor@streetlight.gov', password: hashedPassword, firstName: 'Yonas', lastName: 'Assefa', role: UserRole.SUPERVISOR } }),
  ]);

  // Create sample poles
  const poleData = [
    { streetLightId: 'SL-001', latitude: 9.0243, longitude: 38.7468, regionId: east.id, subcityId: subcities[8].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'GOOD' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'New' },
    { streetLightId: 'SL-002', latitude: 9.0300, longitude: 38.7500, regionId: east.id, subcityId: subcities[8].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'FAIR' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'Good' },
    { streetLightId: 'SL-003', latitude: 9.0100, longitude: 38.7600, regionId: east.id, subcityId: subcities[9].id, status: 'DAMAGED' as PoleStatus, maintenanceStatus: 'POOR' as MaintenanceStatus, lampType: 'HPS', poleMaterial: 'Concrete', poleCondition: 'Damaged' },
    { streetLightId: 'SL-004', latitude: 9.0350, longitude: 38.7350, regionId: north.id, subcityId: subcities[0].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'GOOD' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'New' },
    { streetLightId: 'SL-005', latitude: 9.0400, longitude: 38.7200, regionId: north.id, subcityId: subcities[1].id, status: 'UNDER_MAINTENANCE' as PoleStatus, maintenanceStatus: 'CRITICAL' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'Fair' },
    { streetLightId: 'SL-006', latitude: 9.0150, longitude: 38.7100, regionId: west.id, subcityId: subcities[5].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'GOOD' as MaintenanceStatus, lampType: 'Solar', poleMaterial: 'Aluminum', poleCondition: 'New' },
    { streetLightId: 'SL-007', latitude: 9.0200, longitude: 38.7000, regionId: west.id, subcityId: subcities[6].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'FAIR' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'Good' },
    { streetLightId: 'SL-008', latitude: 9.0050, longitude: 38.7800, regionId: south.id, subcityId: subcities[3].id, status: 'INACTIVE' as PoleStatus, maintenanceStatus: 'POOR' as MaintenanceStatus, lampType: 'HPS', poleMaterial: 'Concrete', poleCondition: 'Old' },
    { streetLightId: 'SL-009', latitude: 8.9900, longitude: 38.7900, regionId: south.id, subcityId: subcities[4].id, status: 'ACTIVE' as PoleStatus, maintenanceStatus: 'GOOD' as MaintenanceStatus, lampType: 'LED', poleMaterial: 'Steel', poleCondition: 'New' },
    { streetLightId: 'SL-010', latitude: 9.0500, longitude: 38.7400, regionId: north.id, subcityId: subcities[2].id, status: 'DECOMMISSIONED' as PoleStatus, maintenanceStatus: 'CRITICAL' as MaintenanceStatus, lampType: 'HPS', poleMaterial: 'Concrete', poleCondition: 'Decommissioned' },
  ];

  for (const p of poleData) {
    await prisma.pole.create({ data: { ...p, createdById: users[4].id } });
  }

  // Create inventory items
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'LED Bulb 100W', quantity: 150, unit: 'pcs', minQuantity: 20, location: 'Warehouse A' },
      { name: 'LED Bulb 50W', quantity: 200, unit: 'pcs', minQuantity: 30, location: 'Warehouse A' },
      { name: 'Solar Panel 100W', quantity: 45, unit: 'pcs', minQuantity: 10, location: 'Warehouse B' },
      { name: 'Battery 12V 100Ah', quantity: 30, unit: 'pcs', minQuantity: 10, location: 'Warehouse B' },
      { name: 'Steel Pole 8m', quantity: 25, unit: 'pcs', minQuantity: 5, location: 'Yard A' },
      { name: 'Concrete Pole 8m', quantity: 40, unit: 'pcs', minQuantity: 10, location: 'Yard B' },
      { name: 'Cable 10mm²', quantity: 500, unit: 'm', minQuantity: 100, location: 'Warehouse A' },
      { name: 'Photo Cell Sensor', quantity: 80, unit: 'pcs', minQuantity: 15, location: 'Warehouse C' },
      { name: 'Fuse 10A', quantity: 300, unit: 'pcs', minQuantity: 50, location: 'Warehouse C' },
      { name: 'Bracket Arm', quantity: 60, unit: 'pcs', minQuantity: 10, location: 'Yard A' },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('👤 Default password for all users: Admin@123');
  console.log('📧 Sample login: director.general@streetlight.gov / Admin@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
