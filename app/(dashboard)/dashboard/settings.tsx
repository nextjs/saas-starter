"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { useActionState } from "react";
import { User } from "@/lib/db/schema";

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ userData }: { userData: User }) {
  const getUserDisplayName = (user: Pick<User, "id" | "name" | "email">) => {
    return user.name || user.email || "Usuario desconocido";
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Mis ajustes</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mi suscripción</CardTitle>
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
                    : userData.subscriptionStatus === "trialing"
                    ? "Suscripción activa"
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={`/placeholder.svg?height=32&width=32`}
                alt={getUserDisplayName(userData)}
              />
              <AvatarFallback>
                {getUserDisplayName(userData)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getUserDisplayName(userData)}</p>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
