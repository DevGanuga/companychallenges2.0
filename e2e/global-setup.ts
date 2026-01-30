import { test as setup, expect } from '@playwright/test'
import { createAdminClient } from '../lib/supabase/server'

const ADMIN_AUTH_FILE = 'e2e/.auth/admin.json'

/**
 * Global setup for E2E tests
 * 
 * This runs once before all tests to:
 * 1. Authenticate as admin user
 * 2. Create test data fixtures
 * 3. Store auth state for reuse
 */
setup('authenticate as admin', async ({ page }) => {
  // Navigate to admin panel
  await page.goto('/admin')
  
  // Check if we need to authenticate
  // The app uses Clerk for authentication
  // In test mode, we'll use a mock auth or test user
  
  // For development/testing, check if mock auth is available
  const mockAuthButton = page.getByTestId('demo-user-button')
  
  if (await mockAuthButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Use demo/mock authentication
    await mockAuthButton.click()
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin', { timeout: 10000 })
  } else {
    // If Clerk sign-in is required, handle it
    // This assumes test credentials are available via environment
    const signInButton = page.getByRole('button', { name: /sign in/i })
    
    if (await signInButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signInButton.click()
      
      // Fill in test credentials from environment
      const email = process.env.TEST_ADMIN_EMAIL || 'test@companychallenges.com'
      const password = process.env.TEST_ADMIN_PASSWORD || 'testpassword123'
      
      await page.getByLabel(/email/i).fill(email)
      await page.getByRole('button', { name: /continue/i }).click()
      
      await page.getByLabel(/password/i).fill(password)
      await page.getByRole('button', { name: /continue/i }).click()
      
      // Wait for redirect to admin
      await page.waitForURL('/admin', { timeout: 15000 })
    }
  }
  
  // Verify we're on the admin dashboard
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  
  // Save auth state
  await page.context().storageState({ path: ADMIN_AUTH_FILE })
})

setup('create test fixtures', async ({ page }) => {
  // This setup creates test data that will be used across tests
  // The actual data creation is handled by the admin fixtures
  
  // Navigate to admin to ensure we're authenticated
  await page.goto('/admin')
  
  // Store test IDs in environment for cleanup
  // These will be created by individual test fixtures as needed
})
