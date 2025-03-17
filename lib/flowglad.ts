import { FlowgladServer } from '@flowglad/nextjs/server'
import { getUser, getUserWithTeam } from '@/lib/db/queries'

export const flowgladServer = new FlowgladServer({
  getRequestingCustomerProfile: async () => {
    const user = await getUser()
    if (!user) {
      throw new Error('User not found')
    }
    const { teamId } = await getUserWithTeam(user.id)
    if (!teamId) {
      throw new Error('Team not found')
    }
    return {
      externalId: teamId.toString(),
      name: user.name ?? '',
      email: user.email,
    }
  },
})
