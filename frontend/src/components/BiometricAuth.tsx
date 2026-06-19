import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, KeyRound, Check, Sparkles, Terminal, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../types';

interface WebAuthnCred {
  id: string;
  name: string;
  created: string;
  algo: string;
  publicKey: string;
  transports: string[];
}

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface BiometricAuthProps {
  currentUser: string;
  currentRole: Role;
  onLogAction: (action: string, details: string, severity: 'info' | 'warning' | 'critical') => void;
  onWebAuthnVerifySuccess: () => void;
  isEscalated: boolean;
}

export default function BiometricAuth({
  currentUser,
  currentRole,
  onLogAction,
  onWebAuthnVerifySuccess,
  isEscalated,
}: BiometricAuthProps) {
  const [credentials, setCredentials] = useState<WebAuthnCred[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'prompt' | 'scanning' | 'success'>('idle');
  const [verifyStep, setVerifyStep] = useState<'idle' | 'prompt' | 'scanning' | 'success'>('idle');
  const [tempCredName, setTempCredName] = useState('Mi Dispositivo Seguro');

  const username = currentUser || "operator@bunkercore.local";

  // Trigger registration flow
  const handleStartRegister = () => {
    setIsRegistering(true);
    setScanStep('prompt');
  };

  const handleSimulateScanRegister = async () => {
    setScanStep('scanning');
    
    try {
      // 1. GET registration options from Express server
      const resp = await fetch('/api/webauthn/register/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const optionsJSON = await resp.json();

      if (optionsJSON.error) {
        throw new Error(optionsJSON.error);
      }

      // 2. Pass options to the browser's WebAuthn API
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON });
      } catch (error) {
        throw new Error('WebAuthn creation failed or cancelled.');
      }

      // 3. Send response back to Express server to verify
      const verificationResp = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          response: attResp,
        }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        const newCred: WebAuthnCred = {
          id: attResp.id,
          name: tempCredName || 'Hardware Passkey',
          created: new Date().toISOString(),
          algo: "ES256 / FIDO2",
          publicKey: "Oculto en servidor Express",
          transports: attResp.response.transports || ["internal"]
        };

        setCredentials(prev => [...prev, newCred]);
        setScanStep('success');
        onLogAction("WEBAUTHN_REGISTRATION", `Real WebAuthn Passkey registrada: ${attResp.id} en Bunkercore Express Server`, 'info');

        setTimeout(() => {
          setIsRegistering(false);
          setScanStep('idle');
          setTempCredName('Mi Dispositivo Seguro');
        }, 1500);
      } else {
        throw new Error(verificationJSON.error || 'Server validation failed');
      }
    } catch (err: any) {
      console.error(err);
      onLogAction("WEBAUTHN_ERROR", `Falló registro biométrico real: ${err.message}`, 'warning');
      setIsRegistering(false);
      setScanStep('idle');
    }
  };

  // Trigger verify/escalation flow
  const handleStartVerify = () => {
    setIsVerifying(true);
    setVerifyStep('prompt');
  };

  const handleSimulateScanVerify = async () => {
    setVerifyStep('scanning');

    try {
      // 1. GET authentication options from Express server
      const resp = await fetch('/api/webauthn/auth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const optionsJSON = await resp.json();

      if (optionsJSON.error) {
         throw new Error(optionsJSON.error);
      }

      // 2. Pass to the browser's WebAuthn API
      let asseResp;
      try {
        asseResp = await startAuthentication({ optionsJSON });
      } catch (error) {
        throw new Error('WebAuthn assertion failed or cancelled.');
      }

      // 3. Send back to Express Server for verification
      const verificationResp = await fetch('/api/webauthn/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          response: asseResp,
        }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        setVerifyStep('success');
        onWebAuthnVerifySuccess();
        onLogAction("WEBAUTHN_VERIFICATION", `Real Passkey Assertion confirmada por el Servidor Express. Privilegio Elevado Zero-Trust.`, 'info');

        setTimeout(() => {
          setIsVerifying(false);
          setVerifyStep('idle');
        }, 1500);
      } else {
        throw new Error(verificationJSON.error || 'Server assertion validation failed');
      }
    } catch (err: any) {
      console.error(err);
      onLogAction("WEBAUTHN_ERROR", `Falló verificación biométrica: ${err.message}. Revise si el Passkey está registrado.`, 'warning');
      setIsVerifying(false);
      setVerifyStep('idle');
    }
  };

  return (
    <div className="bg-[#0d1117]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden" id="auth-panel">
      {/* Background radial highlight */}
      <div className="absolute right-0 top-0 -mt-12 -mr-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Fingerprint className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-1.5 uppercase tracking-wide text-xs">
              Identidad Criptográfica WebAuthn
              <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-mono">FIDO2</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Firmas de desafío local y resguardo biométrico sin contraseñas.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Right or Left side: Credentials list */}
        <div className="space-y-3.5" id="webauthn-cred-list">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>LLAVES REGISTRADAS ({credentials.length})</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-mono leading-none">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> hardware-backed
            </span>
          </div>

          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
            {credentials.map((cred) => (
              <div key={cred.id} className="p-3 bg-[#0a0c10]/40 border border-slate-800/80 rounded-xl flex flex-col gap-1.5 text-[11px] hover:border-slate-700 transition-all font-sans">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-medium text-slate-200 truncate max-w-[150px]">{cred.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800/40">{cred.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400 border-t border-slate-800/40 pt-1.5">
                  <div>Algoritmo: <span className="font-mono text-slate-300">{cred.algo}</span></div>
                  <div>Transports: <span className="font-mono text-slate-300">[{cred.transports.join(', ')}]</span></div>
                  <div className="col-span-2 text-[9px] font-mono truncate text-slate-500 mt-0.5">
                    PK SPKI: <span className="text-blue-500/80">{cred.publicKey}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Registration Trigger */}
          <button
            onClick={handleStartRegister}
            className="w-full text-xs font-semibold py-2.5 px-3 border border-slate-800 hover:border-blue-500/50 bg-[#090b0f] hover:bg-[#0d1117] text-slate-300 hover:text-blue-400 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 mt-2 cursor-pointer font-sans"
            id="register-webauthn-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Enrolar Nuevo Dispositivo Biométrico
          </button>
        </div>

        {/* Dynamic Verification / Zero Trust Panel */}
        <div className="bg-[#090b0f] border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between font-sans" id="zero-trust-challenge-box">
          <div>
            <div className="flex justify-between items-start mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desafío Zero-Trust</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${isEscalated ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-amber-950/40 text-amber-400 border-amber-800/40'}`}>
                {isEscalated ? 'Autorización Activa' : 'Firma Pendiente'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 md:mb-4 leading-relaxed font-sans">
              Las operaciones sensibles (como mermas de alto valor o despliegues productivos) siguen una política estricta de firma criptográfica mediante desafío WebAuthn sobre el navegador.
            </p>
          </div>

          <div className="p-3 bg-[#0c0e12] rounded-xl border border-slate-800/60 mb-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-300 font-mono text-[10px]">Payload Desafío SHA-256</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isEscalated ? 'Firmado: sig_d39a3f2d2b' : 'Firma pendiente: md5_auth_99f2a0'}
                </span>
              </div>
              <ShieldCheck className={`w-5.5 h-5.5 ${isEscalated ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-slate-600'}`} />
            </div>
          </div>

          <button
            onClick={handleStartVerify}
            disabled={isEscalated}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
              isEscalated 
                ? 'bg-slate-900/60 text-slate-500 border border-slate-800/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 active:translate-y-[1px]'
            }`}
            id="sign-challenge-btn"
          >
            <Fingerprint className="w-4 h-4" />
            {isEscalated ? 'Desafío Criptográfico Completado' : 'Firmar Desafío Biométrico'}
          </button>
        </div>
      </div>

      {/* REGISTRATION MODAL/OVERLAY */}
      <AnimatePresence>
        {isRegistering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#07090c]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-10 font-sans"
          >
            {scanStep === 'prompt' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-sm text-center space-y-4 animate-fadeIn"
              >
                <div 
                  onClick={handleSimulateScanRegister}
                  className="w-16 h-16 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/25 hover:border-blue-400/40 transition-all cursor-pointer group"
                  title="Presione la huella para activar el sensor de inmediato"
                >
                  <Fingerprint className="w-8 h-8 animate-pulse group-hover:scale-110 transition-transform text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-100">Enrolar Dispositivo WebAuthn</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Se solicitará a su sistema operativo la firma con clave segura, PIN, reconocimiento facial o TouchID física de Windows Hello (La Hella).
                  </p>
                </div>
                <div>
                  <input 
                    type="text" 
                    value={tempCredName}
                    onChange={(e) => setTempCredName(e.target.value)}
                    placeholder="Nombre del dispositivo" 
                    className="w-full text-xs bg-[#0c0e12] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-sans"
                  />
                </div>
                
                <div className="text-[10px] text-slate-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 leading-relaxed font-sans text-left flex items-start gap-2 max-w-sm shadow-xl shadow-black/40">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Soporte de Sensor Físico:</strong> El sandbox del iframe de edición puede restringir el acceso al lector físico. Si su lector no se activa al iniciar, abra la vista en una pestaña nueva mediante la URL superior para habilitar el sensor real nativo de su dispositivo.
                  </span>
                </div>

                <div className="flex gap-2 justify-center pt-1.5">
                  <button 
                    onClick={() => setIsRegistering(false)} 
                    className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSimulateScanRegister}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all active:translate-y-[1px]"
                  >
                    Iniciar Enrolamiento / Activar Sensor
                  </button>
                </div>
              </motion.div>
            )}

            {scanStep === 'scanning' && (
              <div className="text-center space-y-4">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 bg-blue-500/15 text-blue-400 rounded-full flex items-center justify-center border border-blue-500/40"
                  >
                    <Fingerprint className="w-12 h-12" />
                  </motion.div>
                  {/* Glowing sensor scanning animation */}
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-lg shadow-blue-500/55"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200 animate-pulse">Invocando FIDO2 WebAuthn API...</h4>
                  <p className="text-[10px] text-slate-500 font-mono">navigator.credentials.create()</p>
                </div>
              </div>
            )}

            {scanStep === 'success' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-3"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">¡Dispositivo Registrado!</h4>
                  <p className="text-xs text-emerald-400 font-medium font-sans">Clave guardada y sincronizada</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VERIFICATION MODAL/OVERLAY */}
      <AnimatePresence>
        {isVerifying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#07090c]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-10 font-sans"
          >
            {verifyStep === 'prompt' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-sm text-center space-y-4 animate-fadeIn"
              >
                <div 
                  onClick={handleSimulateScanVerify}
                  className="w-16 h-16 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/25 hover:border-emerald-400/40 transition-all cursor-pointer group"
                  title="Presione la huella para firmar de inmediato"
                >
                  <Fingerprint className="w-8 h-8 animate-pulse text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-100">Firmar Desafío Criptográfico</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Se enviará un desafío de un solo uso para verificar que posee esta biometría de Windows Hello / TouchID / FaceID de verdad. Puede presionar la huella biométrica grande de arriba.
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 leading-relaxed font-sans text-left flex items-start gap-2 max-w-sm shadow-xl shadow-black/40">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Soporte de Sensor Físico:</strong> El sandbox del iframe de edición puede restringir el acceso al lector físico. Si su lector no se activa al iniciar, abra el sitio en una pestaña nueva mediante la URL superior para habilitar el sensor real nativo de su dispositivo.
                  </span>
                </div>

                <div className="flex gap-2 justify-center pt-1.5">
                  <button 
                    onClick={() => setIsVerifying(false)} 
                    className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Salir
                  </button>
                  <button 
                    onClick={handleSimulateScanVerify}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all active:translate-y-[1px]"
                  >
                    Confirmar con Lector / Activar Sensor
                  </button>
                </div>
              </motion.div>
            )}

            {verifyStep === 'scanning' && (
              <div className="text-center space-y-5">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30"
                  >
                    <Fingerprint className="w-12 h-12" />
                  </motion.div>
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-0.5 bg-emerald-450 shadow-lg shadow-emerald-500/55"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200 animate-pulse">Solicitando Autenticación Remota...</h4>
                  <p className="text-[10px] text-slate-500 font-mono">navigator.credentials.get()</p>
                </div>
              </div>
            )}

            {verifyStep === 'success' && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-3"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Firma Verificada</h4>
                  <p className="text-xs text-emerald-400 font-medium font-sans">Asignación Zero-Trust Completada</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
