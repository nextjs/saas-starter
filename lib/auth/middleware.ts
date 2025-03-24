import { z } from 'zod';
import { TeamDataWithMembers } from '@/types/team';
// import { getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { getUser } from '@/utils/supabase/server';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      // This redirect will throw an error, so we don't need to return anything after it
      redirect('/sign-in');
    }

    const team = {
      id: 1, // Replace with actual logic to get the team for the user
      name: "My Team", // Replace with actual team name
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: null,
      members: [
        {
          id: 1,
          userId: parseInt(user.id),
          role: "admin",
          user: {
            id: parseInt(user.id),
            name: user.user_metadata?.name || null,
            email: user.email || ""
          }
        }
      ]
    }
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}
