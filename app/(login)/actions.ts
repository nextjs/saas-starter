'use server';

import { createClient } from "@/utils/supabase/server";
import { z } from 'zod';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  message?: string;
  [key: string]: any; // This allows for additional properties
};

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export async function signIn(prevState: ActionState, formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const { email, password } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  console.log(`User signed in successfully: ${email}`);
  redirect('/dashboard');
}

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

export async function signUp(prevState: ActionState, formData: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error };
  }

  const { email, password } = result.data;
  console.log(`Parsed signUp data: email=${email}`);
  const supabase = await createClient();

  // Check if user already exists
  const { data: existingUsers, error: lookupError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  console.log(`Existing users lookup: ${JSON.stringify(existingUsers)}`); // Debugging line

  // if (lookupError) {
  //   return { error: `Error checking for existing user: ${lookupError.message}`, email, password };
  // }

  // if (existingUsers && existingUsers.length > 0) {
  //   return { error: 'User with this email already exists', email, password };
  // }

  // // Create the user in Supabase Auth
  // const { data, error } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     data: {
  //       email,
  //     },
  //   },
  // });

  // if (error) {
  //   return { error: `Failed to create user: ${error.message}`, email, password };
  // }

  // console.log('Redirecting to dashboard');
  // redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function updatePassword(prevState: ActionState, formData: FormData) {
  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { currentPassword, newPassword } = result.data;
  const supabase = await createClient();

  // First verify the current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email || '',
    password: currentPassword,
  });

  if (signInError) {
    return { error: 'Current password is incorrect.' };
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: `Failed to update password: ${error.message}` };
  }

  console.log('Password updated successfully');
  return { success: 'Password updated successfully' };
}

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export async function deleteAccount(prevState: ActionState, formData: FormData) {
  const result = deleteAccountSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { password } = result.data;
  const supabase = await createClient();

  // First verify the password by attempting to sign in
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: 'User not authenticated' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email || '',
    password,
  });

  if (signInError) {
    return { error: 'Incorrect password. Account deletion failed.' };
  }

  // Since we can't directly delete a user from the client side (admin API requires server-side admin key),
  // we'll mark the account for deletion by updating user metadata
  const { error } = await supabase.auth.updateUser({
    data: {
      deleted: true,
      deletedAt: new Date().toISOString()
    }
  });

  if (error) {
    return { error: `Failed to mark account for deletion: ${error.message}` };
  }

  // Sign out the user
  await supabase.auth.signOut();
  redirect('/sign-in');
}

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export async function updateAccount(prevState: ActionState, formData: FormData) {
  const result = updateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    email,
    data: { name }
  });

  if (error) {
    return { error: `Failed to update account: ${error.message}` };
  }

  console.log('Account updated successfully');
  return { success: 'Account updated successfully' };
}

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export async function removeTeamMember(prevState: ActionState, formData: FormData) {
  const result = removeTeamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { memberId } = result.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    return { error: `Failed to remove team member: ${error.message}` };
  }

  console.log('Team member removed successfully');
  return { success: 'Team member removed successfully' };
}

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export async function inviteTeamMember(prevState: ActionState, formData: FormData) {
  const result = inviteTeamMemberSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { email, role } = result.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      role,
    });

  if (error) {
    return { error: `Failed to invite team member: ${error.message}` };
  }

  console.log('Invitation sent successfully');
  return { success: 'Invitation sent successfully' };
}
