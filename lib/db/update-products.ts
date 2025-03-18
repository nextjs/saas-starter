import { stripe } from "../payments/stripe";

async function updateStripeProducts() {
  console.log("Actualizando productos y precios en Stripe...");

  try {
    // Obtener todos los productos activos
    const products = await stripe.products.list({
      active: true,
    });

    console.log(`Encontrados ${products.data.length} productos activos`);

    // Para cada producto, obtener y actualizar sus precios
    for (const product of products.data) {
      console.log(`Procesando producto: ${product.name} (${product.id})`);

      // Obtener los precios actuales del producto
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      console.log(`  - Encontrados ${prices.data.length} precios activos`);

      // Para cada precio, crear uno nuevo sin período de prueba
      for (const price of prices.data) {
        // Verificar si tiene período de prueba
        if (price.recurring?.trial_period_days) {
          console.log(
            `  - Precio ${price.id} tiene período de prueba de ${price.recurring.trial_period_days} días`
          );

          try {
            // Crear un nuevo precio sin período de prueba
            const newPrice = await stripe.prices.create({
              product: product.id,
              unit_amount: price.unit_amount ?? 0,
              currency: price.currency,
              recurring: {
                interval: price.recurring.interval as
                  | "day"
                  | "week"
                  | "month"
                  | "year",
              },
            });

            console.log(
              `  - Creado nuevo precio ${newPrice.id} sin período de prueba`
            );

            // Desactivar el precio anterior
            await stripe.prices.update(price.id, {
              active: false,
            });

            console.log(`  - Desactivado precio anterior ${price.id}`);
          } catch (error) {
            console.error(`  - Error al procesar precio ${price.id}:`, error);
          }
        } else {
          console.log(
            `  - Precio ${price.id} no tiene período de prueba, no requiere cambios`
          );
        }
      }
    }

    console.log("Actualización de productos y precios completada con éxito");
  } catch (error) {
    console.error("Error al actualizar productos y precios:", error);
    throw error;
  }
}

// Ejecutar la función principal
updateStripeProducts()
  .catch((error) => {
    console.error("Error en el proceso:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Proceso finalizado. Saliendo...");
    process.exit(0);
  });
