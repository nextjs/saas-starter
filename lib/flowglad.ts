import { FlowgladServer } from '@flowglad/nextjs/server'
import { getTeamForUser, getUser } from '@/lib/db/queries'

export const flowgladServer = new FlowgladServer({
  apiKey: process.env.FLOWGLAD_SECRET_KEY,
  baseURL: 'https://app.flowglad.com',
  getRequestingCustomerProfile: async () => {
    const user = await getUser()
    if (!user) {
      throw new Error('User not found')
    }
    const team = await getTeamForUser(user.id)
    if (!team) {
      throw new Error('Team not found')
    }
    return {
      externalId: team.id.toString(),
      name: team.name,
      email: team.teamMembers.find(
        (teamMember) => teamMember.role === 'owner'
      )?.user.email!,
    }
  },
})
