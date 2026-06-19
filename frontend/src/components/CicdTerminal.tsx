import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Cpu, Activity, Globe, GitBranch, ShieldCheck } from 'lucide-react';

interface CicdTerminalProps {
  onLogAction: (action: string, details: string, severity: 'info' | 'warning' | 'critical') => void;
}

export default function CicdTerminal({ onLogAction }: CicdTerminalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Host inicializado. Esperando solicitudes webhook...",
    "Arquitectura: ARM64-v8a | Entorno: Termux (Native Process Group)",
    "API Webhook escuchando en http://127.0.0.1:3000/api/webhooks/deploy"
  ]);
  const [commitHash, setCommitHash] = useState("fc1a2d8");
  const [status, setStatus] = useState<'idle' | 'running' | 'success'>('idle');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const triggerDeploy = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setStatus('running');
    setLogs([]);

    const steps = [
      ">> [BunkerOps] RECIPIENT: Webhook Github recibido el 2026-06-08 (Branch: main)",
      ">> [BunkerOps] Descargando payload del evento 'push' ...",
      ">> [BunkerOps] Comprobando firma criptográfica HMAC SHA-256 ... ✅ OK",
      ">> [BunkerOps] Verificando arquitectura de destino ...",
      ">> [BunkerOps] Host detectado: Linux aarch64 (Termux Native ARM64 CLI)",
      ">> [BunkerOps] Iniciando $ git pull origin main --force",
      "From github.com:camacho/bunkercore-platform",
      " * branch            main       -> FETCH_HEAD",
      "   fc1a2d8..c0d38b9  main       -> origin/main",
      "Actualizando código local. 3 archivos modificados, 42 inserciones.",
      ">> [BunkerOps] Iniciando compilación dual de producción (client + server)",
      ">> [BunkerOps] Ejecutando: npm run build",
      "[Vite] compilando archivos estáticos frontend react...",
      "[Vite] ✓ 42 modules transformed.",
      "[Vite] dist/assets/index-D7b39a.js   142.42 kB | gzip: 45.10 kB",
      "[Vite] dist/assets/index-A4f12d.css    12.80 kB | gzip: 3.90 kB",
      ">> [esbuild] compilando backend server.ts a CommonJS...",
      "[esbuild] bundle compilado con éxito -> dist/server.cjs (0.35s)",
      ">> [BunkerOps] Sincronizando esquemas de base de datos Neon PostgreSQL con Drizzle ORM...",
      "[Drizzle] Sincronizando migraciones en base de datos productiva (Tenant Multiplexor)...",
      "[Drizzle] Schema 'public' actualizado. Neon DB pools optimizados y saludables.",
      ">> [BunkerOps] Reiniciando servidor local Express (Node.js runtime ID: 31092)...",
      ">> [BunkerOps] Cargando variables de entorno desde .env ...",
      ">> [BunkerOps] Servidor operativo en el puerto 3000.",
      ">> [BunkerOps] DESPLIEGUE COMPLETO Y EXITOSO! Entorno ARM64 sincronizado y seguro."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
        setStatus('success');
        setCommitHash(Math.random().toString(16).substring(2, 9));
        onLogAction(
          "CI_CD_WEBHOOK_DEPLOY",
          `Despliegue automatizado completado con éxito vía Webhook. Host ARM64 Termux listo. Commit: c0d38${Math.floor(Math.random()*90)}`,
          'info'
        );
      }
    }, 120);
  };

  return (
    <div className="bg-[#0d1117]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between" id="cicd-panel">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                Despliegue CI/CD ARM64 (Termux)
                <span className="text-[9px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">Online</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Sistema de compilación dual optimizado para micro-arquitecturas ARM64.</p>
            </div>
          </div>
        </div>

        {/* Server metrics hardware info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="bg-[#0a0c10]/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">CPU ARCH</span>
            <span className="text-[11px] text-slate-200 font-bold font-mono mt-0.5 block">
              ARM64 (v8a)
            </span>
          </div>
          <div className="bg-[#0a0c10]/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">GIT COMMIT</span>
            <span className="text-[11px] text-blue-400 font-bold font-mono mt-0.5 block">
              c0d3b{commitHash}
            </span>
          </div>
          <div className="bg-[#0a0c10]/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">HOST CONTEXT</span>
            <span className="text-[11px] text-slate-200 font-bold font-mono mt-0.5 block">
              Termux Process
            </span>
          </div>
          <div className="bg-[#0a0c10]/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">WEBHOOK PORT</span>
            <span className="text-[11px] text-emerald-400 font-bold font-mono mt-0.5 block">
              3000/api
            </span>
          </div>
        </div>

        {/* Simulated CLI Terminal and logs container */}
        <div className="bg-[#050608]/90 border border-slate-850 rounded-xl p-4 space-y-2 mt-2">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
              <span className="w-2.5 h-2.5 bg-amber-500/80 rounded-full" />
              <span className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full" />
              <span className="ml-1.5 text-slate-400">sysops@bunkercore-arm64: ~/platform</span>
            </div>
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="font-mono text-[10.5px] leading-relaxed text-slate-300 space-y-1 h-[190px] overflow-y-auto pr-1">
            {logs.map((log, idx) => {
              if (!log || typeof log !== 'string') return null;
              
              const isInfo = log.startsWith(">>");
              const isError = log.includes("Error") || log.toLowerCase().includes("fail");
              const isSuccess = log.includes("EXITOSO") || log.includes("OK") || log.includes("✓");
              
              let textColor = "text-slate-400";
              if (isInfo) textColor = "text-blue-400 font-semibold";
              else if (isError) textColor = "text-red-400";
              else if (isSuccess) textColor = "text-emerald-400 font-medium";
              else if (log.startsWith("From ") || log.startsWith("[Vite]")) textColor = "text-slate-500";

              return (
                <div key={idx} className={textColor}>
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-1.5 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 font-mono">
          {status === 'running' && <span className="text-blue-400 animate-pulse">Compilando bundle...</span>}
          {status === 'success' && <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Despliegue Activado</span>}
          {status === 'idle' && <span>En espera de eventos push</span>}
        </div>

        <button
          onClick={triggerDeploy}
          disabled={isPlaying}
          className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            isPlaying 
              ? 'bg-slate-900/40 text-slate-500 border border-slate-800/60'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/20 active:translate-y-[1px]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
          Simular Webhook Push (CI/CD)
        </button>
      </div>
    </div>
  );
}
