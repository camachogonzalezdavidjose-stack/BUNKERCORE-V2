export type Role = 'admin' | 'manager' | 'employee';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  dbSchema: string; // simulating neon connection schemas
  apiEndpoint: string;
  color: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  minStock: number;
}

export interface MermaLog {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  reason: string;
  timestamp: string;
  loggedBy: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  tenantId: string;
  user: string;
  role: Role;
  severity: 'info' | 'warning' | 'critical';
}

export interface QuoteItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Quote {
  id: string;
  clientName: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  timestamp: string;
}

export interface ArchitectureBlueprint {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  technicalSummary: string;
  uploadedBy: string;
  timestamp: string;
}
