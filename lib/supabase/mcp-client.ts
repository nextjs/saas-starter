import { SupabaseManagementAPI } from '@supabase/supabase-management-js';

export function createMcpClient() {
  const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!supabaseAccessToken) {
    throw new Error('SUPABASE_ACCESS_TOKEN is not defined');
  }
  
  return new SupabaseManagementAPI({
    accessToken: supabaseAccessToken,
  });
}

// Example usage for project-specific operations
export async function getProjectDetails() {
  const mcpClient = createMcpClient();
  const projectId = process.env.SUPABASE_PROJECT_ID;
  
  if (!projectId) {
    throw new Error('SUPABASE_PROJECT_ID is not defined');
  }
  
  return await mcpClient.getProject(projectId);
} 