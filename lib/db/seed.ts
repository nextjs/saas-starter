import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  const email = 'admin@sunlighten.com';
  const password = '2x1izdBMbA67YExTq5YPA2PT';
  const passwordHash = await hashPassword(password);

  // Check if user already exists
  let user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
          role: "owner",
        },
      ])
      .returning();
    user = newUser;
    console.log('Initial user created:', email);
    console.log('Password:', password);
  } else {
    console.log('User already exists:', email);
  }

  // Check if team already exists
  let team = await db.query.teams.findFirst({
    where: (teams, { eq }) => eq(teams.slug, 'blaupunkt'),
  });

  if (!team) {
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: 'Blaupunkt',
        slug: 'blaupunkt',
        description: 'Blaupunkt Android tablet OTA images',
        s3Prefix: 'uploads/blaupunkt',
        isActive: true,
      })
      .returning();
    team = newTeam;
    console.log('Initial space created:', team.name, `(${team.slug})`);
  } else {
    console.log('Space already exists:', team.name, `(${team.slug})`);
  }

  // Check if team membership already exists
  const existingMembership = await db.query.teamMembers.findFirst({
    where: (members, { and, eq }) => and(
      eq(members.teamId, team.id),
      eq(members.userId, user.id)
    ),
  });

  if (!existingMembership) {
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    });
    console.log('User assigned to space with owner role.');
  } else {
    console.log('User already assigned to space.');
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
