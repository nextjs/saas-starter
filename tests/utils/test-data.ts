export interface TestUser {
  id: number;
  email: string;
  password: string;
  role: 'owner' | 'member';
  name: string;
}

export interface TestTeam {
  id: number;
  name: string;
  slug: string;
  description: string;
  s3Prefix: string;
  isActive: boolean;
}

export function getTestUsers(): TestUser[] {
  const testUsersJson = process.env.TEST_USERS;
  if (!testUsersJson) {
    throw new Error('Test users not found. Make sure global setup ran successfully.');
  }
  return JSON.parse(testUsersJson);
}

export function getTestTeams(): TestTeam[] {
  const testTeamsJson = process.env.TEST_TEAMS;
  if (!testTeamsJson) {
    throw new Error('Test teams not found. Make sure global setup ran successfully.');
  }
  return JSON.parse(testTeamsJson);
}

export function getTestUser(role: 'owner' | 'member' = 'owner'): TestUser {
  const users = getTestUsers();
  const user = users.find(u => u.role === role);
  if (!user) {
    throw new Error(`Test user with role '${role}' not found`);
  }
  return user;
}

export function getTestTeam(slug: string = 'blaupunkt'): TestTeam {
  const teams = getTestTeams();
  const team = teams.find(t => t.slug === slug);
  if (!team) {
    throw new Error(`Test team with slug '${slug}' not found`);
  }
  return team;
}

export const TEST_FILE_DATA = {
  smallFile: {
    name: 'test-small.zip',
    content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00\x00\x00\x00\x00This is a small test file for E2E testing.',
    size: 50,
    type: 'application/zip'
  },
  mediumFile: {
    name: 'test-medium.zip',
    content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00\x00\x00\x00\x00' + 'A'.repeat(1024 * 100), // 100KB
    size: 1024 * 100,
    type: 'application/zip'
  },
  largeFile: {
    name: 'test-large.zip',
    content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00\x00\x00\x00\x00' + 'A'.repeat(1024 * 1024), // 1MB
    size: 1024 * 1024,
    type: 'application/zip'
  }
};

export const TEST_OTA_IMAGE = {
  name: 'test-ota-image.zip',
  content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00', // Minimal ZIP file header
  size: 22,
  type: 'application/zip'
};
