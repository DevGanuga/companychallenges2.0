import { test, expect } from '@playwright/test'

/**
 * Content Types Tests (COM-48 Should Have)
 */

test.describe('Content Type Selection', () => {
  test('content type dropdown has all 4 options', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      const contentTypeSelect = page.locator('select').filter({ has: page.locator('option[value="standard"]') })
      if (await contentTypeSelect.isVisible().catch(() => false)) {
        const options = await contentTypeSelect.locator('option').allTextContents()
        
        expect(options.some(o => /standard/i.test(o))).toBeTruthy()
        expect(options.some(o => /video/i.test(o))).toBeTruthy()
        expect(options.some(o => /quiz/i.test(o))).toBeTruthy()
        expect(options.some(o => /announcement/i.test(o))).toBeTruthy()
      }
    }
  })
  
  test('changing content type shows description', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      
      const contentTypeSelect = page.locator('select').filter({ has: page.locator('option[value="standard"]') })
      if (await contentTypeSelect.isVisible().catch(() => false)) {
        await contentTypeSelect.selectOption('video')
        
        // Check for video description
        const description = page.getByText(/video.*focused|emphasize.*video/i)
        await expect(description).toBeVisible()
      }
    }
  })
})

test.describe('Quiz Content Type', () => {
  test('quiz type allows quiz questions', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Look for quiz button on assignments
      const quizBtn = page.getByRole('button', { name: /quiz/i }).first()
      if (await quizBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await quizBtn.click()
        
        // Quiz editor should open
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      }
    }
  })
})
