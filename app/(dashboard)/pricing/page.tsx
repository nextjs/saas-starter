import { checkoutAction } from "@/lib/payments/actions";
import { Check, AlertTriangle } from "lucide-react";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { SubmitButton } from "./submit-button";
import { getUser } from "@/lib/db/queries";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [prices, products, user] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
    getUser(),
  ]);

  // NO redirigimos aquí para evitar bucle infinito
  // Simplemente verificamos si el usuario necesita suscripción
  const needsSubscription =
    user &&
    (!user.subscriptionStatus ||
      !["active", "trialing"].includes(user.subscriptionStatus));

  const hasActiveSubscription =
    user?.subscriptionStatus &&
    ["active", "trialing"].includes(user.subscriptionStatus || "");

  // Comprobar si se ha especificado un producto en la URL
  const targetProductId = searchParams.productId as string;
  const targetPriceId = searchParams.priceId as string;

  // Mostramos todos los productos disponibles en lugar de solo buscar Iniciacion y Plus
  // Así podemos ver todos los productos que existen en Stripe
  console.log(
    "Productos disponibles:",
    products.map((p) => ({ id: p.id, name: p.name }))
  );
  console.log(
    "Precios disponibles:",
    prices.map((p) => ({ id: p.id, productId: p.productId }))
  );

  // Filtrar productos si se especifica un ID en la URL
  const displayProducts = targetProductId
    ? products.filter((p) => p.id === targetProductId)
    : products;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {needsSubscription && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-semibold text-orange-800 mb-2">
                Acceso restringido
              </h3>
              <p className="text-orange-700 mb-2">
                Tu cuenta no tiene una suscripción activa. Necesitas adquirir
                una suscripción para acceder a todas las funcionalidades de la
                plataforma.
              </p>
              <p className="text-orange-700 font-medium">
                Selecciona un plan a continuación para continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasActiveSubscription && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-lg">
          <div className="flex items-start">
            <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Suscripción activa
              </h3>
              <p className="text-green-700 mb-2">
                Ya tienes una suscripción activa. Puedes disfrutar de todas las
                funcionalidades.
              </p>
              <a
                href="/dashboard"
                className="text-green-700 font-medium underline"
              >
                Ir al dashboard
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/pricing"
            className={`px-4 py-2 rounded-lg ${
              !targetProductId
                ? "bg-orange-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Todos los planes
          </a>

          {products.map((product) => (
            <a
              key={product.id}
              href={`/pricing?productId=${product.id}`}
              className={`px-4 py-2 rounded-lg ${
                targetProductId === product.id
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {product.name}
            </a>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {displayProducts.map((product) => {
          // Buscar el precio para este producto
          let productPrice;

          // Si se especificó un priceId y coincide con un producto, usamos ese
          if (targetPriceId && targetProductId === product.id) {
            productPrice =
              prices.find((price) => price.id === targetPriceId) ||
              prices.find((price) => price.productId === product.id);
          } else {
            productPrice = prices.find(
              (price) => price.productId === product.id
            );
          }

          return (
            <PricingCard
              key={product.id}
              name={product.name}
              price={productPrice?.unitAmount || 0}
              interval={productPrice?.interval || "month"}
              features={[
                "Acceso completo a todas las funciones",
                "Soporte por email",
                "Actualizaciones gratuitas",
              ]}
              priceId={productPrice?.id}
              disabled={hasActiveSubscription || false}
              highlighted={product.id === targetProductId}
            />
          );
        })}
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  features,
  priceId,
  disabled = false,
  highlighted = false,
}: {
  name: string;
  price: number;
  interval: string;
  features: string[];
  priceId?: string;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`pt-6 ${
        highlighted ? "border-2 border-orange-500 rounded-lg p-4" : ""
      }`}
    >
      {highlighted && (
        <div className="bg-orange-500 text-white text-center py-1 px-2 rounded-t-lg mb-2">
          Plan recomendado
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>

      <p className="text-4xl font-medium text-gray-900 mb-6">
        {price / 100}€{" "}
        <span className="text-xl font-normal text-gray-600">/ mes</span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      {!disabled && (
        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton />
        </form>
      )}
      {disabled && (
        <div className="text-center py-4 text-gray-500">
          Ya tienes una suscripción activa
        </div>
      )}
    </div>
  );
}
