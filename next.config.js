/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nodeMiddleware: true,
    // Optimización de importaciones
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Paquetes externos del servidor (nueva ubicación)
  serverExternalPackages: [],
  // Configuración para manejo correcto de módulos
  transpilePackages: ["lucide-react"],
  // Omitiendo la opción output para usar el comportamiento por defecto
  // Esto evita problemas con el trazado de archivos
};

module.exports = nextConfig;
