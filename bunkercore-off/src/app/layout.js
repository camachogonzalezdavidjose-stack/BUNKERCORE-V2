export const metadata = {
  title: 'BunkerCore V2',
  description: 'Sistema de Autenticación de Alta Seguridad',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
