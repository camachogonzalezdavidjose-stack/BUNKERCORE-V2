"use client";

import { useState } from "react";
import Link from "next/link";

export default function BunkerCoreV2Auth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterPasskey = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando registro de Passkey...");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "20px" }}>
      <div style={{ flex: 1, width: "100%", maxWidth: "400px", margin: "0 auto", textAlign: "center", paddingTop: "40px" }}>
        <h1>BUNKERCORE-V2</h1>
        <p>Gestión de Identidad Digital Descentralizada</p>
        
        <div style={{ marginTop: "24px" }}>
          <button 
            suppressHydrationWarning
            onClick={handleRegisterPasskey}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            {isLoading ? "Procesando..." : "Registrar este Dispositivo (Passkey)"}
          </button>
        </div>
      </div>

      {/* Footer requerido por Google Trust & Safety */}
      <footer style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid #eaeaea", width: "100%" }}>
        <Link href="/privacy" style={{ color: "#0070f3", textDecoration: "none", fontSize: "14px" }}>
          Política de Privacidad
        </Link>
      </footer>
    </main>
  );
}
