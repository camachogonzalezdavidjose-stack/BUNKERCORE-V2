import { Tenant, InventoryItem, AuditLog, MermaLog } from '../types';

export const TENANTS: Tenant[] = [
  {
    id: 't-01',
    name: 'Silos de Carga Alfa',
    code: 'ALFA-77',
    dbSchema: 'neon://db_alfa_owner:px_silo77_key@neon.tech/bunkercore_alfa',
    apiEndpoint: 'https://alfa.bunkercore.io/v1',
    color: '#3b82f6', // blue
  },
  {
    id: 't-02',
    name: 'Bunker Energético Beta',
    code: 'BETA-V12',
    dbSchema: 'neon://db_beta_owner:sh_v12_key@neon.tech/bunkercore_beta',
    apiEndpoint: 'https://beta.bunkercore.io/v1',
    color: '#10b981', // emerald
  },
  {
    id: 't-03',
    name: 'Logística Crítica Omega',
    code: 'OMEGA-Z9',
    dbSchema: 'neon://db_omega_owner:kr_z9_key@neon.tech/bunkercore_omega',
    apiEndpoint: 'https://omega.bunkercore.io/v1',
    color: '#8b5cf6', // purple
  },
];

export const INITIAL_INVENTORIES: Record<string, InventoryItem[]> = {
  't-01': [
    { id: 'item-101', sku: 'ALF-VNT-09', name: 'Extractor Industrial VNT-09', category: 'Sistemas Aire', stock: 14, price: 540.00, unit: 'pz', minStock: 5 },
    { id: 'item-102', sku: 'ALF-HLD-44', name: 'Servo Válvula Hidráulica HLD-44', category: 'Fuerza', stock: 32, price: 290.00, unit: 'pz', minStock: 10 },
    { id: 'item-103', sku: 'ALF-FLT-12', name: 'Filtro Carbón Activo C-12', category: 'Sistemas Aire', stock: 4, price: 85.00, unit: 'pz', minStock: 8 }, // understocked
    { id: 'item-104', sku: 'ALF-CON-01', name: 'Cable Multipolo Blindado', category: 'Cableado', stock: 150, price: 4.50, unit: 'm', minStock: 50 },
    { id: 'item-105', sku: 'ALF-SEN-UX', name: 'Sensor de Presión Ultra-G', category: 'Sistemas Aire', stock: 25, price: 180.00, unit: 'pz', minStock: 6 },
  ],
  't-02': [
    { id: 'item-201', sku: 'BET-BAT-MW', name: 'Célula de Batería Termo-Sólida', category: 'Energía', stock: 8, price: 1250.00, unit: 'pz', minStock: 15 }, // understocked
    { id: 'item-202', sku: 'BET-GEN-50', name: 'Inversor de Carga Síncrona 50kW', category: 'Fusibles/Inversores', stock: 5, price: 3400.00, unit: 'pz', minStock: 2 },
    { id: 'item-203', sku: 'BET-FUS-120', name: 'Fusible Alta Ruptura 120A', category: 'Fusibles/Inversores', stock: 45, price: 18.50, unit: 'pz', minStock: 20 },
    { id: 'item-204', sku: 'BET-GLY-FL', name: 'Tubo de Glicol Refrigerante', category: 'Fluido', stock: 320, price: 12.00, unit: 'L', minStock: 100 },
    { id: 'item-205', sku: 'BET-RLY-XM', name: 'Relevador de Sobrecarga XM3', category: 'Energía', stock: 19, price: 75.00, unit: 'pz', minStock: 5 },
  ],
  't-03': [
    { id: 'item-301', sku: 'OMG-CNT-20', name: 'Contenedor Isotérmico Clase-20', category: 'Transporte', stock: 12, price: 2100.00, unit: 'pz', minStock: 4 },
    { id: 'item-302', sku: 'OMG-TAG-RFID', name: 'Etiquetas RFID Criptográficas', category: 'Seguridad/Métricas', stock: 1200, price: 1.20, unit: 'millar', minStock: 200 },
    { id: 'item-303', sku: 'OMG-GPS-RT', name: 'Rastreador GPS Militar Antena L1', category: 'Seguridad/Métricas', stock: 10, price: 320.00, unit: 'pz', minStock: 12 }, // understocked
    { id: 'item-304', sku: 'OMG-SEAL-S', name: 'Sellador Polímero de Presión', category: 'Transporte', stock: 40, price: 45.00, unit: 'tubo', minStock: 15 },
  ],
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    action: 'SYSTEM_BOOT',
    details: 'Bunkercore host inicializado en arquitectura ARM64 (Termux compatible)',
    timestamp: '2026-06-08T14:30:00Z',
    tenantId: 'system',
    user: 'sysops@bunkercore',
    role: 'admin',
    severity: 'info',
  },
  {
    id: 'log-002',
    action: 'NEON_POOL_HEALTHY',
    details: 'Conexión exitosa a bases de datos particionadas Neon Postgres',
    timestamp: '2026-06-08T14:30:02Z',
    tenantId: 'system',
    user: 'sysops@bunkercore',
    role: 'admin',
    severity: 'info',
  },
  {
    id: 'log-003',
    action: 'WEBAUTHN_REGISTRATION_SUCCESS',
    details: 'Nuevo par de llaves criptográficas registrado para admin de Alfa Corp',
    timestamp: '2026-06-08T15:12:45Z',
    tenantId: 't-01',
    user: 'admin@alfa.io',
    role: 'admin',
    severity: 'info',
  },
  {
    id: 'log-004',
    action: 'INVENTORY_ADJUST',
    details: 'Ajuste manual de stock de Extractor Industrial VNT-09',
    timestamp: '2026-06-08T15:45:00Z',
    tenantId: 't-01',
    user: 'manager@alfa.io',
    role: 'manager',
    severity: 'warning',
  },
];
