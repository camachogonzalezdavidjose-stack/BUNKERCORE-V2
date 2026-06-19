import React from 'react';
import { Shield, Key, Eye, UserCheck, AlertOctagon, HelpCircle } from 'lucide-react';
import { Role } from '../types';

interface RbacControlProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  currentUser: string;
  isEscalated: boolean;
  onRevokeEscalation: () => void;
}

export default function RbacControl({
  currentRole,
  onChangeRole,
  currentUser,
  isEscalated,
  onRevokeEscalation,
}: RbacControlProps) {
  // Roles definition with permissions
  const rolesConfig = [
    {
      role: 'admin' as Role,
      label: 'Administrador (Admin)',
      email: 'admin@bunkercore.io',
      desc: 'Acceso total sin restrcciones. Políticas de administración de tenant, Base de Datos Neon PostgreSQL, y despliegues productivos.',
      permits: {
        'read:inventory': true,
        'write:inventory': true,
        'write:mermas': true,
        'trigger:cicd': true,
        'sys:settings': true,
      },
      color: 'border-red-500 text-red-400 bg-red-950/20',
      badge: 'bg-red-500/10 text-red-400 border-red-800/50'
    },
    {
      role: 'manager' as Role,
      label: 'Gerente (Manager)',
      email: 'manager@bunkercore.io',
      desc: 'Operaciones completas de inventario y cotizaciones. Puede registrar mermas estándar, pero requiere escalar via FIDO2 para mermas críticas.',
      permits: {
        'read:inventory': true,
        'write:inventory': true,
        'write:mermas': 'Requiere FIDO2 para mermas > 10 pz',
        'trigger:cicd': false,
        'sys:settings': false,
      },
      color: 'border-amber-500 text-amber-400 bg-amber-950/20',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-800/50'
    },
    {
      role: 'employee' as Role,
      label: 'Operador (Employee)',
      email: 'employee@bunkercore.io',
      desc: 'Acceso básico de operador de piso. Puede cotizar y ver existencias. Bloqueo total de modificaciones y auditorías sensibles.',
      permits: {
        'read:inventory': true,
        'write:inventory': false,
        'write:mermas': false,
        'trigger:cicd': false,
        'sys:settings': false,
      },
      color: 'border-blue-500 text-blue-400 bg-blue-950/20',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-800/50'
    }
  ];

  return (
    <div className="bg-[#0d1117]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between" id="rbac-panel">
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-800/60">
          <div className="p-2 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide text-xs">
              Control RBAC y Políticas Zero-Trust
              <span className="text-[9px] bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 font-mono">Active Enforcer</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Simulación de separación de privilegios sobre el modelo universal.</p>
          </div>
        </div>

        {/* Identity state banner */}
        <div className="p-3 bg.5 bg-[#0a0c10]/40 border border-slate-800/80 rounded-xl flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-200">Suplente de Sesión</span>
              <span className="text-[10px] font-mono text-slate-400">{currentUser}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
              currentRole === 'admin' 
                ? 'bg-red-950/30 text-red-400 border-red-500/30' 
                : currentRole === 'manager' 
                  ? 'bg-amber-955 text-amber-400 border-amber-500/30' 
                  : 'bg-blue-950/30 text-blue-400 border-blue-500/30'
            }`}>
              {currentRole}
            </span>
            {isEscalated && (
              <button 
                onClick={onRevokeEscalation}
                className="text-[9px] bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/30 px-2 py-0.5 rounded-lg uppercase flex items-center gap-1 transition-colors cursor-pointer font-mono"
                title="Revocar elevación criptográfica temporal"
              >
                Revocar FIDO2
              </button>
            )}
          </div>
        </div>

        {/* Role Picker Buttons */}
        <div className="space-y-2.5 mb-4.5" id="role-selector-group">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Seleccionar Rol para Evaluar Permisos
          </label>
          <div className="grid grid-cols-3 gap-2">
            {rolesConfig.map((item) => (
              <button
                key={item.role}
                onClick={() => onChangeRole(item.role)}
                className={`py-2 text-xs text-center border rounded-xl transition-all flex flex-col justify-center items-center gap-1 cursor-pointer ${
                  currentRole === item.role 
                    ? `${item.color} ring-2 ring-blue-500/20 border-opacity-100 font-semibold`
                    : 'border-slate-800/80 bg-[#090b0f] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px]">{item.role === 'admin' ? 'Admin' : item.role === 'manager' ? 'Manager' : 'Employee'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role description description */}
        <div className="p-3.5 bg-[#0a0c10]/20 rounded-xl border border-slate-800/50 text-[11px] text-slate-300 leading-relaxed font-sans">
          <p>
            {rolesConfig.find(r => r.role === currentRole)?.desc}
          </p>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="mt-5 border-t border-slate-800/60 pt-4" id="permissions-matrix">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">
          Matriz de Acciones Evaluada por Gateway ({currentRole})
        </span>
        <div className="space-y-1.5 font-mono text-[10px]">
          {Object.entries(rolesConfig.find(r => r.role === currentRole)?.permits || {}).map(([rule, val]) => {
            let statusBadge = (
              <span className="text-red-400 font-semibold bg-red-950/20 px-1.5 py-0.5 rounded border border-red-500/20">REJECTED</span>
            );
            
            if (val === true) {
              statusBadge = <span className="text-emerald-400 font-semibold bg-emerald-950/25 px-1.5 py-0.5 rounded border border-emerald-500/20">ALLOWED</span>;
            } else if (typeof val === 'string') {
              statusBadge = (
                <span className={`font-semibold px-1.5 py-0.5 rounded border ${isEscalated ? 'text-emerald-400 bg-emerald-950/25 border-emerald-500/20 line-through' : 'text-amber-400 bg-amber-955 border-amber-500/20'}`}>
                  {isEscalated ? 'ALLOWED (FIDO2)' : 'REQUIRES FIDO2'}
                </span>
              );
            }

            return (
              <div key={rule} className="flex items-center justify-between p-2 bg-[#0a0c10]/30 rounded-xl border border-slate-800/40 hover:bg-[#0a0c10]/60 transition-colors">
                <span className="text-slate-300 text-[11px]">{rule}</span>
                <span className="text-[9px]">{statusBadge}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
