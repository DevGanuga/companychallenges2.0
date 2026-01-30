import { test, expect } from '@playwright/test'

/**
 * Challenge Edit Tests (COM-49 Nice to Have)
 */

test.describe('Edit Challenge Button', () => {
  test('challenge detail page has edit button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const editBtn = page.getByRole('button', { name: /edit challenge/i })
      await expect(editBtn).toBeVisible()
    }
  })
  
  test('edit button opens challenge form', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const editBtn = page.getByRole('button', { name: /edit challenge/i })
      await editBtn.click()
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Check that challenge form is shown
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      
      // Should have challenge-related fields
      const nameField = dialog.getByLabel(/name|title/i).first()
      await expect(nameField).toBeVisible()
    }
  })
})

test.describe('Challenge List Actions', () => {
  test('challenge list has manage button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const manageLink = page.getByRole('link', { name: /manage/i }).first()
    await expect(manageLink).toBeVisible()
  })
  
  test('challenge list has preview button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const previewLink = page.getByRole('link', { name: /preview/i }).first()
    await expect(previewLink).toBeVisible()
  })
  
  test('challenge list has duplicate button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const duplicateBtn = page.getByRole('button', { name: /duplicate/i }).first()
    await expect(duplicateBtn).toBeVisible()
  })
  
  test('challenge list has archive button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const archiveBtn = page.getByRole('button', { name: /archive/i }).first()
    await expect(archiveBtn).toBeVisible()
  })
})

test.describe('Challenge Form Features', () => {
  test('challenge form has brand color picker', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const editBtn = page.getByRole('button', { name: /edit challenge/i })
      await editBtn.click()
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Look for color input
      const colorInput = page.locator('[role="dialog"]').locator('input[type="color"]')
      const count = await colorInput.count()
      
      // Should have color picker
      expect(count).toBeGreaterThan(0)
    }
  })
  
  test('challenge form has feature toggles', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const editBtn = page.getByRole('button', { name: /edit challenge/i })
      await editBtn.click()
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Look for feature checkboxes/toggles
      const checkboxes = page.locator('[role="dialog"]').locator('input[type="checkbox"], [role="switch"]')
      const count = await checkboxes.count()
      
      // Should have feature toggles
      expect(count).toBeGreaterThan(0)
    }
  })
})
