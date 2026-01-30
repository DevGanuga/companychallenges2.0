import { test as base, expect, Page } from '@playwright/test'

/**
 * Auth fixture for E2E tests
 * 
 * Provides authenticated page contexts and helper methods
 * for authentication-related testing
 */

export interface AuthFixture {
  /** Navigate to admin panel (authenticated) */
  adminPage: Page
  
  /** Navigate to public page (unauthenticated) */
  publicPage: Page
  
  /** Login as admin user */
  loginAsAdmin: () => Promise<void>
  
  /** Logout current user */
  logout: () => Promise<void>
}

export const test = base.extend<AuthFixture>({
  adminPage: async ({ page }, use) => {
    // Navigate to admin - auth state is loaded from storage
    await page.goto('/admin')
    await use(page)
  },
  
  publicPage: async ({ browser }, use) => {
    // Create a new context without auth for public page testing
    const context = await browser.newContext()
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
  
  loginAsAdmin: async ({ page }, use) => {
    const loginFn = async () => {
      await page.goto('/admin')
      
      // Check for demo button first
      const demoButton = page.getByTestId('demo-user-button')
      if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await demoButton.click()
        await page.waitForURL('/admin')
        return
      }
      
      // Otherwise use Clerk sign-in
      const signInLink = page.getByRole('link', { name: /sign in/i })
      if (await signInLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signInLink.click()
        
        const email = process.env.TEST_ADMIN_EMAIL || 'test@companychallenges.com'
        const password = process.env.TEST_ADMIN_PASSWORD || 'testpassword123'
        
        await page.getByLabel(/email/i).fill(email)
        await page.getByRole('button', { name: /continue/i }).click()
        await page.getByLabel(/password/i).fill(password)
        await page.getByRole('button', { name: /continue/i }).click()
        
        await page.waitForURL('/admin', { timeout: 15000 })
      }
    }
    
    await use(loginFn)
  },
  
  logout: async ({ page }, use) => {
    const logoutFn = async () => {
      // Click user menu and sign out
      const userButton = page.locator('[data-clerk-user-button]').first()
      if (await userButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userButton.click()
        await page.getByRole('menuitem', { name: /sign out/i }).click()
        await page.waitForURL('/')
      }
    }
    
    await use(logoutFn)
  },
})

export { expect }
