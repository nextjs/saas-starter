/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nodeMiddleware: true,
    // Ajustes adicionales para versión canaria
    serverComponentsExternalPackages: [],
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Configuración para manejo correcto de módulos
  transpilePackages: ["lucide-react"],
  // Configuración recomendada para Vercel
  output: "standalone",
};

module.exports = nextConfig;
