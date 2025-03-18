import { redirect } from "next/navigation";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";

// Definiendo el tipo directamente sin depender de PageProps
export default async function SelectProductPage(props: {
  params: { productId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { params, searchParams = {} } = props;
  const { productId } = params;
  const priceId = searchParams.priceId as string;

  // Si se proporciona un ID de precio específico, lo usamos directamente
  if (priceId) {
    redirect(`/pricing?productId=${productId}&priceId=${priceId}`);
  }

  // Si no hay priceId específico, obtenemos el priceId predeterminado para este producto
  if (!priceId) {
    const [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts(),
    ]);

    const selectedProduct = products.find((p) => p.id === productId);

    if (selectedProduct) {
      const productPrice = prices.find(
        (price) => price.productId === selectedProduct.id
      );

      if (productPrice?.id) {
        redirect(`/pricing?productId=${productId}&priceId=${productPrice.id}`);
      }
    }
  }

  // Por defecto, solo redirigimos con productId
  redirect(`/pricing?productId=${productId}`);
}
