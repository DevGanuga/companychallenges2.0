import { test as teardown } from '@playwright/test'

/**
 * Global teardown for E2E tests
 * 
 * This runs once after all tests to clean up test data
 */
teardown('cleanup test data', async ({ }) => {
  // Clean up any test data created during tests
  // This is handled by individual test fixtures with afterAll hooks
  
  console.log('E2E test cleanup complete')
})
