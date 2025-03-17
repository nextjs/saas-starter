import { db } from './drizzle'
import { users, teams, teamMembers } from './schema'
import { hashPassword } from '@/lib/auth/session'

async function seed() {
  const email = 'test@test.com'
  const password = 'admin123'
  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: 'owner',
      },
    ])
    .returning()

  console.log('Initial user created.')

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning()

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  })
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error)
    process.exit(1)
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...')
    process.exit(0)
  })
