'use client'

import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useActionState } from 'react'
import { TeamDataWithMembers, User } from '@/lib/db/schema'
import { removeTeamMember } from '@/app/(login)/actions'
import { InviteTeamMember } from './invite-team'
import Link from 'next/link'

type ActionState = {
  error?: string
  success?: string
}

export function Settings({
  teamData,
}: {
  teamData: TeamDataWithMembers
}) {
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, { error: '', success: '' })

  const getUserDisplayName = (
    user: Pick<User, 'id' | 'name' | 'email'>
  ) => {
    return user.name || user.email || 'Unknown User'
  }
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Team Settings
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {teamData.teamMembers.map((member, index) => (
              <li
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32`}
                      alt={getUserDisplayName(member.user)}
                    />
                    <AvatarFallback>
                      {getUserDisplayName(member.user)
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {getUserDisplayName(member.user)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
                {index > 1 ? (
                  <form action={removeAction}>
                    <input
                      type="hidden"
                      name="memberId"
                      value={member.id}
                    />
                    <Button
                      type="submit"
                      variant="outline"
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
            <p className="text-red-500 mt-4">{removeState.error}</p>
          )}
        </CardContent>
      </Card>
      <CardContent>
        <Link href="/dashboard/billing">
          <Button type="submit" variant="outline">
            Manage Billing
          </Button>
        </Link>
      </CardContent>
      <InviteTeamMember />
    </section>
  )
}
