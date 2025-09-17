import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68c400b49c50c554b20cd4e4", 
  requiresAuth: true // Ensure authentication is required for all operations
});
