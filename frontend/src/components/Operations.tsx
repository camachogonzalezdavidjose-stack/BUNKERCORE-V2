import React, { useState, useMemo } from 'react';
import { 
  Package, Calculator, Sparkles, FileText, Plus, Search, 
  Trash2, AlertTriangle, Check, ShieldAlert, CircleSlash 
} from 'lucide-react';
import { Tenant, InventoryItem, MermaLog, Role, Quote } from '../types';

interface OperationsProps {
  activeTenant: Tenant;
  inventory: InventoryItem[];
  mermaLogs: MermaLog[];
  currentRole: Role;
  isEscalated: boolean;
  currentUser: string;
  onUpdateInventory: (tenantId: string, updated: InventoryItem[]) => void;
  onAddMermaLog: (tenantId: string, log: MermaLog) => void;
  onLogAction: (action: string, details: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function Operations({
  activeTenant,
  inventory,
  mermaLogs,
  currentRole,
  isEscalated,
  currentUser,
  onUpdateInventory,
  onAddMermaLog,
  onLogAction,
}: OperationsProps) {
  // Operational state
  const [activeTab, setActiveTab] = useState<'inventory' | 'quotation' | 'mermas'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Inventory Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newStock, setNewStock] = useState<number>(10);
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newUnit, setNewUnit] = useState('pz');
  const [newMinStock, setNewMinStock] = useState<number>(5);

  // 2. Quotation State
  const [quoteClient, setQuoteClient] = useState('');
  const [quoteLines, setQuoteLines] = useState<{ itemId: string; qty: number }[]>([]);
  const [selectedQuoteItemId, setSelectedQuoteItemId] = useState('');
  const [selectedQuoteQty, setSelectedQuoteQty] = useState<number>(1);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0); // percent
  const [quoteTaxRate, setQuoteTaxRate] = useState<number>(16); // IVA 16%
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);

  // 3. Merma State
  const [selectedMermaItemId, setSelectedMermaItemId] = useState('');
  const [mermaQty, setMermaQty] = useState<number>(1);
  const [mermaReason, setMermaReason] = useState('Rotura o Manejo Incorrecto');
  const [mermaError, setMermaError] = useState<string | null>(null);
  const [mermaSuccess, setMermaSuccess] = useState<string | null>(null);

  // Filtered inventory based on search query
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  // Is role allowed to perform inventory changes?
  const canModifyInventory = currentRole === 'admin' || currentRole === 'manager';

  // HANDLE REAL STOCK ADDITION
  const handleAddStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyInventory) {
      alert("RBAC: Su ról no tiene las credenciales write:inventory necesarias.");
      return;
    }

    if (!newSku || !newName) return;

    const newItem: InventoryItem = {
      id: 'item_' + Date.now(),
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      stock: Number(newStock),
      price: Number(newPrice),
      unit: newUnit,
      minStock: Number(newMinStock),
    };

    const updated = [...inventory, newItem];
    onUpdateInventory(activeTenant.id, updated);
    onLogAction(
      "INVENTORY_CREATE",
      `Nuevo SKU registrado: ${newItem.sku} (${newItem.name}) con ${newItem.stock} ${newItem.unit} en base particionada Neon.`,
      'info'
    );

    // Reset
    setNewSku('');
    setNewName('');
    setNewStock(10);
    setNewPrice(100);
    setShowAddForm(false);
  };

  // QUICK STOCK INCREASE (Only for authorized roles)
  const handleQuickAddStock = (itemId: string, amount: number) => {
    if (!canModifyInventory) {
      onLogAction("SECURITY_REJECT", `Intento de ajuste de inventario fallido por usuario ${currentUser} (Falta scope: write:inventory)`, 'critical');
      alert("Acceso Denegado por Enforcer RBAC: Su rol no permite mutaciones directas de stock.");
      return;
    }

    const updated = inventory.map(item => {
      if (item.id === itemId) return { ...item, stock: item.stock + amount };
      return item;
    });

    onUpdateInventory(activeTenant.id, updated);
    const affectedItem = inventory.find(i => i.id === itemId);
    onLogAction(
      "INVENTORY_ADJUST",
      `Ajuste rápido de inventario (+${amount}) para SKU ${affectedItem?.sku}. Operador: ${currentUser}`,
      'warning'
    );
  };

  // COTIZADOR LOGIC
  const handleAddQuoteLine = () => {
    if (!selectedQuoteItemId) return;
    const item = inventory.find(i => i.id === selectedQuoteItemId);
    if (!item) return;

    // Check if line already exists, then aggregate
    const existingIndex = quoteLines.findIndex(line => line.itemId === selectedQuoteItemId);
    if (existingIndex > -1) {
      const updatedLines = [...quoteLines];
      updatedLines[existingIndex].qty += selectedQuoteQty;
      setQuoteLines(updatedLines);
    } else {
      setQuoteLines([...quoteLines, { itemId: selectedQuoteItemId, qty: selectedQuoteQty }]);
    }

    setSelectedQuoteQty(1);
  };

  const handleRemoveQuoteLine = (itemId: string) => {
    setQuoteLines(quoteLines.filter(line => line.itemId !== itemId));
  };

  // Calculate financials
  const quoteTotals = useMemo(() => {
    let subtotal = 0;
    const linesWithDetails = quoteLines.map(line => {
      const item = inventory.find(i => i.id === line.itemId);
      const price = item ? item.price : 0;
      const lineCost = price * line.qty;
      subtotal += lineCost;
      return {
        ...line,
        name: item ? item.name : 'Unknown',
        price,
        total: lineCost
      };
    });

    const discountAmount = subtotal * (quoteDiscount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (quoteTaxRate / 100);
    const grandTotal = taxableAmount + taxAmount;

    return {
      lines: linesWithDetails,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    };
  }, [quoteLines, inventory, quoteDiscount, quoteTaxRate]);

  const handleSaveQuote = () => {
    if (quoteLines.length === 0) return;
    const newQuote: Quote = {
      id: 'COT-' + Math.floor(1000 + Math.random()*9000),
      clientName: quoteClient || 'Cliente General',
      items: quoteTotals.lines.map(line => ({
        itemId: line.itemId,
        name: line.name,
        qty: line.qty,
        price: line.price
      })),
      subtotal: quoteTotals.subtotal,
      discount: quoteDiscount,
      tax: quoteTaxRate,
      total: quoteTotals.grandTotal,
      timestamp: new Date().toISOString()
    };

    setSavedQuotes([newQuote, ...savedQuotes]);
    onLogAction(
      "QUOTE_GENERATE",
      `Cotización emitida para ${newQuote.clientName} con ID ${newQuote.id}. Total: $${newQuote.total.toFixed(2)} USD.`,
      'info'
    );

    // Reset quote constructor
    setQuoteLines([]);
    setQuoteClient('');
    setQuoteDiscount(0);
  };

  // MERMA LOGGING ACTIONS
  const handleRegisterMerma = (e: React.FormEvent) => {
    e.preventDefault();
    setMermaError(null);
    setMermaSuccess(null);

    // RBAC check: only admin and manager can register mermas
    if (currentRole === 'employee') {
      const details = `Intento de registro de merma denegado para operador ${currentUser} sobre item ID: ${selectedMermaItemId}`;
      onLogAction("SECURITY_REJECT", details, 'critical');
      setMermaError("Restricción de Seguridad: Los operadores basicos (Employee) no tienen permitido el registro de mermas ni devaluación de inventarios financieros.");
      return;
    }

    if (!selectedMermaItemId) {
      setMermaError("Debe seleccionar un componente del inventario.");
      return;
    }

    const itemObj = inventory.find(i => i.id === selectedMermaItemId);
    if (!itemObj) return;

    if (mermaQty <= 0) {
      setMermaError("La cantidad a registrar debe ser de al menos 1 unidad.");
      return;
    }

    if (mermaQty > itemObj.stock) {
      setMermaError(`No se puede registrar una merma de ${mermaQty} unidades. Stock físico disponible: ${itemObj.stock}.`);
      return;
    }

    // Zero-Trust context check:
    // If user is a MANAGER and qty is critical (> 10 units), they need validated WebAuthn verification
    if (currentRole === 'manager' && mermaQty > 10 && !isEscalated) {
      const details = `Operación crítica de merma bloqueada. Gerente ${currentUser} intentó descontar ${mermaQty} pz de ${itemObj.name} sin firma criptográfica.`;
      onLogAction("ZERO_TRUST_BLOCK", details, 'warning');
      setMermaError("Aprobación Biométrica Requerida: Operaciones de merma superiores a 10 unidades realizadas por Gerentes requieren elevación criptográfica temporal (Firma de desafío WebAuthn en panel izquierdo).");
      return;
    }

    // Proceeding to apply reduction
    const updatedStock = itemObj.stock - mermaQty;
    const updatedInventory = inventory.map(item => {
      if (item.id === selectedMermaItemId) {
        return { ...item, stock: updatedStock };
      }
      return item;
    });

    // Update global context inventory
    onUpdateInventory(activeTenant.id, updatedInventory);

    // Create log object
    const logEntry: MermaLog = {
      id: 'MERMA-' + Date.now(),
      itemId: selectedMermaItemId,
      itemName: itemObj.name,
      qty: mermaQty,
      reason: mermaReason,
      timestamp: new Date().toISOString(),
      loggedBy: currentUser
    };

    onAddMermaLog(activeTenant.id, logEntry);
    
    const severity: 'warning' | 'critical' = mermaQty > 15 ? 'critical' : 'warning';
    onLogAction(
      "ASSET_LOSS_REGISTERED",
      `Merma registrada para ${itemObj.sku} (${mermaQty} ${itemObj.unit}) por motivo de: ${mermaReason}. Stock resultante: ${updatedStock}.`,
      severity
    );

    setMermaSuccess(`Merma de ${mermaQty} unidades de "${itemObj.name}" restada de la base Neon satisfactoriamente.`);
    setMermaQty(1);
    setSelectedMermaItemId('');
  };

  return (
    <div className="bg-[#0d1117]/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col" id="operations-panel">
      {/* Upper Isolated Tenant Context Banner */}
      <div className="bg-[#0a0c10]/40 p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full ring-4 ring-slate-800" style={{ backgroundColor: activeTenant.color }} />
          <div>
            <span className="text-slate-400 font-semibold tracking-wide text-[10px] uppercase block">ORGANIZACIÓN ACTIVA (MULTI-TENANT):</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{activeTenant.name} <span className="font-mono text-xs text-slate-500 font-normal">[{activeTenant.code}]</span></h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 bg-[#090b0f] p-3 rounded-xl border border-slate-800/60 font-mono text-[10px]">
          <div>
            <span className="text-slate-500">Schema PostgreSQL:</span>
            <span className="text-slate-300 ml-1.5 truncate max-w-[150px] inline-block pt-0.5 align-middle">{activeTenant.dbSchema.substring(0, 35)}...</span>
          </div>
          <div>
            <span className="text-slate-500">Gateway API:</span>
            <span className="text-blue-400 ml-1.5">{activeTenant.apiEndpoint}</span>
          </div>
        </div>
      </div>

      {/* Tabs list inside panel */}
      <div className="flex bg-[#0d1117]/40 border-b border-slate-800/60 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'inventory' 
              ? 'bg-[#0a0c10] text-blue-400 border border-slate-800/80 shadow-md shadow-black/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a0c10]/20'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventarios Neon DB
        </button>
        <button
          onClick={() => setActiveTab('quotation')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'quotation' 
              ? 'bg-[#0a0c10] text-blue-400 border border-slate-800/80 shadow-md shadow-black/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a0c10]/20'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Cotizador Real-Time
        </button>
        <button
          onClick={() => setActiveTab('mermas')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'mermas' 
              ? 'bg-[#0a0c10] text-blue-400 border border-slate-800/80 shadow-md shadow-black/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a0c10]/20'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Descuentos y Mermas
        </button>
      </div>

      {/* PANEL CONTAINER CONTENT */}
      <div className="p-6 flex-1 min-h-[380px] text-slate-200">
        
        {/* TABC-1: INVENTARIO */}
        {activeTab === 'inventory' && (
          <div className="space-y-4" id="view-inventory-module">
            {/* Search and control bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-850">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar componente en inventario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-xs pl-8 pr-3 py-2 border border-slate-800 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!canModifyInventory && (
                  <span className="text-[10px] bg-amber-955 text-amber-500 border border-amber-950 px-2 py-1 rounded flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Solo lectura (Política RBAC activa)
                  </span>
                )}
                {canModifyInventory && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Componente
                  </button>
                )}
              </div>
            </div>

            {/* Price add stock form */}
            {showAddForm && (
              <form onSubmit={handleAddStockItem} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-slate-300">Registrar Nuevo SKU en Neon DB</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">CÓDIGO SKU</label>
                    <input 
                      type="text" 
                      value={newSku} 
                      onChange={(e) => setNewSku(e.target.value)} 
                      placeholder="Ej: ALF-TMP-99" 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">DESCRIPCIÓN NOMBRE</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      placeholder="Nombre del material" 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">CATEGORÍA</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)} 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    >
                      <option value="Sistemas Aire">Sistemas Aire</option>
                      <option value="Fuerza">Fuerza</option>
                      <option value="General">General</option>
                      <option value="Energía">Energía</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Seguridad/Métricas">Seguridad/Métricas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">STOCK FÍSICO INICIAL</label>
                    <input 
                      type="number" 
                      value={newStock} 
                      onChange={(e) => setNewStock(Number(e.target.value))} 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">PRECIO UNITARIO ($ USD)</label>
                    <input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(Number(e.target.value))} 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">UNIDAD DE MEDIDA</label>
                    <input 
                      type="text" 
                      value={newUnit} 
                      onChange={(e) => setNewUnit(e.target.value)} 
                      placeholder="pz / L / m" 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">STOCK CRÍTICO MÍNIMO</label>
                    <input 
                      type="number" 
                      value={newMinStock} 
                      onChange={(e) => setNewMinStock(Number(e.target.value))} 
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded py-2 text-xs font-semibold cursor-pointer"
                    >
                      Confirmar Alta
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Inventory table */}
            <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950/20">
              <table className="w-full border-collapse text-left text-xs bg-slate-950/20">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 font-mono text-[10px] text-slate-400">
                    <th className="py-2.5 px-3">SKU / CÓDIGO</th>
                    <th className="py-2.5 px-3">NOMBRE COMPONENTE</th>
                    <th className="py-2.5 px-3">CATEGORÍA</th>
                    <th className="py-2.5 px-3 text-right">PRECIO UNIT.</th>
                    <th className="py-2.5 px-3 text-center">ALMACÉN</th>
                    <th className="py-2.5 px-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredInventory.map((item) => {
                    const isCriticallyLow = item.stock <= item.minStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40 text-slate-200">
                        <td className="py-3 px-3 font-mono text-[11px] text-blue-400 font-medium">{item.sku}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-[10px] text-slate-500 font-sans">Minimo requerido: <span className="font-mono text-slate-400">{item.minStock} {item.unit}</span></div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">${item.price.toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-1.5 rounded font-mono text-xs font-semibold inline-block ${
                            isCriticallyLow 
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse' 
                              : 'bg-slate-950 text-slate-300'
                          }`}>
                            {item.stock} {item.unit}
                            {isCriticallyLow && (
                              <span className="text-[9px] block text-amber-600 uppercase font-medium mt-0.5 tracking-wider">RE-STOCK</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickAddStock(item.id, 5)}
                              className="text-[10px] border border-slate-800 hover:border-blue-500 hover:bg-blue-950/20 text-slate-400 hover:text-blue-400 rounded px-1.5 py-1 font-mono cursor-pointer transition-all shrink-0"
                              title="Aprovisionamiento rápido +5 pz"
                            >
                              +5 {item.unit}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-1 justify-center">
                          <CircleSlash className="w-6 h-6 stroke-slate-600" />
                          <span>No se encontraron componentes en la partición Neon de este tenant.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABC-2: COTIZADOR */}
        {activeTab === 'quotation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="quotation-module">
            {/* Left side: Quote constructor */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Constructor de Cotización Financiera</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">RAZÓN SOCIAL / CLIENTE</label>
                    <input
                      type="text"
                      placeholder="Ingrese el titular"
                      value={quoteClient}
                      onChange={(e) => setQuoteClient(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">DESCUENTO GENERAL %</label>
                    <input
                      type="number"
                      max={70}
                      min={0}
                      placeholder="Ej: 10"
                      value={quoteDiscount || ''}
                      onChange={(e) => setQuoteDiscount(Math.min(70, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-2 border-t border-slate-900">
                  <div className="md:col-span-7">
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">SELECCIONAR COMPONENTE DEL INVENTARIO</label>
                    <select
                      value={selectedQuoteItemId}
                      onChange={(e) => setSelectedQuoteItemId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="">-- Seleccionar item --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (${item.price.toFixed(2)} / {item.unit} | Stock: {item.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">CANTIDAD</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={1}
                        value={selectedQuoteQty}
                        onChange={(e) => setSelectedQuoteQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono text-center text-xs"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddQuoteLine}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-xs font-semibold cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotation lines lists */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/20">
                <div className="bg-slate-950 px-3 py-2 text-[10px] font-mono text-slate-400 border-b border-slate-850">
                  CONCEPTOS CARGADOS EN ESTA COTIZACIÓN
                </div>
                <div className="divide-y divide-slate-850 text-xs">
                  {quoteLines.map(line => {
                    const item = inventory.find(i => i.id === line.itemId);
                    const cost = item ? item.price * line.qty : 0;
                    return (
                      <div key={line.itemId} className="p-3 flex items-center justify-between hover:bg-slate-900/30">
                        <div>
                          <div className="font-semibold text-slate-200">{item?.name || 'Cargando...'}</div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {line.qty} {item?.unit} x ${item?.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-100 font-medium">${cost.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveQuoteLine(line.itemId)}
                            className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {quoteLines.length === 0 && (
                    <div className="py-8 text-center text-slate-500 italic">
                      No hay artículos agregados. Seleccione un artículo y la cantidad para calcular en tiempo real.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Invoice panel preview & logs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col justify-between h-full font-mono">
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-dashed border-slate-800 mb-4">
                    <div className="text-xs">
                      <span className="text-blue-400 font-bold tracking-widest block">BUNKERCORE FINANCE</span>
                      <span className="text-[9px] text-slate-500 block">MULTI-TENANT INVOICE GATEWAY</span>
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-mono">
                      <span>COT-{activeTenant.code}</span>
                      <span className="block text-[8px] text-slate-500">{new Date().toISOString().substring(0, 10)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cliente Recipiente:</span>
                      <span className="text-slate-200 truncate max-w-[150px]">{quoteClient || 'Cliente General'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-mono">Tenant Source:</span>
                      <span className="text-slate-200">{activeTenant.code}</span>
                    </div>

                    <div className="border-t border-slate-900 my-2 pt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>SUB-TOTAL:</span>
                        <span className="text-slate-200">${quoteTotals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-400">
                        <span>DSC. APLICADO ({quoteDiscount}%):</span>
                        <span>-${quoteTotals.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IMPUESTOS (IVA {quoteTaxRate}%):</span>
                        <span className="text-slate-200">${quoteTotals.taxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-dashed border-slate-800">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs font-bold text-slate-300">RE-CALC TOTAL:</span>
                    <span className="text-xl font-bold text-emerald-400">${quoteTotals.grandTotal.toFixed(2)} USD</span>
                  </div>

                  <button
                    onClick={handleSaveQuote}
                    disabled={quoteLines.length === 0}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-250 ${
                      quoteLines.length === 0 
                        ? 'bg-slate-900 text-slate-600 border border-slate-850'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/10'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Procesar y Guardar Cotización
                  </button>
                </div>
              </div>

              {/* Mini history list of quotes */}
              {savedQuotes.length > 0 && (
                <div className="space-y-1.5" id="recent-quotes-list">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Historial Reciente (Sesión)</span>
                  <div className="space-y-1 max-h-[105px] overflow-y-auto">
                    {savedQuotes.map(q => (
                      <div key={q.id} className="p-2 bg-slate-950 rounded flex items-center justify-between text-[11px] font-mono border border-slate-850">
                        <span className="text-blue-400">{q.id}</span>
                        <span className="text-slate-300 truncate max-w-[120px]">{q.clientName}</span>
                        <span className="text-emerald-400 font-semibold">${q.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TABC-3: REGISTRO DE MERMAS */}
        {activeTab === 'mermas' && (
          <div className="max-w-2xl mx-auto space-y-5" id="mermas-module">
            {/* Merma instructions and guidelines */}
            <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-lg text-xs leading-relaxed space-y-2">
              <span className="font-semibold text-slate-100 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Instructivo de Saneamiento y Resguardo Financiero
              </span>
              <p className="text-slate-400">
                El registro de mermas modifica directamente el valor patrimonial del inventario de la empresa alojado en PostgreSQL. El sistema de Bunkercore aplica reglas RBAC y validaciones Zero-Trust instantáneas en el extremo:
              </p>
              <ul className="list-disc pl-5 text-slate-400 space-y-1 text-[11px] font-mono">
                <li><span className="text-blue-400">Operadores básicos (Employee)</span> tienen bloqueada la acción totalmente.</li>
                <li><span className="text-amber-400">Gerentes (Manager)</span> pueden registrar pérdidas de hasta 10 unidades. Mermas de mayor cuantía se catalogan como críticas y exigen autorización criptográfica mediante la firma biométrica local.</li>
                <li><span className="text-red-400">Administradores (Admin)</span> gozan de libre asignación para auditorías integrales.</li>
              </ul>
            </div>

            {/* Form layout */}
            <div className="bg-slate-950 p-5 rounded-lg border border-slate-800">
              <form onSubmit={handleRegisterMerma} className="space-y-4">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest border-b border-slate-900 pb-2">
                  Panel de Descuento / Alertas y Mermas
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">SELECCIONAR ARTÍCULO DAÑADO/MERMAADO</label>
                    <select
                      value={selectedMermaItemId}
                      onChange={(e) => setSelectedMermaItemId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Seleccionar item --</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} (SKU: {item.sku} | Disponible: {item.stock} {item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono">CANTIDAD</label>
                      <input
                        type="number"
                        min={1}
                        value={mermaQty}
                        onChange={(e) => setMermaQty(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-2 text-slate-200 text-center font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-1 font-mono">UNIDAD</label>
                      <input
                        type="text"
                        disabled
                        value={inventory.find(i => i.id === selectedMermaItemId)?.unit || 'pz'}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-500 text-center text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono">MOTIVO DE DEVALUACIÓN / MERMA</label>
                    <select
                      value={mermaReason}
                      onChange={(e) => setMermaReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="Rotura o Manejo Incorrecto">Rotura o Manejo Incorrecto de Material</option>
                      <option value="Caducidad o Devaluación Directa">Caducidad de Componente Químico</option>
                      <option value="Defecto de Fábrica / No Operable">Defecto de Fábrica / No Operable</option>
                      <option value="Robo o Diferencia Física Faltante">Faltante Físico Autogestionado / Robo</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded py-2 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Registrar en Libros Generales
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {mermaError && (
                  <div className="bg-red-950/40 border border-red-800/60 p-3.5 rounded text-[11px] text-red-400 flex items-start gap-2 animate-shake">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-mono">{mermaError}</p>
                  </div>
                )}

                {/* Success Banner */}
                {mermaSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-850 p-3.5 rounded text-[11px] text-emerald-400 flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-mono">{mermaSuccess}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Local merma list */}
            {mermaLogs.length > 0 && (
              <div className="space-y-2" id="merma-logs-historical">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Historial Reciente de Mermas Registradas</span>
                <div className="space-y-1.5 max-h-[145px] overflow-y-auto">
                  {mermaLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono">
                      <div>
                        <div className="font-semibold text-slate-300">{log.itemName}</div>
                        <span className="text-[10px] text-slate-500">Motivo: {log.reason} | Descontado de base de datos Neon</span>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="text-red-400 font-bold">-{log.qty} pz</span>
                        <span className="text-[10px] text-slate-500">Por: {log.loggedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
