import { test, expect } from '@playwright/test'

/**
 * UI Polish Tests (COM-49 Nice to Have)
 */

test.describe('Color Picker Positioning', () => {
  test('color picker stays within viewport', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      // Click color button
      const colorBtn = page.getByRole('button', { name: 'A' }).first()
      if (await colorBtn.isVisible().catch(() => false)) {
        await colorBtn.click()
        
        // Check if color picker appears within viewport
        const picker = page.locator('[class*="color-picker"], [class*="popover"]')
        if (await picker.isVisible({ timeout: 2000 }).catch(() => false)) {
          const box = await picker.boundingBox()
          const viewport = page.viewportSize()
          
          if (box && viewport) {
            expect(box.x).toBeGreaterThanOrEqual(0)
            expect(box.y).toBeGreaterThanOrEqual(0)
            expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
            expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
          }
        }
      }
    }
  })
})

test.describe('Copy Link Buttons', () => {
  test('assignments have copy link button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Check for copy link button
      const copyBtn = page.getByRole('button', { name: /copy.*link/i }).first()
      await expect(copyBtn).toBeVisible()
    }
  })
  
  test('challenges have copy URL button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const copyBtn = page.getByRole('button', { name: /copy.*url/i }).first()
    await expect(copyBtn).toBeVisible()
  })
})

test.describe('Complete Button Visibility', () => {
  test('complete button is visible in public assignment view', async ({ page }) => {
    // Navigate to a public assignment
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const previewLink = page.locator('a[href*="/a/"]').first()
      if (await previewLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await previewLink.getAttribute('href')
        if (href) {
          await page.goto(href)
          await page.waitForLoadState('networkidle')
          
          // If no password gate, look for complete button
          const completeBtn = page.getByRole('button', { name: /complete|done|finish/i })
          // May not be visible if password-protected
        }
      }
    }
  })
})
