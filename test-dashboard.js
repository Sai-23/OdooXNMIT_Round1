import { getDashboardStats } from './lib/dashboard.js';

// Test the dashboard stats with a sample user ID
async function testDashboard() {
  console.log('Testing dashboard stats...');
  
  // Use a sample user ID (you'll need to replace this with an actual user ID from your database)
  const testUserId = 'test-user-id';
  
  try {
    const stats = await getDashboardStats(testUserId);
    console.log('Dashboard stats:', stats);
  } catch (error) {
    console.error('Error testing dashboard:', error);
  }
}

// testDashboard();
console.log('Dashboard test script ready. Update testUserId and uncomment the test call.');
