/**
 * Global Test Teardown
 * Runs once after all tests
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');
  
  // Any global cleanup can go here
  console.log('✅ Test environment cleaned up');
}