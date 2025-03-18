import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import Link from "next/link";

export default async function AdminPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Productos disponibles</h2>
        <p className="mb-4">
          Selecciona un producto para ir directamente a su página de precios:
        </p>

        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{product.name}</span>
                <Link
                  href={`/pricing/select-product/${product.id}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  Seleccionar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
