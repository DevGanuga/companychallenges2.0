import { test, expect } from '@playwright/test'

/**
 * Dashboard Tests (COM-49 Nice to Have)
 */

test.describe('Dashboard Statistics', () => {
  test('dashboard shows client count', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const clientStat = page.getByText(/clients?/i).locator('..')
    await expect(clientStat).toBeVisible()
    
    // Should show a number
    const statText = await clientStat.textContent() || ''
    expect(statText).toMatch(/\d+/)
  })
  
  test('dashboard shows challenge count', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const challengeStat = page.getByText(/challenges?/i).locator('..')
    await expect(challengeStat).toBeVisible()
  })
  
  test('dashboard shows assignment count', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const assignmentStat = page.getByText(/assignments?/i).locator('..')
    await expect(assignmentStat).toBeVisible()
  })
})

test.describe('Recent Activity', () => {
  test('dashboard shows recent activity section', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const recentActivity = page.getByRole('heading', { name: /recent.*activity/i })
    await expect(recentActivity).toBeVisible()
  })
  
  test('recent activity shows latest changes', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    // Look for activity items with timestamps
    const activityItems = page.getByText(/days? ago|hours? ago|minutes? ago|just now/i)
    const count = await activityItems.count()
    
    // Should have some recent activity
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Quick Actions', () => {
  test('dashboard has quick action buttons', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const quickActions = page.getByRole('heading', { name: /quick.*action/i })
    await expect(quickActions).toBeVisible()
  })
  
  test('quick actions include new client', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const newClientAction = page.getByRole('link', { name: /new.*client/i })
    await expect(newClientAction).toBeVisible()
  })
  
  test('quick actions include new challenge', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const newChallengeAction = page.getByRole('link', { name: /new.*challenge/i })
    await expect(newChallengeAction).toBeVisible()
  })
  
  test('quick actions include new assignment', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    const newAssignmentAction = page.getByRole('link', { name: /new.*assignment/i })
    await expect(newAssignmentAction).toBeVisible()
  })
})
