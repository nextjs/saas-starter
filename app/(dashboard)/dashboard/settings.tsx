'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember } from '@/app/login/actions';
import { useSearchParams } from 'next/navigation';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  const searchParams = useSearchParams();
  const showSubscriptionAlert = searchParams.get('subscription') === 'required';
  
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, { error: '', success: '' });

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  const getUserInitials = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    const displayName = getUserDisplayName(user);
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl lg:text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>
      
      {showSubscriptionAlert && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 shadow-sm flex items-start">
          <div className="flex-shrink-0 rounded-full bg-amber-100 p-1 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Premium feature access required</p>
            <p className="text-sm mt-1">You need an active subscription to access premium features. Please upgrade your plan below.</p>
          </div>
        </div>
      )}
      
      <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden bg-white py-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-6 rounded-t-2xl m-0">
          <CardTitle className="text-white font-semibold flex items-center">
            Account Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-semibold text-gray-900 text-lg">
                  Current Plan: <span className="text-teal-600">{teamData.planName || 'Free'}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {teamData.subscriptionStatus === 'active'
                    ? (teamData.planName === 'Base'
                        ? 'Billed weekly'
                        : teamData.planName === 'Master'
                          ? 'Billed quarterly'
                          : 'Billed monthly')
                    : teamData.subscriptionStatus === 'trialing'
                      ? 'Trial period'
                      : 'No active subscription'}
                </p>
              </div>
              <form action={customerPortalAction}>
                <Button 
                  type="submit" 
                  className="rounded-lg px-5 text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 shadow-md"
                >
                  Manage Subscription
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white py-0">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-6 rounded-t-2xl m-0">
          <CardTitle className="text-white font-semibold flex items-center">
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-6">
            {teamData.teamMembers.map((member, index) => (
              <li key={member.id} className={`flex items-center justify-between ${index > 0 ? 'pt-6 border-t border-gray-100' : ''}`}>
                <div className="flex items-center space-x-4">
                  <Avatar className="border-2 border-white shadow-md h-14 w-14 bg-gradient-to-r from-blue-100 to-teal-100">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32`}
                      alt={getUserDisplayName(member.user)}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-100 to-teal-100 text-teal-800 font-semibold text-lg">
                      {getUserInitials(member.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {getUserDisplayName(member.user)}
                    </p>
                    <div className="text-sm text-teal-600 font-medium bg-teal-50 px-3 py-1 rounded-full inline-block mt-1">
                      {member.role}
                    </div>
                  </div>
                </div>
                {index > 1 ? (
                  <form action={removeAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button
                      type="submit"
                      className="rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                      size="sm"
                      disabled={isRemovePending}
                    >
                      {isRemovePending ? 'Removing...' : 'Remove'}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {removeState?.error && (
            <p className="text-red-500 mt-6 p-4 bg-red-50 rounded-lg border border-red-100">{removeState.error}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
