"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel de Control</h1>
      <p className="mb-6">
        Bienvenido a tu panel de control. Elige una opción:
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/general"
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="font-medium text-lg mb-2">General</h2>
          <p className="text-gray-600">
            Gestiona tu perfil y configuraciones personales
          </p>
        </Link>

        <Link
          href="/dashboard/security"
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="font-medium text-lg mb-2">Seguridad</h2>
          <p className="text-gray-600">
            Actualiza tu contraseña y preferencias de seguridad
          </p>
        </Link>

        <Link
          href="/dashboard/activity"
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="font-medium text-lg mb-2">Actividad</h2>
          <p className="text-gray-600">
            Revisa el historial de actividad de tu cuenta
          </p>
        </Link>
      </div>
    </div>
  );
}
