"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { User } from "@/lib/db/schema";

export function Settings({ userData }: { userData: User }) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bienvenido de nuevo {userData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Plan actual: {userData.planName || "Gratuito"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData.subscriptionStatus === "active"
                    ? "Facturación mensual"
                    : "Sin suscripción activa"}
                </p>
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Gestionar suscripción
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
