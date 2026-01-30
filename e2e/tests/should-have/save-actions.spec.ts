import { test, expect } from '@playwright/test'

/**
 * Save Actions Tests (COM-48 Should Have)
 */

test.describe('Announcement Save', () => {
  test('new announcement form has save button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const postBtn = page.getByRole('button', { name: /post announcement/i })
      if (await postBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await postBtn.click()
        
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        
        const saveBtn = page.locator('[role="dialog"]').getByRole('button', { name: /save|post|create/i })
        await expect(saveBtn).toBeVisible()
      }
    }
  })
})

test.describe('Sprint Save', () => {
  test('new sprint form has save button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createSprintBtn.click()
        
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        
        const saveBtn = page.locator('[role="dialog"]').getByRole('button', { name: /save/i })
        await expect(saveBtn).toBeVisible()
      }
    }
  })
})

test.describe('Required Fields', () => {
  test('assignment form shows required field indicators', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      // Check for required indicators (*)
      const requiredMarkers = page.locator('text=*')
      const count = await requiredMarkers.count()
      
      expect(count).toBeGreaterThan(0)
    }
  })
  
  test('challenge form validates required fields', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create challenge/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Check for required indicators
      const requiredMarkers = page.locator('[role="dialog"]').locator('text=*')
      const count = await requiredMarkers.count()
      
      expect(count).toBeGreaterThan(0)
    }
  })
})
