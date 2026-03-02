import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Workspace } from "@prisma/client";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown;
};

type ValidatedActionFunction<S extends z.ZodType, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }
    return action(result.data, formData);
  };
}

type ActionWithWorkspaceFunction<T> = (
  formData: FormData,
  workspace: Workspace
) => Promise<T>;

export function withWorkspace<T>(action: ActionWithWorkspaceFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
    }

    // Use the first workspace the user belongs to
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    });

    if (!membership) {
      throw new Error("Workspace not found");
    }

    return action(formData, membership.workspace);
  };
}
