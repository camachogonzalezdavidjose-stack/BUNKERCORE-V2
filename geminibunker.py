import os
import sys
from google import genai
from google.genai import types

if len(sys.argv) < 2:
    print("❌ Error: Debes pasar la ruta de un archivo. Ejemplo:")
    print("python geminibunker.py backend/routes/authRoutes.js")
    sys.exit(1)

archivo_codigo = sys.argv[1]

client = genai.Client()

contexto_bunker = """
Eres un Arquitecto de Software y Diseñador UX/UI experto en ciberseguridad, WebAuthn/FIDO2 y desarrollo moderno.
Tu objetivo es auditar y mejorar el proyecto 'BUNKERCORE-V2' (Termux, Node.js, Vite).
Reglas de análisis:
1. Si el archivo es Backend: Enfócate en criptografía robusta, manejo de retos (challenges), validación estricta y seguridad.
2. Si el archivo es Frontend/UI: Transfórmalo para que se vea 'super pro'. Aplica una estética limpia, oscura (Dark Mode avanzado), elementos visuales de alta seguridad (indicadores de estado de passkeys, transiciones suaves, feedback inmediato, diseño responsivo móvil).
Sé ultra directo, técnico y entrega el código listo para implementarse.
"""

if os.path.exists(archivo_codigo):
    with open(archivo_codigo, "r") as f:
        codigo_fuente = f.read()
else:
    print(f"❌ Archivo no encontrado: {archivo_codigo}")
    sys.exit(1)

pregunta = f"Audita este archivo ({archivo_codigo}). Si es backend, busca fallos o mejoras. Si es interfaz (UI), rediséñalo o mejóralo para que se vea premium y pro."

print(f"🤖 Analizando {archivo_codigo} con BUNKER-AI...")

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[f"Código fuente:\n\n{codigo_fuente}\n\nAcción: {pregunta}"],
    config=types.GenerateContentConfig(
        system_instruction=contexto_bunker,
        temperature=0.2,
    )
)

print("\n[BUNKER-AI]:")
print(response.text)
