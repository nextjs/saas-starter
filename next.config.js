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
  // Deshabilitar la salida standalone para evitar problemas con trazado de archivos
  output: undefined,
};

module.exports = nextConfig;
