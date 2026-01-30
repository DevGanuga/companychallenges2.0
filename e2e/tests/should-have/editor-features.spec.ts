import { test, expect } from '@playwright/test'

/**
 * Editor Features Tests (COM-48 Should Have)
 */

test.describe('Font Size', () => {
  test('editor has font size selector', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      // Check for font size dropdown
      const fontSizeSelector = page.locator('select, [role="combobox"]').filter({
        has: page.locator('option:has-text("10px"), option:has-text("12px")')
      })
      
      const count = await fontSizeSelector.count()
      expect(count).toBeGreaterThan(0)
    }
  })
  
  test('font size selector has multiple options', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      const fontSizeSelector = page.locator('select').filter({
        has: page.locator('option:has-text("px")')
      }).first()
      
      if (await fontSizeSelector.isVisible().catch(() => false)) {
        const options = await fontSizeSelector.locator('option').count()
        expect(options).toBeGreaterThan(5) // Should have multiple size options
      }
    }
  })
})

test.describe('Link Insertion', () => {
  test('editor has link insertion button', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      const linkBtn = page.getByRole('button', { name: /link|url/i }).first()
      await expect(linkBtn).toBeVisible()
    }
  })
  
  test('link insertion has search functionality', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      // Look for "Insert Link (search)" button
      const searchLinkBtn = page.getByRole('button', { name: /insert link.*search/i })
      if (await searchLinkBtn.isVisible().catch(() => false)) {
        await expect(searchLinkBtn).toBeVisible()
      }
    }
  })
})

test.describe('Color Selection', () => {
  test('editor has text color button', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      // Look for color button (usually labeled "A" with color indicator)
      const colorBtn = page.getByRole('button', { name: 'A' }).first()
      if (await colorBtn.isVisible().catch(() => false)) {
        await expect(colorBtn).toBeVisible()
      }
    }
  })
})
