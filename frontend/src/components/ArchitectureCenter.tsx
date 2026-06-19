import React, { useState } from 'react';
import { 
  FileText, ArrowLeft, ArrowRight, ShieldCheck, Cpu, Database, 
  HelpCircle, Sparkles, Plus, Trash2, Layers, KeyRound, Bell, ExternalLink,
  Play, Fingerprint, Smartphone, Check, HelpCircle as HelpIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArchitectureBlueprint } from '../types';

interface ArchitectureCenterProps {
  blueprints: ArchitectureBlueprint[];
  onAddBlueprint: (blueprint: ArchitectureBlueprint) => void;
  onDeleteBlueprint: (id: string) => void;
  currentUser: string;
}

// Interactive isometric hotspot definitions for the Passkey Zero-Trust diagram
const HOTSPOTS = [
  {
    id: 'bpa',
    title: 'Web App (BPA)',
    subtitle: 'Browser Passkey Agent Client',
    description: 'Componente frontend web (por ejemplo, React/SPA) que utiliza la API del navegador WebAuthn de forma directa para solicitar retos criptográficos y transmitirlos al TPM/Authenticators.',
    icon: Layers,
    color: 'from-blue-600 to-cyan-500',
    borderColor: 'border-blue-500/30 font-sans',
    pos: 'top-[12%] left-[58%]'
  },
  {
    id: 'gateway',
    title: 'Signal API Gateway',
    subtitle: 'Nginx / Ingress Reverse Proxy',
    description: 'El único conducto público externo que escucha de forma segura en puertos administrados (por ejemplo, Puerto 3000). Filtra las intenciones maliciosas, aplica políticas CORS estrictas y valida paquetes JSON antes de redirigirlos.',
    icon: Cpu,
    color: 'from-indigo-600 to-blue-500',
    borderColor: 'border-indigo-500/30',
    pos: 'top-[22%] left-[64%]'
  },
  {
    id: 'idp',
    title: 'Identity Provider (IdP)',
    subtitle: 'Criptorregistro & Servidor WebAuthn',
    description: 'El procesador criptográfico central que emite desafíos (Challenges) aleatorios de un solo uso de alta entropía, valida llaves públicas, firmas COSE, contadores de firmas y genera tokens JWT efímeros firmados.',
    icon: KeyRound,
    color: 'from-violet-600 to-indigo-500',
    borderColor: 'border-violet-500/30',
    pos: 'top-[15%] left-[72%]'
  },
  {
    id: 'alerts',
    title: 'Alert Services',
    subtitle: 'Enforcer Criptográfico & SIEM Log Guard',
    description: 'Servicio de telemetría y seguridad activa que monitorea en tiempo real todas las firmas de aserción sospechosas, re-autenticaciones manuales y bloqueos en cascada por FIDO2.',
    icon: Bell,
    color: 'from-amber-600 to-orange-500',
    borderColor: 'border-amber-500/30',
    pos: 'top-[31%] left-[71%]'
  },
  {
    id: 'backend',
    title: 'Backend Services',
    subtitle: 'Microservicios Protegidos con JWT',
    description: 'Instancias internas encapsuladas (Node.js/Express en Cloud Run) protegidas detrás del cortafuegos interno. Requieren un token WebAuthn verificado con aserción válida para realizar mutaciones de base de datos.',
    icon: ShieldCheck,
    color: 'from-[#059669] to-emerald-400',
    borderColor: 'border-emerald-500/30',
    pos: 'top-[26%] left-[81%]'
  },
  {
    id: 'db',
    title: 'Database Cluster',
    subtitle: 'Silos Particionados (Multi-Tenant Relational Hub)',
    description: 'Bases de datos altamente confiables y aisladas (como Neon PostgreSQL o Firestore Enterprise). Almacena de forma inmutable los credenciales públicos WebAuthn (ID de credencial, Llave Pública, Algoritmo, Contador de Uso).',
    icon: Database,
    color: 'from-cyan-600 to-blue-500',
    borderColor: 'border-cyan-500/30',
    pos: 'top-[32%] left-[87%]'
  },
  {
    id: 'intra',
    title: 'O_LOID Intra-Structure',
    subtitle: 'TPM Chip en Dispositivo Local / FIDO Token',
    description: 'El microchip físico seguro integrado en el teléfono, laptop o llave USB del usuario (FIDO2/WebAuthn Authenticator). Aloja de forma privada las claves maestras de firma que nunca tocan la internet ni los servidores centrales.',
    icon: KeyRound,
    color: 'from-rose-600 to-red-400',
    borderColor: 'border-rose-500/30',
    pos: 'top-[44%] left-[83%]'
  }
];

export default function ArchitectureCenter({ blueprints, onAddBlueprint, onDeleteBlueprint, currentUser }: ArchitectureCenterProps) {
  const [activeTab, setActiveTab] = useState<'interactive' | 'catalog' | 'upload'>('interactive');
  
  // Interactive diagram hotspot selection
  const [selectedHotspot, setSelectedHotspot] = useState<string>('bpa');

  // Carousel slider state for catalog
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // States for the 10 custom interactive slides in catalog carousel
  const [slide1Selected, setSlide1Selected] = useState<'frontend' | 'state' | 'privacy'>('frontend');
  const [slide2Hovered, setSlide2Hovered] = useState<'inclusivo' | 'cripto' | 'ecosistema'>('ecosistema');
  const [slide3ActiveNode, setSlide3ActiveNode] = useState<'node1' | 'node2' | 'node3'>('node3');
  const [slide4Row, setSlide4Row] = useState<string>('id');
  const [slide5Step, setSlide5Step] = useState<number>(1);
  const [slide5IsSimulating, setSlide5IsSimulating] = useState<boolean>(false);
  const [slide5Logs, setSlide5Logs] = useState<string[]>([]);
  const [slide6Method, setSlide6Method] = useState<string>('signalUnknownCredential');
  const [slide6IsTransmitting, setSlide6IsTransmitting] = useState<boolean>(false);
  const [slide6Console, setSlide6Console] = useState<string[]>([]);
  const [slide7Sync, setSlide7Sync] = useState<boolean>(false);
  const [slide7Animating, setSlide7Animating] = useState<boolean>(false);
  const [slide8Stage, setSlide8Stage] = useState<'register' | 'errors' | 'rename'>('register');
  const [slide9WebAuthn, setSlide9WebAuthn] = useState<boolean>(true);
  const [slide9Biometric, setSlide9Biometric] = useState<boolean>(true);
  const [slide10Layer, setSlide10Layer] = useState<'render' | 'components' | 'base'>('components');

  // Upload Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDesc || !formSummary) {
      setFormErrorMsg('Por favor completa todos los campos requeridos (*).');
      return;
    }

    // Default template image if empty
    const imgUrl = formImg.trim() || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800';

    const newBp: ArchitectureBlueprint = {
      id: 'bp-' + Date.now(),
      title: formTitle,
      description: formDesc,
      imageUrl: imgUrl,
      technicalSummary: formSummary,
      uploadedBy: currentUser,
      timestamp: new Date().toISOString()
    };

    try {
      onAddBlueprint(newBp);
      setFormTitle('');
      setFormDesc('');
      setFormImg('');
      setFormSummary('');
      setFormErrorMsg('');
      setFormSuccessMsg('Plan de arquitectura registrado con éxito en Firestore.');
      setTimeout(() => setFormSuccessMsg(''), 4000);
    } catch (err: any) {
      setFormErrorMsg(err.message || 'Error al persistir plano de infraestructura.');
    }
  };

  const renderInteractiveSlide = (slideId: string) => {
    switch (slideId) {
      case 'bp-static-1': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Síntesis del Modelo Passkey</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 my-3">
              {[
                {
                  key: 'frontend',
                  title: 'Frontend Inteligente',
                  desc: 'Audita hardware y orquesta la UI reactiva.',
                  color: 'border-blue-500/30 text-blue-400 hover:bg-blue-950/10'
                },
                {
                  key: 'state',
                  title: 'Estado Unificado',
                  desc: 'Inhibe desincronización con Signal API local.',
                  color: 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-950/10'
                },
                {
                  key: 'privacy',
                  title: 'Privacidad por Diseño',
                  desc: 'Silos sin PII usando hashes e IDs BLOBs.',
                  color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/10'
                }
              ].map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setSlide1Selected(item.key as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${item.color} ${
                    slide1Selected === item.key 
                      ? 'bg-slate-900 border-opacity-100 ring-1 ring-blue-500/20 scale-102 font-bold' 
                      : 'bg-transparent border-opacity-30'
                  }`}
                >
                  <h5 className="font-bold text-[10px] leading-tight mb-1">{item.title}</h5>
                  <p className="text-[8.5px] text-slate-450 font-normal leading-normal">{item.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-[#0b0e14]/90 p-4 rounded-xl border border-slate-850 font-sans space-y-2 mt-auto">
              {slide1Selected === 'frontend' && (
                <>
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-[9px] uppercase tracking-wide font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Ejecutando auditoría de hardware biométrico...
                  </div>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Antes de pintar cualquier botón de enrolamiento, la capa cliente invoca a <code className="font-mono text-blue-300">PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()</code> para confirmar la presencia del sensor TouchID/FaceID local.
                  </p>
                </>
              )}
              {slide1Selected === 'state' && (
                <>
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[9px] uppercase tracking-wide font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Sincronización de credenciales huérfanas
                  </div>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    Se previene activamente el error clásico de "llave huérfana" (revocada en servidor pero guardada en el OS). La Signal API informa bidireccionalmente los cambios al llavero nativo del usuario eliminando bucles de error.
                  </p>
                </>
              )}
              {slide1Selected === 'privacy' && (
                <>
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-[9px] uppercase tracking-wide font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Silos de datos inmunes a brechas
                  </div>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    La base de datos almacena exclusivamente el <code className="font-mono text-emerald-300">credentialId</code> binario y la clave pública (BLOB), de modo que un atacante no obtiene información PII alguna aun accediendo al servidor.
                  </p>
                </>
              )}
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg text-[9.5px] font-mono text-slate-400 text-center uppercase tracking-wide mt-3 border border-slate-900">
              "FIDO2: seguridad militar con la simplicidad de un solo toque."
            </div>
          </div>
        );
      }

      case 'bp-static-2': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Simetría: Accesibilidad vs Criptografía</span>
            </div>

            <div className="relative w-full h-[180px] my-3 flex items-center justify-center">
              <div 
                onMouseEnter={() => setSlide2Hovered('inclusivo')}
                onClick={() => setSlide2Hovered('inclusivo')}
                className={`absolute w-32 h-32 rounded-full border flex flex-col items-center justify-center -translate-x-12 transition-all opacity-95 cursor-pointer ${
                  slide2Hovered === 'inclusivo' 
                    ? 'bg-blue-950/20 border-blue-500 shadow-xl shadow-blue-500/10 z-10 scale-102' 
                    : 'bg-transparent border-blue-500/25'
                }`}
              >
                <div className="flex flex-col items-center text-center p-2">
                  <span className="font-bold text-[10px] text-blue-400 uppercase tracking-widest font-mono">DISEÑO</span>
                  <span className="text-[9px] text-slate-450 mt-0.5">Inclusivo</span>
                </div>
              </div>

              <div 
                onMouseEnter={() => setSlide2Hovered('cripto')}
                onClick={() => setSlide2Hovered('cripto')}
                className={`absolute w-32 h-32 rounded-full border flex flex-col items-center justify-center translate-x-12 transition-all opacity-95 cursor-pointer ${
                  slide2Hovered === 'cripto' 
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-500/10 z-10 scale-102' 
                    : 'bg-transparent border-emerald-500/25'
                }`}
              >
                <div className="flex flex-col items-center text-center p-2">
                  <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-widest font-mono">DEFENSA</span>
                  <span className="text-[9px] text-slate-450 mt-0.5">Criptográfica</span>
                </div>
              </div>

              <div 
                onMouseEnter={() => setSlide2Hovered('ecosistema')}
                onClick={() => setSlide2Hovered('ecosistema')}
                className={`absolute w-18 h-18 rounded-full flex flex-col items-center justify-center z-20 cursor-pointer transition-all border ${
                  slide2Hovered === 'ecosistema'
                    ? 'bg-gradient-to-r from-blue-900/60 to-emerald-900/60 border-slate-300 scale-105 shadow-2xl'
                    : 'bg-slate-900/95 border-slate-800'
                }`}
              >
                <div className="text-center p-1 flex flex-col items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-slate-100 uppercase tracking-wider leading-none">Passkey</span>
                  <span className="text-[7px] font-mono text-slate-400">Ecosistema</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0e14]/90 p-4 rounded-xl border border-slate-850 font-sans space-y-1.5 mt-auto">
              {slide2Hovered === 'inclusivo' && (
                <>
                  <span className="text-[9.5px] text-blue-400 font-mono uppercase tracking-wide font-bold">Pilar: Diseño Inclusivo (UX)</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    - Interfaz modular adaptada a mallas.<br />
                    - Reducción drástica de la carga cognitiva (sin contraseñas redundantes que memorizar).<br />
                    - Ayuda guiada asistida contextual ante incidencias del lector (sección #help).
                  </p>
                </>
              )}
              {slide2Hovered === 'cripto' && (
                <>
                  <span className="text-[9.5px] text-emerald-400 font-mono uppercase tracking-wide font-bold">Pilar: Defensa Criptográfica</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    - Zero-shot identity: validación matemática asimétrica sin revelar secretos.<br />
                    - Neutralidad frente a phishing (credenciales firmes enlazadas al rpId).<br />
                    - Mitiga ataques de inyección, manipulación de red y deepfakes en sesión.
                  </p>
                </>
              )}
              {slide2Hovered === 'ecosistema' && (
                <>
                  <span className="text-[9.5px] text-yellow-500 font-mono uppercase tracking-wide font-bold">Área Convergente: El Ecosistema Passkey</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    La máxima seguridad de red requiere simplicidad para el humano. Unifica la robustez criptográfica con el confort de un solo toque biométrico.
                  </p>
                </>
              )}
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-center uppercase tracking-wide mt-3 border-t border-slate-900 pt-2.5">
              "La máxima seguridad solo es efectiva si su interfaz es utilizable."
            </div>
          </div>
        );
      }

      case 'bp-static-3': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Ecosistema de David Camacho (Caso de Estudio)</span>
            </div>

            <div className="my-3 relative bg-[#0b0e14]/80 p-4 rounded-xl border border-slate-850 flex flex-col h-[180px] justify-between">
              <div className="relative flex items-center justify-between w-full mt-6 px-1">
                <div className="absolute left-2 right-2 h-0.5 bg-slate-800 z-0" />
                <div 
                  className="absolute left-2 h-0.5 bg-indigo-500 transition-all duration-300 z-0"
                  style={{ width: slide3ActiveNode === 'node1' ? '0%' : slide3ActiveNode === 'node2' ? '46%' : '92%' }}
                />
                
                {[
                  { id: 'node1', date: '27 Ene', title: 'Adobe Acrobat', crit: 'Bajo' },
                  { id: 'node2', date: '03-17 Feb', title: 'HBO Max', crit: 'Medio' },
                  { id: 'node3', date: '19 Feb (Punto)', title: 'Google AI / Drive', crit: 'Alto' }
                ].map((node) => (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => setSlide3ActiveNode(node.id as any)}
                    className="relative z-10 flex flex-col items-center cursor-pointer group"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${
                      slide3ActiveNode === node.id 
                        ? 'bg-slate-950 border-indigo-500 scale-125 shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}>
                      {slide3ActiveNode === node.id && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 tracking-tight mt-1">{node.date}</span>
                    <span className="text-[8px] text-slate-500 font-mono truncate max-w-[80px] text-center mt-0.5">{node.title}</span>
                  </button>
                ))}
              </div>

              <div className="border border-slate-850 bg-slate-950/60 rounded-lg p-2.5 flex items-center justify-between gap-3 text-[10px] font-mono mt-auto">
                <span className="text-[9px] text-slate-500 uppercase">CURVA DE CRITICIDAD DE INFORMACIÓN:</span>
                <div className="flex gap-1.5 items-end h-6 w-24">
                  <div className={`w-6 h-2 rounded-t transition-colors ${slide3ActiveNode === 'node1' ? 'bg-blue-500' : 'bg-slate-800'}`} />
                  <div className={`w-6 h-4 rounded-t transition-colors ${slide3ActiveNode === 'node2' || slide3ActiveNode === 'node3' ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                  <div className={`w-6 h-6 rounded-t transition-colors ${slide3ActiveNode === 'node3' ? 'bg-rose-500' : 'bg-slate-800'}`} />
                </div>
              </div>
            </div>

            <div className="bg-[#0b0e14]/90 p-4 rounded-xl border border-slate-850 font-sans space-y-1 mt-auto">
              {slide3ActiveNode === 'node1' && (
                <>
                  <span className="text-[9.5px] text-blue-400 font-mono uppercase tracking-wide font-bold">Fase 1: Adobe Acrobat Pro (27 de Ene)</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Criticidad de Datos: BAJO.</strong> Adopción inicial de procesamiento de documentos y firmas operativas locales comunes. Excluye PII por diseño simple.
                  </p>
                </>
              )}
              {slide3ActiveNode === 'node2' && (
                <>
                  <span className="text-[9.5px] text-indigo-400 font-mono uppercase tracking-wide font-bold">Fase 2: HBO Max (03 - 17 de Feb)</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Criticidad de Datos: MEDIO.</strong> Gestión activa de múltiples perfiles, PINs redundantes, controles y credenciales estáticos con alta carga cognitiva.
                  </p>
                </>
              )}
              {slide3ActiveNode === 'node3' && (
                <>
                  <span className="text-[9.5px] text-rose-450 font-mono uppercase tracking-wide font-bold">Fase 3: Google AI Pro / Drive &bull; PUNTO CRÍTICO (19 Feb)</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Criticidad de Datos: CRÍTICO.</strong> Activación de IA avanzada y resguardos confidenciales. La aserción robusta FIDO2 garantiza blindaje contra suplantación y ataques phishing.
                  </p>
                </>
              )}
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-center uppercase tracking-wide mt-3 border-t border-slate-900 pt-2.5">
              "A mayor valor del servicio, FIDO2 pasa de comodidad a exigencia."
            </div>
          </div>
        );
      }

      case 'bp-static-4': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40 flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Esquema Credentials_Table (PII-free)</span>
              <span className="text-[8.5px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-blue-400 border border-slate-800/60 font-bold">Drizzle Schema</span>
            </div>

            <div className="my-2 border border-slate-850 rounded-xl overflow-hidden bg-slate-950 font-mono">
              <div className="bg-[#0b0e14] p-2 text-[9px] font-bold text-slate-400 border-b border-slate-850 grid grid-cols-12 gap-1">
                <span className="col-span-4">CAMPO</span>
                <span className="col-span-3">TIPO</span>
                <span className="col-span-5 text-right">METADATO</span>
              </div>
              
              <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-900">
                {[
                  { field: 'ID (Primary Key)', type: 'VARCHAR(255)', desc: 'Identificador único Base64URL.', key: 'id' },
                  { field: 'PublicKey (BLOB)', type: 'BYTEA / BLOB', desc: 'Clave pública inútil sin TPM.', key: 'pk' },
                  { field: 'Passkey User ID', type: 'VARCHAR(64)', desc: 'FK que aisla de datos de David.', key: 'fk' },
                  { field: 'Transports (JSON)', type: 'JSONB (Array)', desc: 'USB, NFC, BLE, Internal.', key: 'trans' },
                  { field: 'Backed Up', type: 'BOOLEAN', desc: 'Sincronización nativa del OS.', key: 'backup' }
                ].map((row) => (
                  <button
                    type="button"
                    key={row.key}
                    onClick={() => setSlide4Row(row.key)}
                    className={`w-full text-left p-2 hover:bg-[#0c101a] grid grid-cols-12 gap-1 text-[9px] items-center cursor-pointer transition-colors ${
                      slide4Row === row.key ? 'bg-blue-950/20 text-blue-300 border-l border-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <span className="col-span-4 text-slate-200 font-semibold truncate">{row.field}</span>
                    <span className="col-span-3 font-mono text-blue-400">{row.type}</span>
                    <span className="col-span-5 text-right text-slate-500 truncate">{row.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0e14]/90 p-3 rounded-xl border border-slate-850 font-mono text-[9.5px] space-y-1 max-h-[85px] overflow-auto mt-auto">
              {slide4Row === 'id' && (
                <>
                  <span className="text-blue-450 text-[8.5px] uppercase font-bold">&gt;_ Raw Payload [id]</span>
                  <p className="text-slate-300 leading-normal">
                    "7f3c8a91b2c4d5e6f7g8h9..." &bull; Guardado en texto plano URL-Safe para coincidencias en aserciones de login.
                  </p>
                </>
              )}
              {slide4Row === 'pk' && (
                <>
                  <span className="text-emerald-405 text-[8.5px] uppercase font-bold">&gt;_ Publickey binary [BLOB]</span>
                  <p className="text-slate-300 leading-normal">
                    0x3059301306072A8648CE3D020106082A86480103... (Clave binaria en formato COSE del hardware).
                  </p>
                </>
              )}
              {slide4Row === 'fk' && (
                <>
                  <span className="text-indigo-405 text-[8.5px] uppercase font-bold">&gt;_ Foreign key linkage</span>
                  <p className="text-slate-300 leading-normal">
                    No vincula nombres. Vincula un hash correlacional, aislando los datos de David de la tabla.
                  </p>
                </>
              )}
              {slide4Row === 'trans' && (
                <>
                  <span className="text-amber-450 text-[8.5px] uppercase font-bold">&gt;_ Transports configurations</span>
                  <p className="text-slate-300 leading-normal">
                    ["internal", "hybrid", "usb"] &bull; Informa para ofrecer la UI adaptativa correspondiente.
                  </p>
                </>
              )}
              {slide4Row === 'backup' && (
                <>
                  <span className="text-teal-455 text-[8.5px] uppercase font-bold">&gt;_ Backup status flag</span>
                  <p className="text-slate-300 leading-normal">
                    TRUE: Sincronizada automáticamente en iCloud Keychain / Google Password Manager local.
                  </p>
                </>
              )}
            </div>
          </div>
        );
      }

      case 'bp-static-5': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Simulador de Backend: 3 Fases de Registro</span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2.5">
              {[
                { phase: 1, title: '1. Opciones', sub: 'SimpleWebAuthn' },
                { phase: 2, title: '2. Verificación', sub: 'Firma matemática' },
                { phase: 3, title: '3. Persistencia', sub: 'Registro DB' }
              ].map((p) => (
                <div 
                  key={p.phase}
                  className={`p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                    slide5Step === p.phase 
                      ? 'bg-slate-900 border-indigo-500 scale-101 ring-1 ring-indigo-500/10' 
                      : 'bg-[#0b0e14]/50 border-slate-850/60'
                  }`}
                >
                  <div>
                    <h6 className={`font-mono text-[8.5px] font-bold ${slide5Step === p.phase ? 'text-indigo-400' : 'text-slate-500'}`}>{p.title}</h6>
                    <p className="text-[7.5px] text-slate-400 leading-tight mt-0.5">{p.sub}</p>
                  </div>
                  <div className="text-right text-[8px] font-mono mt-1 text-slate-500">FASE 0{p.phase}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#05070a] border border-slate-850 p-3 rounded-xl font-mono text-[9px] space-y-1 my-1.5 h-[130px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1 text-slate-500 text-[8px] uppercase font-bold">
                <span>Consola del Servidor (Validando Challenge)</span>
                {slide5IsSimulating && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
              </div>
              <div className="space-y-0.5 text-slate-400 leading-tight">
                {slide5Logs.length === 0 ? (
                  <div className="text-slate-500 italic py-6 text-center">Presiona "Simular Registro" para iniciar pruebas.</div>
                ) : (
                  slide5Logs.map((log, idx) => (
                    <div key={idx}>&gt; {log}</div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-between items-center mt-auto">
              <span className="text-[9px] text-slate-500 font-mono">FIDO2 Server en Puerto 3000</span>
              <button
                type="button"
                onClick={() => {
                  if (slide5IsSimulating) return;
                  setSlide5IsSimulating(true);
                  setSlide5Step(1);
                  setSlide5Logs(["Generando retos en SimpleWebAuthn...", "[Fase 1] Challenge SHA-256 emitido con éxito."]);
                  
                  setTimeout(() => {
                    setSlide5Step(2);
                    setSlide5Logs(prev => [...prev, "[Fase 2] Validando aserción criptográfica...", "Invocando validación rpId [bunkercore]...", "User Presence (UP) y User Verification (UV) confirmados."]);
                  }, 1200);

                  setTimeout(() => {
                    setSlide5Step(3);
                    setSlide5Logs(prev => [...prev, "[Fase 3] Guardando credencial en Credentials_Table.", "ID de llave guardada en Firestore de David Camacho.", "¡Flujo verificado!"]);
                    setSlide5IsSimulating(false);
                  }, 2400);
                }}
                disabled={slide5IsSimulating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-30 uppercase font-bold"
              >
                <Play className="w-3 h-3" />
                <span>Simular Registro</span>
              </button>
            </div>
          </div>
        );
      }

      case 'bp-static-6': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">WebAuthn Signal API Interface</span>
            </div>

            <div className="flex gap-1.5 justify-between my-2 mt-2.5">
              {[
                { method: 'signalUnknownCredential', label: 'Revoked Check', border: 'border-rose-900/40 text-rose-300' },
                { method: 'signalCurrentUserDetails', label: 'Update Info', border: 'border-blue-900/40 text-blue-300' },
                { method: 'signalAllAcceptedCredentials', label: 'Sync Keychain', border: 'border-emerald-900/40 text-emerald-300' }
              ].map((m) => (
                <button
                  type="button"
                  key={m.method}
                  onClick={() => {
                    setSlide6Method(m.method);
                    setSlide6IsTransmitting(true);
                    setSlide6Console([`Disparando evento via Signal API: ${m.method}()`]);
                    
                    setTimeout(() => {
                      if (m.method === 'signalUnknownCredential') {
                        setSlide6Console(prev => [...prev, "Señalando llave revocada al OS Password Manager...", "Llavero local removió alias obsoleto con éxito."]);
                      } else if (m.method === 'signalCurrentUserDetails') {
                        setSlide6Console(prev => [...prev, "Actualizando alias de llave en llavero local...", "Nuevo alias: David Camacho (Bunkercore)."]);
                      } else {
                        setSlide6Console(prev => [...prev, "Comparando llaves con registros del host...", "Purga de llavero local terminada."]);
                      }
                      setSlide6IsTransmitting(false);
                    }, 1250);
                  }}
                  className={`p-2 rounded-lg border text-center text-[8px] font-mono leading-tight hover:bg-slate-900 transition-all cursor-pointer flex-1 ${
                    slide6Method === m.method 
                      ? 'bg-slate-950 font-bold border-opacity-100 ring-1 ring-blue-500/20' 
                      : 'bg-[#0b0e14]/40 border-opacity-30'
                  } ${m.border}`}
                >
                  <span className="block font-semibold">{m.method}</span>
                  <span className="text-[7.5px] text-slate-500 font-sans mt-0.5 font-normal block">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#05070a] border border-slate-850 p-3 rounded-xl font-mono text-[9px] space-y-1 my-2 h-[120px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-[8px] uppercase border-b border-slate-900 pb-1 font-bold">
                  <span>WebSocket Bridge Monitor</span>
                  {slide6IsTransmitting && <span className="text-blue-400 text-[7.5px] animate-pulse">EMITIENDO SEÑAL...</span>}
                </div>
                <div className="space-y-0.5 text-slate-400 mt-1 leading-normal">
                  {slide6Console.length === 0 ? (
                    <div className="text-slate-500 italic py-5 text-center">Selecciona un método en los botones superiores para disparar señales.</div>
                  ) : (
                    slide6Console.map((log, idx) => (
                      <div key={idx}>&gt; {log}</div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="text-[8px] text-slate-500 text-right leading-none border-t border-slate-950 pt-1.5 font-bold">
                ESTADO: {slide6IsTransmitting ? 'EMITIENDO RASTRO' : 'SISTEMA ESCUCHANDO'}
              </div>
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-center uppercase tracking-wide border-t border-slate-900 pt-2">
              "Comunicación bidireccional que frena inicios obstruidos."
            </div>
          </div>
        );
      }

      case 'bp-static-7': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">El Abismo de la Desincronización</span>
            </div>

            <div className="bg-[#0b0e14]/80 p-3 rounded-xl border border-slate-850 my-2 flex items-center justify-between gap-2.5">
              <div className="font-sans">
                <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Estado del Canal</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {slide7Sync ? 'El host mantiene al llavero OS al tanto de cada revocación de llaves.' : 'El llavero OS retiene claves obsoletas revocadas en el host.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSlide7Animating(true);
                  setTimeout(() => {
                    setSlide7Sync(p => !p);
                    setSlide7Animating(false);
                  }, 1000);
                }}
                disabled={slide7Animating}
                className={`py-1.5 px-3 rounded-lg text-[8.5px] font-mono whitespace-nowrap uppercase tracking-wider font-bold transition-all hover:scale-101 border cursor-pointer shrink-0 ${
                  slide7Sync 
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-950/20 text-rose-400 border-rose-500/20 hover:bg-rose-900/30'
                }`}
              >
                {slide7Animating ? 'MODULANDO...' : slide7Sync ? 'CONECTADO ✓' : 'DESCONECTADO ⚠'}
              </button>
            </div>

            <div className="relative w-full h-[120px] bg-slate-950 border border-slate-850 rounded-xl my-2 flex items-center justify-around font-sans">
              <div className="text-center flex flex-col items-center gap-1">
                <div className="p-2 bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <span className="text-[8.5px] font-mono font-semibold">Servidor Web</span>
              </div>

              <div className="relative flex-1 max-w-[100px] h-3 flex items-center justify-center">
                <div className={`absolute left-0 right-0 h-0.5 ${slide7Sync ? 'bg-emerald-500/40' : 'bg-rose-500/20 border-dashed border-t'}`} />
                {slide7Sync ? (
                  <div className="absolute w-2.5 h-2.5 bg-emerald-450 rounded-full animate-ping" />
                ) : (
                  <span className="absolute text-[10px] text-rose-505 font-bold leading-none select-none">✕</span>
                )}
              </div>

              <div className="text-center flex flex-col items-center gap-1">
                <div className={`p-2 rounded-xl border transition-colors ${slide7Sync ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <span className="text-[8.5px] font-mono font-semibold">Llavero Local OS</span>
              </div>
            </div>

            <div className="bg-[#0b0e14]/90 p-3.5 rounded-xl border border-slate-850 font-sans text-slate-300 leading-relaxed text-[11px] mt-auto">
              {slide7Sync ? (
                <span>
                  <strong>Solución Integrada:</strong> Al eliminar una clave, la app emite una señal criptográfica al llavero local. El OS remueve el alias roto evitando aserciones caídas en el login.
                </span>
              ) : (
                <span>
                  <strong>El Problema:</strong> El usuario intenta autenticarse, su celular ofrece una clave desfasada, y el servidor rebota la firma con aserciones rechazadas matemáticamente.
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'bp-static-8': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Loop del Ciclo de Vida del KeyToken</span>
            </div>

            <div className="flex justify-between gap-1.5 my-2">
              {[
                { stage: 'register', label: '1. register() API', border: 'border-blue-500/30 text-blue-400' },
                { stage: 'errors', label: '2. Catch Errores', border: 'border-rose-500/30 text-rose-450' },
                { stage: 'rename', label: '3. AAGUID Alias', border: 'border-teal-500/30 text-teal-400' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.stage}
                  onClick={() => setSlide8Stage(s.stage as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-mono text-[8px] flex-1 cursor-pointer transition-all ${
                    slide8Stage === s.stage 
                      ? 'bg-slate-900 border-opacity-100 font-bold scale-101 ring-1 ring-indigo-500/10' 
                      : 'bg-[#0b0e14]/45 border-opacity-20'
                  } ${s.border}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="bg-[#050608] border border-slate-850 p-3.5 rounded-xl font-mono text-[8.5px] h-[140px] overflow-auto space-y-1 leading-snug mt-1.5">
              {slide8Stage === 'register' && (
                <>
                  <span className="text-slate-500 block border-b border-slate-900 pb-1 uppercase text-[7.5px] font-bold">Client-side Registration Hook</span>
                  <div className="text-slate-400 space-y-0.5">
                    <div><span className="text-blue-400 font-semibold">const</span> cred = <span className="text-indigo-400">await</span> navigator.credentials.create(&#123;</div>
                    <div className="pl-3">publicKey: &#123;</div>
                    <div className="pl-6">challenge: <span className="text-amber-300">base64urlToUint8(challenge)</span>,</div>
                    <div className="pl-6">user: &#123; id: <span className="text-amber-300">userIdHash</span> &#125;,</div>
                    <div className="pl-6">pubKeyCredParams: [&#123; alg: <span className="text-emerald-450">-7</span>, type: <span className="text-slate-400">"public-key"</span> &#125;]</div>
                    <div className="pl-3">&#125;</div>
                    <div>&#125;);</div>
                  </div>
                </>
              )}
              {slide8Stage === 'errors' && (
                <>
                  <span className="text-slate-500 block border-b border-slate-900 pb-1 uppercase text-[7.5px] font-bold">Error Interceptor (Exclusiones FIDO2)</span>
                  <div className="text-slate-400 space-y-0.5">
                    <div><span className="text-rose-405 font-semibold">catch</span> (err) &#123;</div>
                    <div className="pl-3"><span className="text-indigo-400">if</span> (err.name === <span className="text-slate-300">"InvalidStateError"</span>) &#123;</div>
                    <div className="pl-6 text-slate-500">// La llave ya existe en el enclave biométrico físico del TPM.</div>
                    <div className="pl-6">showAlert(<span className="text-rose-300 font-semibold">"Llave física duplicada"</span>);</div>
                    <div className="pl-3">&#125; <span className="text-indigo-400">else</span> <span className="text-indigo-400">if</span> (err.name === <span className="text-slate-300">"NotAllowedError"</span>) &#123;</div>
                    <div className="pl-6 text-slate-500">// Cancelación voluntaria biométrica.</div>
                    <div className="pl-3">&#125;</div>
                    <div>&#125;</div>
                  </div>
                </>
              )}
              {slide8Stage === 'rename' && (
                <>
                  <span className="text-slate-500 block border-b border-slate-900 pb-1 uppercase text-[7.5px] font-bold">AAGUID Alias Masker</span>
                  <div className="text-slate-400 space-y-0.5">
                    <div><span className="text-teal-400 font-semibold">async function</span> <span className="text-blue-400">getAlias</span>(aaguid) &#123;</div>
                    <div className="pl-3"><span className="text-indigo-400">const</span> known = &#123;</div>
                    <div className="pl-6">"ad56b9e1-..." : <span className="text-emerald-400 font-semibold">"Apple Touch ID"</span>,</div>
                    <div className="pl-6">"78fa09b2-..." : <span className="text-emerald-400 font-semibold">"YubiKey 5C NFC"</span></div>
                    <div className="pl-3">&#125;;</div>
                    <div className="pl-3"><span className="text-indigo-400">return</span> known[aaguid] || <span className="text-slate-400">"Llave de seguridad"</span>;</div>
                    <div>&#125;</div>
                  </div>
                </>
              )}
            </div>

            <div className="text-[9px] text-slate-500 font-mono text-center uppercase tracking-wide mt-3 border-t border-slate-900 pt-2.5">
              "Exclusión activa de bloqueos por cancelaciones o colisiones."
            </div>
          </div>
        );
      }

      case 'bp-static-9': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Detección de Hardware &amp; Conditional UI Wizard</span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-2.5">
              <div className="space-y-3 bg-[#0b0e14]/65 p-2.5 rounded-xl border border-slate-850">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">¿Soporta WebAuthn?</span>
                  <div className="flex gap-1">
                    {[true, false].map((v) => (
                      <button
                        type="button"
                        key={v ? 'y' : 'n'}
                        onClick={() => setSlide9WebAuthn(v)}
                        className={`flex-1 py-1 text-[9.5px] font-mono rounded cursor-pointer border transition-all ${
                          slide9WebAuthn === v 
                            ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-bold' 
                            : 'bg-transparent border-slate-800 text-slate-500'
                        }`}
                      >
                        {v ? 'SÍ' : 'NO'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">¿Lector Biométrico?</span>
                  <div className="flex gap-1">
                    {[true, false].map((v) => (
                      <button
                        type="button"
                        key={v ? 'y' : 'n'}
                        onClick={() => setSlide9Biometric(v)}
                        className={`flex-1 py-1 text-[9.5px] font-mono rounded cursor-pointer border transition-all ${
                          slide9Biometric === v 
                            ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-bold' 
                            : 'bg-transparent border-slate-800 text-slate-500'
                        }`}
                      >
                        {v ? 'SÍ' : 'NO'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/85 border border-slate-850 p-2 text-[9px] rounded-xl flex flex-col justify-between items-center text-center h-[115px] pt-2.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-none">MOCK PREVIEW</span>
                
                <div className="my-auto w-full px-1.5">
                  {!slide9WebAuthn ? (
                    <div className="bg-[#0e0f14] p-2 rounded border border-slate-800 text-[9px] text-slate-450 leading-tight">
                      <span className="font-bold block text-slate-300 uppercase text-[8px] mb-0.5">Acceso Clásico</span>
                      [ Campo Password ]
                    </div>
                  ) : !slide9Biometric ? (
                    <div className="bg-[#0e0f14] p-2.5 rounded border border-dashed border-slate-800 text-[8.5px] text-slate-500 italic leading-snug">
                      Clon de registro ocultado para evitar fricción local.
                    </div>
                  ) : (
                    <button type="button" className="w-full bg-blue-600/20 border border-blue-500/50 hover:border-blue-400 p-2 rounded-xl text-blue-300 flex items-center justify-center gap-1 transition-all text-[8.5px] uppercase font-bold animate-pulse leading-none">
                      <Fingerprint className="w-4 h-4 text-blue-400" />
                      <span>Acceso Passkey</span>
                    </button>
                  )}
                </div>
                
                <span className="text-[7.5px] text-slate-500 font-mono font-bold leading-none">STATUS: CONTROLADO</span>
              </div>
            </div>

            <div className="bg-[#0b0e14]/90 p-3.5 rounded-xl border border-slate-850 font-sans text-slate-300 leading-relaxed text-[11px] mt-auto">
              {!slide9WebAuthn ? (
                <span>
                  <strong>UI Condicional:</strong> WebAuthn no es compatible. Despliega inmediatamente el login tradicional ordinario conservando total disponibilidad.
                </span>
              ) : !slide9Biometric ? (
                <span>
                  <strong>Ocultación inteligente:</strong> Compatible con la API, pero sin sensor biométrico local. Se tapa proactivamente el enrolamiento previniendo quejas del usuario.
                </span>
              ) : (
                <span>
                  <strong>Un Solo Toque:</strong> Todo verificado. Acceso biométrico integrado al autocompletado del OS para firmar tokens en 1.5s en un solo gesto.
                </span>
              )}
            </div>
          </div>
        );
      }

      case 'bp-static-10': {
        return (
          <div className="p-4 flex flex-col justify-between h-full min-h-[380px] bg-[#0a0c10] text-slate-350 font-sans select-none text-xs">
            <div className="text-center pb-2 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Anatomía de Capas del Cliente SPA</span>
            </div>

            <div className="relative w-full h-[150px] my-3 flex flex-col justify-around font-sans">
              {[
                { layer: 'render', label: 'Capa 1: lit-html v2.6.1 (Renderizado)', style: 'bg-indigo-950/45 border-indigo-500/30 text-indigo-400', desc: 'Previene repintados del DOM actualizando reactivamente.' },
                { layer: 'components', label: 'Capa 2: Componentes (MDUI Framework)', style: 'bg-blue-950/45 border-blue-500/30 text-blue-300', desc: 'Minimiza la carga cognitiva con widgets táctiles accesibles.' },
                { layer: 'base', label: 'Capa 3: DOM Estructurado (#help, #list)', style: 'bg-emerald-950/45 border-emerald-500/30 text-emerald-300', desc: 'Aísla portales lógicos de ayuda, alias y listas.' }
              ].map((l) => (
                <button
                  type="button"
                  key={l.layer}
                  onClick={() => setSlide10Layer(l.layer as any)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between text-[9.5px] transition-all cursor-pointer ${
                    slide10Layer === l.layer 
                      ? 'bg-slate-900 border-opacity-100 scale-102 font-bold ring-1 ring-blue-500/20' 
                      : 'bg-[#0a0c10]/45 border-opacity-30'
                  } ${l.style}`}
                >
                  <span className="font-semibold">{l.label}</span>
                  <span className="text-[8px] text-slate-500 font-mono font-bold">
                    {slide10Layer === l.layer ? '✕ AISLADO' : 'INSPECCIONAR'}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-[#0b0e14]/90 p-3.5 rounded-xl border border-slate-850 font-sans text-slate-300 leading-relaxed text-[11px] mt-auto overflow-auto max-h-[85px]">
              {slide10Layer === 'render' && (
                <span>
                  <strong>lit-html v2.6.1:</strong> Motor reactivo desde CDN. Renderización dirigida que modifica nodos elementales en lugar de refrescar pantallas completas, reduciendo CPU.
                </span>
              )}
              {slide10Layer === 'components' && (
                <span>
                  <strong>Estética Material Design:</strong> Construidos mediante <code>&lt;mdui-button&gt;</code> y <code>&lt;mdui-list&gt;</code>, con zonas táctiles garantizadas mayores a 44px.
                </span>
              )}
              {slide10Layer === 'base' && (
                <span>
                  <strong>Malla de Portales:</strong> Código cliente segregado en cajas lógicas: guías de uso (#help), personalizador de alias (#display-name) y listas de claves (#list).
                </span>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const activeHotspotObj = HOTSPOTS.find(h => h.id === selectedHotspot) || HOTSPOTS[0];

  return (
    <div className="bg-[#090c10] border border-slate-800/80 rounded-2xl shadow-2xl p-6" id="architecture-blueprint-center">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Blueprint Center (Arquitecturas de Confianza Cero)
              <span className="text-[9px] bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-mono">Live Sync</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Análisis interactivos de topología, flujos FIDO2, WebAuthn y mallas de aislamiento multi-tenant.
            </p>
          </div>
        </div>

        {/* Tab Controls Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60 max-w-sm">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'interactive'
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagrama Activo
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'catalog'
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Catálogo ({blueprints.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compartir Plano
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div>
        
        {/* TAB 1: FULLY INTERACTIVE VECTOR ISO DIAGRAM */}
        {activeTab === 'interactive' && (
          <div className="space-y-6" id="interactive-diagram-view">
            
            {/* Split Screen Grid: Interactive Map + Technical SpecSheet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Isometric Model Stage */}
              <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[380px] select-none">
                
                {/* Visual Title Grid */}
                <div className="z-10">
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-mono uppercase tracking-widest">Vista Esquemática 3D Isometric</span>
                  <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight mt-1">El Ecosistema Passkey y Flujos de Confianza</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">Pasa por encima de los nodos interactivos para examinar el ciclo WebAuthn.</p>
                </div>

                {/* Ambient Vector lines and background structures representing network paths */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                  {/* Outer glowing network lanes */}
                  <div className="absolute w-[80%] h-[60%] border border-dashed border-blue-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
                  <div className="absolute w-[60%] h-[40%] border border-dashed border-indigo-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                </div>

                {/* THE 3D FLOW CHART GRID */}
                <div className="relative w-full h-[220px] my-6">
                  
                  {/* Draw connection pathways / vector lines based on active hotspot */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.2))' }}>
                    
                    {/* SVG Connector lines showing challenge response protocols */}
                    <line x1="58%" y1="12%" x2="64%" y2="22%" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="64%" y1="22%" x2="72%" y2="15%" stroke="#6366f1" strokeWidth="1.5" opacity="0.7" />
                    <line x1="72%" y1="15%" x2="71%" y2="31%" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
                    <line x1="71%" y1="31%" x2="81%" y2="26%" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" />
                    <line x1="81%" y1="26%" x2="87%" y2="32%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                    
                    {/* Flow path representing WebAuthn token signature validation */}
                    <path d="M 58% 12% C 48% 12%, 48% 44%, 83% 44%" stroke="#f43f5e" strokeWidth="1.5" fill="none" strokeDasharray="5 5" opacity="0.8" />
                    
                    {/* Interactive trace laser circle for node connectivity feedback */}
                    <circle cx={activeHotspotObj.id === 'bpa' ? '58%' : activeHotspotObj.id === 'gateway' ? '64%' : activeHotspotObj.id === 'idp' ? '72%' : activeHotspotObj.id === 'alerts' ? '71%' : activeHotspotObj.id === 'backend' ? '81%' : activeHotspotObj.id === 'db' ? '87%' : '83%'} cy={activeHotspotObj.id === 'bpa' ? '12%' : activeHotspotObj.id === 'gateway' ? '22%' : activeHotspotObj.id === 'idp' ? '15%' : activeHotspotObj.id === 'alerts' ? '31%' : activeHotspotObj.id === 'backend' ? '26%' : activeHotspotObj.id === 'db' ? '32%' : '44%'} r="16" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="1" className="animate-ping" />
                  </svg>

                  {/* Hotspot triggers overlay */}
                  {HOTSPOTS.map((spot) => {
                    const Icon = spot.icon;
                    const isSelected = selectedHotspot === spot.id;
                    return (
                      <button
                        key={spot.id}
                        onMouseEnter={() => setSelectedHotspot(spot.id)}
                        onClick={() => setSelectedHotspot(spot.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl border transition-all duration-200 z-20 flex items-center justify-center cursor-pointer shadow-lg ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-400 text-white scale-115 shadow-blue-500/30' 
                            : 'bg-slate-900/95 border-slate-700/60 hover:border-slate-400 text-slate-300 hover:scale-105'
                        } ${spot.pos}`}
                        title={spot.title}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        
                        {/* Interactive hotspot labels for desktop display */}
                        <span className={`absolute top-full mt-1.5 whitespace-nowrap bg-[#0b0f14] border border-slate-800 text-[9px] font-mono px-1.5 py-0.5 rounded-md shadow-2xl pointer-events-none transition-opacity duration-200 ${
                          isSelected ? 'opacity-100 text-blue-300 border-blue-500/30 font-bold' : 'opacity-40 text-slate-400'
                        }`}>
                          {spot.title.split(' (')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Flow synthesis label footer */}
                <div className="border-t border-slate-900/60 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>SÍNTESIS DE INFRAESTRUCTURA (SPA, SIGNAL API & BACKEND)</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-slate-400 uppercase">Live Hotspots</span>
                  </div>
                </div>

              </div>

              {/* Technical Spec Sheet View */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#0b0e14] to-[#080a0f] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between" id="technical-spec-sheet">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-3 bg-blue-500 rounded" />
                    <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono">Ficha de Especificación Técnica</h4>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHotspotObj.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${activeHotspotObj.color} text-white shadow-md`}>
                          <activeHotspotObj.icon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-100">{activeHotspotObj.title}</h3>
                          <span className="text-[10px] text-blue-400 font-mono tracking-wider">{activeHotspotObj.subtitle}</span>
                        </div>
                      </div>

                      <p className="text-[12.5px] text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 shadow-inner">
                        {activeHotspotObj.description}
                      </p>

                      <div className="border border-slate-850 bg-slate-950/20 p-3.5 rounded-xl text-[11px] text-slate-400 font-mono space-y-2">
                        <div className="flex justify-between border-b border-slate-900/65 pb-1.5">
                          <span>Aislamiento:</span>
                          <strong className="text-slate-300 uppercase">Estricto / Nivel de Kernel</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-900/65 pb-1.5">
                          <span>Token Criptográfico:</span>
                          <strong className="text-slate-300 uppercase">ASSERTS SHA-256 ECDSA</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Estatus en Applet:</span>
                          <strong className="text-emerald-400 uppercase">ACTIVO Y VERIFICADO</strong>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Hotspot Selector navigation helper buttons */}
                <div className="mt-6 pt-4 border-t border-slate-900/50 flex items-center justify-between gap-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {HOTSPOTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedHotspot(s.id)}
                        className={`px-2 py-1 text-[9px] font-mono rounded-md border transition-all ${
                          selectedHotspot === s.id 
                            ? 'bg-slate-900 border-blue-500/40 text-blue-300 font-bold' 
                            : 'bg-transparent border-transparent hover:border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {s.id.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-600 hidden sm:block shrink-0" title="Información Interactiva" />
                </div>

              </div>

            </div>

            {/* Note block about Zero-Trust integration */}
            <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed">
                  Esta arquitectura representa el <strong>búnker criptográfico</strong> implementado en este código. Cuando un gerente realiza una aserción y se eleva mediante WebAuthn, viaja directamente desde el <strong>TPM (Intra-Structure)</strong> a través del <strong>API Gateway</strong> hacia el <strong>IdP</strong> que sincroniza los registros en base de datos.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BLUEPRINTS CAROUSEL CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6" id="catalog-carousel-view">
            
            {/* Combine mocked diagrams and any Firestore dynamic blueprints uploaded */}
            {(() => {
              const staticBlueprints: ArchitectureBlueprint[] = [
                {
                  id: 'bp-static-1',
                  title: '1. Arquitectura Resiliente: Síntesis del Modelo',
                  description: 'Análisis global de alta disponibilidad que unifica el Frontend Inteligente, la sincronización de estado y la Privacidad por Diseño bajo el estándar FIDO2.',
                  imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Integra la detección proactiva de hardware del cliente, orquestando una interfaz adaptativa. Centraliza el estado con los llaveros locales (Signal API) y excluye la información PII del backend usando LLaves Públicas (BLOBs) e identificadores correlacionales alternativos.',
                  uploadedBy: 'system@bunkercore.industrial',
                  timestamp: '2026-06-08T12:00:00Z'
                },
                {
                  id: 'bp-static-2',
                  title: '2. Accesibilidad y Protección Convergentes',
                  description: 'Diagrama de intersección de Venn que demuestra cómo la usabilidad y la máxima seguridad criptográfica coexisten sin compromisos dentro del ecosistema Passkey.',
                  imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'El Diseño Inclusivo (interfaz modular, carga cognitiva reducida, ayuda asistida) y la Defensa Criptográfica (Zero-shot identity, anti-phishing, mitigación de suplantación) confluyen para formar una experiencia de seguridad robusta e intuitiva.',
                  uploadedBy: 'security-expert@silosalfa.io',
                  timestamp: '2026-06-08T12:15:00Z'
                },
                {
                  id: 'bp-static-3',
                  title: '3. El Caso de Estudio: Ecosistema Digital de David Camacho',
                  description: 'Línea de tiempo detallada sobre la transición progresiva y el aumento sistemático de criticidad de datos en la identidad digital del usuario.',
                  imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Ilustra la escalada de la criticidad de la información, comenzando en Adobe Acrobat Pro (bajo), pasando por HBO Max (medio) e ingresando a un Punto Crítico en Google AI Pro & Drive (alto), donde FIDO2 ya no es un confort sino una exigencia ineludible.',
                  uploadedBy: 'david.camacho@bunkercore.industrial',
                  timestamp: '2026-06-08T12:30:00Z'
                },
                {
                  id: 'bp-static-4',
                  title: '4. Esquema de Base de Datos Resiliente',
                  description: 'Estructura relacional e inmutable de la Credentials_Table, diseñada sin rastros de Información de Identificación Personal (PII-free) bajo estándares WebAuthn.',
                  imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Almacena identificadores correlacionales con IDs de credencial Base64URL, claves públicas codificadas en formato binario (BLOB - unutilizable sin TPM), arrays de protocolos de transporte permitidos (USB, NFC, etc.) e indicadores de respaldo en la nube del OS.',
                  uploadedBy: 'db-architect@bunkercore.industrial',
                  timestamp: '2026-06-08T12:45:00Z'
                },
                {
                  id: 'bp-static-5',
                  title: '5. Validación de Backend: Las 3 Fases del Registro',
                  description: 'Arquitectura tripartita que muestra el procesamiento y validación asertiva de firmas criptográficas en el servidor.',
                  imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Fase 1: El servidor genera retos aleatorios sin almacenar PII. Fase 2: El motor valida firmas contra el cryptochallenge, rpId, UP y UV. Fase 3: Persistencia inmutable que mapea múltiples llaves por cuenta para evitar bloqueos del usuario.',
                  uploadedBy: 'security-expert@silosalfa.io',
                  timestamp: '2026-06-08T13:00:00Z'
                },
                {
                  id: 'bp-static-6',
                  title: '6. Matriz de Resolución: WebAuthn Signal API',
                  description: 'Protocolos de señalización activa y bidireccional entre el servidor y el gestor de contraseñas local/OS.',
                  imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Detalla el comportamiento de signalUnknownCredential para remover accesos rotos, signalCurrentUserDetails para consistencia visual de alias en el OS, y signalAllAcceptedCredentials para purgar llaveros locales de credenciales antiguas.',
                  uploadedBy: 'api-developer@silosalfa.io',
                  timestamp: '2026-06-08T13:15:00Z'
                },
                {
                  id: 'bp-static-7',
                  title: '7. El Desafío de la Desincronización',
                  description: 'Análisis detallado de fricción por llaves huérfanas desalineadas entre repositorios web y llaveros de sistemas operativos locales.',
                  imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Expone la ruptura del canal de confianza cuando se revoca una clave en el backend sin alertar al gestor local. El OS ofrece aserciones obsoletas que el host rechaza matemáticamente, requiriendo puentes estandarizados.',
                  uploadedBy: 'ops@bunkercore.industrial',
                  timestamp: '2026-06-08T13:30:00Z'
                },
                {
                  id: 'bp-static-8',
                  title: '8. El Ciclo de Vida de la Credencial Criptográfica',
                  description: 'Flujo secuencial continuo desde la creación, intercepción activa de errores y sustitución de IDs por alias amigables en el cliente.',
                  imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Describe la llamada register(), el mapeo robusto ante fallas como InvalidStateError (llave duplicada) o NotAllowedError (cancelación voluntaria) y la sustitución estética del AAGUID de hardware por nombres útiles.',
                  uploadedBy: 'frontend-lead@bunkercore.industrial',
                  timestamp: '2026-06-08T13:45:00Z'
                },
                {
                  id: 'bp-static-9',
                  title: '9. Detección Proactiva de Hardware y Conditional UI',
                  description: 'Árbol de decisión dinámico para renderizar interfaces de registro personalizadas de acuerdo con el soporte biométrico local.',
                  imageUrl: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Evalúa de forma proactiva window.PublicKeyCredential y la disponibilidad del autenticador de plataforma. Si existe hardware biométrico, despliega accesos fluidos de un solo toque; si falta, regresa de forma segura a flujos tradicionales.',
                  uploadedBy: 'ux-designer@silosalfa.io',
                  timestamp: '2026-06-08T14:00:00Z'
                },
                {
                  id: 'bp-static-10',
                  title: '10. Anatomía del Cliente: Single Page Application',
                  description: 'Arquitectura de pila de software optimizada en el lado del cliente (home.html) para máximo rendimiento táctil y cognitivo.',
                  imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=850',
                  technicalSummary: 'Nivel 1: Capa reactiva ultraliviana lit-html v2.6.1 sin redibujados innecesarios. Nivel 2: Interfaz Material Design (Framework MDUI) inclusiva. Nivel 3: DOM estructurado con portales aislados de ayuda, alias y listas.',
                  uploadedBy: 'system@bunkercore.industrial',
                  timestamp: '2026-06-08T14:15:00Z'
                }
              ];

              const allBlueprints = [...staticBlueprints, ...blueprints];

              // Safe index clamping
              const safeIndex = Math.min(currentSlideIndex, allBlueprints.length - 1);
              const activeSlide = allBlueprints[safeIndex >= 0 ? safeIndex : 0];

              if (!activeSlide) {
                return (
                  <div className="text-center py-12 text-slate-500 font-mono">
                    No hay planos disponibles. Crea uno en la sección "Compartir Plano".
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Image Viewer Header & Navigation buttons */}
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850/60">
                    <div className="font-sans">
                      <h4 className="font-bold text-slate-100">{activeSlide.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Subido por: <strong className="text-blue-400">{activeSlide.uploadedBy}</strong> &bull; {new Date(activeSlide.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[11px] font-mono text-slate-500 mr-2">
                        {safeIndex + 1} de {allBlueprints.length}
                      </span>
                      <button
                        disabled={safeIndex === 0}
                        onClick={() => setCurrentSlideIndex(p => p - 1)}
                        className="p-1.5 bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700/80 hover:text-white border border-slate-700 rounded-lg text-slate-300 cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        disabled={safeIndex === allBlueprints.length - 1}
                        onClick={() => setCurrentSlideIndex(p => p + 1)}
                        className="p-1.5 bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-800 hover:bg-slate-700/80 hover:text-white border border-slate-700 rounded-lg text-slate-300 cursor-pointer transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Split representation: Full Image + technical detail container */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Slide Photo Frame / Custom Interactive Live Panel */}
                    <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-850/60 overflow-hidden relative min-h-[385px] flex flex-col justify-between" id="active-slide-surface">
                      {activeSlide.id.startsWith('bp-static-') ? (
                        <div className="w-full h-full flex flex-col">
                          {renderInteractiveSlide(activeSlide.id)}
                        </div>
                      ) : (
                        <div className="w-full h-full relative group min-h-[385px]">
                          <img 
                            src={activeSlide.imageUrl} 
                            alt={activeSlide.title}
                            className="w-full h-full object-cover select-none absolute inset-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      
                      {activeSlide.id.startsWith('bp-static-') && (
                        <div className="absolute top-3 left-3 bg-[#0c1017]/90 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-md text-[8px] font-mono uppercase tracking-widest z-10 font-bold">
                          Interactive Live Module
                        </div>
                      )}
                    </div>

                    {/* Spec details sheet */}
                    <div className="lg:col-span-6 bg-[#0c0f14] p-5.5 rounded-2xl border border-slate-850/60 flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Declaración de Infraestructura</span>
                        <h3 className="text-base font-bold text-slate-200 mt-1">{activeSlide.title}</h3>
                        <p className="text-[12.5px] text-slate-300 leading-relaxed font-sans mt-2">{activeSlide.description}</p>
                        
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 border-dashed">
                          <span className="text-[10px] uppercase tracking-wider text-blue-400 font-mono block mb-1.5">Resumen Criptográfico y Operacional:</span>
                          <p className="text-[12px] text-slate-300 font-sans leading-relaxed">{activeSlide.technicalSummary}</p>
                        </div>
                      </div>

                      {/* Delete trigger for manually added blueprints */}
                      {!activeSlide.id.startsWith('bp-static-') && (
                        <div className="mt-5 pt-4 border-t border-slate-850 flex justify-end">
                          <button
                            onClick={() => {
                              onDeleteBlueprint(activeSlide.id);
                              setCurrentSlideIndex(0);
                            }}
                            className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 uppercase tracking-wider font-bold cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Plano</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 3: UPLOAD FORM FOR MORE USER SLIDES */}
        {activeTab === 'upload' && (
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 max-w-2xl mx-auto" id="blueprint-upload-stage">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 mb-2 font-mono">
              Registrar Nuevo Plano de Arquitectura
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mb-5">
              ¿Tienes más diagramas del ecosistema passkey, mallas de red o modelos de seguridad? Añádelos aquí. Se sincronizarán en tiempo real con Firestore.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              
              {formErrorMsg && (
                <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-3 rounded-xl font-mono text-[11px]">
                  {formErrorMsg}
                </div>
              )}

              {formSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl font-mono text-[11px]">
                  {formSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-semibold font-mono uppercase tracking-wider text-[10px]">Título del Plano *</label>
                  <input 
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. Modelo FIDO2 híbrido en nubes"
                    className="w-full bg-[#0a0d14] border border-slate-800/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/50 text-xs" 
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-semibold font-mono uppercase tracking-wider text-[10px]">URL de la Imagen (Diagrama)</label>
                  <input 
                    type="url" 
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    placeholder="URL del diagrama de red (o dejar en blanco para genérico)"
                    className="w-full bg-[#0a0d14] border border-slate-800/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/50 text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold font-mono uppercase tracking-wider text-[10px]">Breve Descripción *</label>
                <input 
                  type="text" 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Explica qué aspecto de la confianza cero ilustra este diagrama"
                  className="w-full bg-[#0a0d14] border border-slate-800/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500/50 text-xs" 
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold font-mono uppercase tracking-wider text-[10px]">Análisis Criptográfico detallado (Ficha Técnica) *</label>
                <textarea 
                  rows={4}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Detalla la secuencia de retos, flujos de datos, algoritmos (ES256, RS256, etc.), dependencias o aserciones de red."
                  className="w-full bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500/50 text-xs resize-none font-sans leading-relaxed" 
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-102 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar en Firestore</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

    </div>
  );
}
