//<file path="lib/auth/middleware.ts">
import { z } from 'zod';
import { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
    data: z.infer<S>,
    formData?: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData?: FormData) => {
    const dataToParse = formData ? Object.fromEntries(formData) : {};
    const result = schema.safeParse(dataToParse);

    if (!result.success) {
      const issues = result.error.issues;
      if (issues && issues.length > 0) {
        return { error: issues[0].message };
      }
      return { error: "An unknown validation error occurred." };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
    data: z.infer<S>,
    user: User,
    formData?: FormData
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
    schema: S,
    action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData?: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const dataToParse = formData ? Object.fromEntries(formData) : {};
    const result = schema.safeParse(dataToParse);

    if (!result.success) {
      const issues = result.error.issues;
      if (issues && issues.length > 0) {
        return { error: issues[0].message };
      }
      return { error: "An unknown validation error occurred." };
    }

    return action(result.data, user, formData);
  };
}