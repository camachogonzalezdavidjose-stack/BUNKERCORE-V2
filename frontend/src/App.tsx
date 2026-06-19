import React, { useState, useEffect } from "react";
import { Fingerprint, LogOut, User as UserIcon } from 'lucide-react';
import { auth, signInWithGoogle } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (window as any).onSubmit = async (token: string) => {
      const usernameInput = (document.getElementById("username") as HTMLInputElement)?.value;
      const finalUsername = usernameInput || (user ? user.email : "");

      if (!finalUsername) {
        alert("Por favor, introduce un alias o inicia sesión con Google.");
        if ((window as any).grecaptcha) (window as any).grecaptcha.reset();
        return;
      }

      try {
        const response = await fetch("/api/webauthn/register/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: finalUsername,
            recaptchaToken: token 
          })
        });

        const options = await response.json();

        if (options.error) {
          alert("Fallo de seguridad: " + options.error);
          if ((window as any).grecaptcha) (window as any).grecaptcha.reset();
          return;
        }

        console.log("Reto FIDO2 recibido:", options);
        alert("¡Verificación Humana Pasada! Reto FIDO2 listo para enrolar.");

      } catch (err) {
        console.error("Error:", err);
        if ((window as any).grecaptcha) (window as any).grecaptcha.reset();
      }
    };
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Error al iniciar sesión con Google");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-mono">Cargando...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">BUNKERCORE-V2</h2>
          <p className="text-sm text-zinc-400 mt-1">Identity Provider & Biometric Gateway</p>
        </div>

        {user ? (
          <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-700" />
              ) : (
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate max-w-[180px]">{user.displayName || "Usuario"}</span>
                <span className="text-xs text-zinc-500 truncate max-w-[180px]">{user.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-black font-semibold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continuar con Google
          </button>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-900 px-2 text-zinc-500">O usar alias</span></div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Identidad de Usuario</label>
          <input 
            id="username"
            type="text" 
            defaultValue={user ? (user.email || "") : ""}
            placeholder="Introduce tu alias o correo" 
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:outline-none focus:border-blue-500 text-white transition-all"
          />
        </div>

        <button 
          className="g-recaptcha w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          data-sitekey="6LeZj-osAAAAAIuCLYuLTQOn3SxIeLDOHOBNdd0Y"
          data-callback="onSubmit"
          data-action="submit"
        >
          <Fingerprint size={20} />
          Enrolar Llave Criptográfica
        </button>
      </div>
    </div>
  );
}
