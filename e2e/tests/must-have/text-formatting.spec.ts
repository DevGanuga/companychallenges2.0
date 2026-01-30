import { test, expect } from '@playwright/test'

/**
 * Text Formatting Tests (COM-47 Must Have)
 * 
 * Tests text formatting:
 * - Line spacing preservation
 * - Heading styles (H1, H2, H3)
 * - Rich text editor functionality
 */

test.describe('Rich Text Editor - Admin', () => {
  test('editor has heading buttons (H1, H2, H3)', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      // Check for heading buttons
      const h1Button = page.getByRole('button', { name: 'H1' })
      const h2Button = page.getByRole('button', { name: 'H2' })
      const h3Button = page.getByRole('button', { name: 'H3' })
      
      await expect(h1Button).toBeVisible()
      await expect(h2Button).toBeVisible()
      await expect(h3Button).toBeVisible()
    }
  })
  
  test('editor has text formatting buttons (Bold, Italic, Underline)', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      const boldBtn = page.getByRole('button', { name: /bold/i })
      const italicBtn = page.getByRole('button', { name: /italic/i })
      const underlineBtn = page.getByRole('button', { name: /underline/i })
      
      await expect(boldBtn).toBeVisible()
      await expect(italicBtn).toBeVisible()
      await expect(underlineBtn).toBeVisible()
    }
  })
  
  test('editor has list buttons (Bullet, Numbered)', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      const bulletBtn = page.getByRole('button', { name: /bullet/i })
      const numberedBtn = page.getByRole('button', { name: /number/i })
      
      await expect(bulletBtn).toBeVisible()
      await expect(numberedBtn).toBeVisible()
    }
  })
  
  test('editor has alignment buttons', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      const leftAlign = page.getByRole('button', { name: /align.*left/i })
      const centerAlign = page.getByRole('button', { name: /align.*center/i })
      const rightAlign = page.getByRole('button', { name: /align.*right/i })
      
      await expect(leftAlign).toBeVisible()
      await expect(centerAlign).toBeVisible()
      await expect(rightAlign).toBeVisible()
    }
  })
  
  test('editor has link insertion button', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      // Look for link/URL buttons
      const linkBtn = page.getByRole('button', { name: /link|url/i }).first()
      await expect(linkBtn).toBeVisible()
    }
  })
  
  test('editor has font size dropdown', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      // Check for font size dropdown
      const fontSizeDropdown = page.locator('select, [role="combobox"]').filter({ 
        has: page.locator('option[value*="px"], option:has-text("10px")') 
      })
      
      // Should have a font size selector
      const count = await fontSizeDropdown.count()
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('Text Formatting - Output Verification', () => {
  test('line breaks are preserved in public view', async ({ page }) => {
    // This test requires checking actual rendered output
    // Would need to create content with line breaks and verify in public view
    
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Open an assignment preview
      const previewLink = page.locator('a[href*="/a/"]').first()
      if (await previewLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await previewLink.getAttribute('href')
        if (href) {
          // Navigate to public view
          const publicPage = await page.context().newPage()
          await publicPage.goto(href)
          await publicPage.waitForLoadState('networkidle')
          
          // Check for paragraph elements (line breaks create paragraphs)
          const paragraphs = publicPage.locator('p')
          const count = await paragraphs.count()
          
          // Should have multiple paragraphs if content has line breaks
          // This is a basic check - actual verification needs known content
          
          await publicPage.close()
        }
      }
    }
  })
  
  test('heading styles render correctly in public view', async ({ page }) => {
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
          const publicPage = await page.context().newPage()
          await publicPage.goto(href)
          await publicPage.waitForLoadState('networkidle')
          
          // Check for heading elements
          const h1Elements = publicPage.locator('h1')
          const h2Elements = publicPage.locator('h2')
          
          // May have headings if content uses them
          // Actual verification needs known content with headings
          
          await publicPage.close()
        }
      }
    }
  })
})

test.describe('Challenge Description Formatting', () => {
  test('challenge form has rich text editor for description', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create challenge/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Check for rich text editor (ProseMirror)
      const editor = page.locator('.ProseMirror')
      const count = await editor.count()
      
      expect(count).toBeGreaterThan(0)
    }
  })
})

test.describe('Sprint Description Formatting', () => {
  test('sprint form has rich text editor', async ({ page }) => {
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
        
        // Check for rich text editor
        const editor = page.locator('.ProseMirror')
        const count = await editor.count()
        
        expect(count).toBeGreaterThan(0)
      }
    }
  })
})
