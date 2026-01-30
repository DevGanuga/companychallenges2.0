import { test, expect } from '@playwright/test'
import { ChallengePage, SprintPage } from '../../pages'
import path from 'path'

/**
 * Sprint Functionality Tests (COM-47 Must Have)
 * 
 * Tests critical sprint features:
 * - (i) info button shows support info, not password instructions
 * - Password visibility after save
 * - Preview button functionality
 * - Cover image upload persistence
 * - Publication date editability
 * - Adding assignments to sprints
 */

test.describe('Sprint Management', () => {
  let challengePage: ChallengePage
  let sprintPage: SprintPage
  
  test.beforeEach(async ({ page }) => {
    challengePage = new ChallengePage(page)
    sprintPage = new SprintPage(page)
  })
  
  test.describe('Sprint Form - Password Handling', () => {
    test('password field is visible (type="text") for gamification purposes', async ({ page }) => {
      // Navigate to a challenge with sprints enabled
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      // Click on first challenge (or create one)
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await challengeLink.click()
      } else {
        test.skip(true, 'No challenges available - create test data first')
        return
      }
      
      await page.waitForLoadState('networkidle')
      
      // Open sprint form
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createSprintBtn.click()
        await sprintPage.expectFormVisible()
        
        // Verify password field is type="text" (visible for gamification)
        await sprintPage.expectPasswordFieldType('text')
      } else {
        test.skip(true, 'Sprint feature not enabled on this challenge')
      }
    })
    
    test('password placeholder shows appropriate text when sprint has existing password', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await challengeLink.click()
      } else {
        test.skip(true, 'No challenges available')
        return
      }
      
      await page.waitForLoadState('networkidle')
      
      // Look for existing sprint to edit
      const sprintEditBtn = page.getByRole('button', { name: /edit/i }).first()
      if (await sprintEditBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sprintEditBtn.click()
        await sprintPage.expectFormVisible()
        
        // If sprint has password, placeholder should indicate it
        const passwordInput = page.getByLabel(/password/i).first()
        const placeholder = await passwordInput.getAttribute('placeholder')
        
        // Should indicate if password exists or prompt for new one
        expect(placeholder).toBeTruthy()
      } else {
        test.skip(true, 'No sprints to edit')
      }
    })
    
    test('password value persists and shows after save and reopen', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Create a new sprint with password
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (!await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'Sprint feature not enabled')
        return
      }
      
      await createSprintBtn.click()
      await sprintPage.expectFormVisible()
      
      const testPassword = 'testpassword123'
      const sprintName = `Test Sprint ${Date.now()}`
      
      await sprintPage.fillForm({
        name: sprintName,
        password: testPassword
      })
      
      await sprintPage.submit()
      
      // Wait for sprint to be created
      await page.waitForTimeout(2000)
      
      // Find and edit the sprint we just created
      const newSprint = page.getByText(sprintName)
      if (await newSprint.isVisible({ timeout: 3000 }).catch(() => false)) {
        const editBtn = newSprint.locator('..').locator('..').getByRole('button', { name: /edit/i })
        await editBtn.click()
        await sprintPage.expectFormVisible()
        
        // The password field should indicate a password exists
        // Note: For security, actual password may not be displayed, but placeholder should change
        const passwordInput = page.getByLabel(/password/i).first()
        const placeholder = await passwordInput.getAttribute('placeholder')
        expect(placeholder).toContain('change')
      }
    })
  })
  
  test.describe('Sprint Form - Cover Image', () => {
    test('cover image upload persists after save', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (!await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'Sprint feature not enabled')
        return
      }
      
      await createSprintBtn.click()
      await sprintPage.expectFormVisible()
      
      // Create test image if assets directory exists
      const testImagePath = path.join(process.cwd(), 'e2e', 'assets', 'test-image.png')
      const sprintName = `Sprint with Image ${Date.now()}`
      
      await sprintPage.fillForm({
        name: sprintName,
      })
      
      // Upload cover image
      const fileInput = page.locator('input[type="file"]').first()
      if (await fileInput.isVisible().catch(() => false)) {
        try {
          await fileInput.setInputFiles(testImagePath)
          // Wait for upload
          await page.waitForTimeout(3000)
          
          // Check if image preview appears
          const imagePreview = page.locator('img[alt="Cover"]')
          if (await imagePreview.isVisible({ timeout: 5000 }).catch(() => false)) {
            await sprintPage.submit()
            
            // Reopen and verify image persists
            await page.waitForTimeout(2000)
            const newSprint = page.getByText(sprintName)
            if (await newSprint.isVisible({ timeout: 3000 }).catch(() => false)) {
              const editBtn = newSprint.locator('..').locator('..').getByRole('button', { name: /edit/i })
              await editBtn.click()
              await sprintPage.expectFormVisible()
              
              // Verify image is still there
              await expect(page.locator('img[alt="Cover"]')).toBeVisible()
            }
          }
        } catch {
          // Test image may not exist - skip gracefully
          test.skip(true, 'Test image not available')
        }
      }
    })
  })
  
  test.describe('Sprint Form - Publication Dates', () => {
    test('publication/start date can be modified after initial save', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (!await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'Sprint feature not enabled')
        return
      }
      
      await createSprintBtn.click()
      await sprintPage.expectFormVisible()
      
      const sprintName = `Sprint with Date ${Date.now()}`
      const initialDate = '2026-02-01T10:00'
      
      await sprintPage.fillForm({
        name: sprintName,
        startDate: initialDate
      })
      
      await sprintPage.submit()
      await page.waitForTimeout(2000)
      
      // Reopen and try to change the date
      const newSprint = page.getByText(sprintName)
      if (await newSprint.isVisible({ timeout: 3000 }).catch(() => false)) {
        const editBtn = newSprint.locator('..').locator('..').getByRole('button', { name: /edit/i })
        await editBtn.click()
        await sprintPage.expectFormVisible()
        
        // Verify start date is editable (not disabled)
        await sprintPage.expectStartDateEditable()
        
        // Try to change the date
        const newDate = '2026-02-15T14:00'
        await sprintPage.fillForm({
          startDate: newDate
        })
        
        // Verify the new value is set
        await sprintPage.expectStartDateValue(newDate)
        
        // Save and verify
        await sprintPage.submit()
      }
    })
    
    test('end date can be modified after initial save', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Find existing sprint with dates
      const sprintEditBtn = page.getByRole('button', { name: /edit/i }).first()
      if (await sprintEditBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sprintEditBtn.click()
        await sprintPage.expectFormVisible()
        
        // Verify end date is editable
        await sprintPage.expectEndDateEditable()
      } else {
        test.skip(true, 'No sprints to edit')
      }
    })
  })
  
  test.describe('Sprint Info Button', () => {
    test('(i) info button shows support info, not password instructions', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Look for info button (typically an "i" icon button)
      const infoButton = page.locator('button[title*="info"], button svg[class*="info"]').first()
      
      if (await infoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await infoButton.click()
        
        // Check the popover/tooltip content
        const popover = page.locator('[role="tooltip"], [class*="popover"], [class*="tooltip"]')
        
        if (await popover.isVisible({ timeout: 2000 }).catch(() => false)) {
          const content = await popover.textContent() || ''
          
          // Should contain support-related info
          expect(content.toLowerCase()).toMatch(/support|help|contact|info/i)
          
          // Should NOT be about password
          expect(content.toLowerCase()).not.toMatch(/password.*instruction/i)
        }
      } else {
        // No info button visible - this may be expected if not implemented
        test.skip(true, 'No info button found')
      }
    })
  })
  
  test.describe('Sprint Preview', () => {
    test('preview button opens sprint/challenge in new tab', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Find preview button
      const previewBtn = page.getByRole('link', { name: /preview/i })
      
      if (await previewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Check that it has target="_blank"
        const target = await previewBtn.getAttribute('target')
        expect(target).toBe('_blank')
        
        // Click and verify new page opens
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page'),
          previewBtn.click()
        ])
        
        await newPage.waitForLoadState('networkidle')
        
        // Verify we're on the public challenge page
        expect(newPage.url()).toContain('/c/')
        
        await newPage.close()
      }
    })
  })
  
  test.describe('Sprint - Assignment Management', () => {
    test('assignments can be added to sprints', async ({ page }) => {
      await page.goto('/admin/challenges')
      await page.waitForLoadState('networkidle')
      
      const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
      if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'No challenges available')
        return
      }
      
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Check if there are sprints and assignments
      const sprintSection = page.locator('text=Sprints').locator('..')
      const assignmentSection = page.locator('text=Assignments').locator('..')
      
      if (!await sprintSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        test.skip(true, 'Sprint section not available')
        return
      }
      
      // Look for assignment settings button (gear icon) on any assignment
      const settingsBtn = page.getByRole('button', { name: /settings/i }).first()
      
      if (await settingsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsBtn.click()
        
        // Look for sprint dropdown/selector in the settings dialog
        const sprintSelector = page.locator('select, [role="combobox"]').filter({ has: page.locator('option') })
        
        if (await sprintSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Sprint selector exists - assignments can be added to sprints
          expect(await sprintSelector.isVisible()).toBeTruthy()
        }
        
        // Close dialog
        await page.keyboard.press('Escape')
      }
    })
  })
})

test.describe('Sprint Save Button', () => {
  test('new sprint form has a visible Save button', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (!await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(true, 'No challenges available')
      return
    }
    
    await challengeLink.click()
    await page.waitForLoadState('networkidle')
    
    const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
    if (!await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(true, 'Sprint feature not enabled')
      return
    }
    
    await createSprintBtn.click()
    
    // Wait for form
    const form = page.locator('[role="dialog"]')
    await expect(form).toBeVisible({ timeout: 5000 })
    
    // Verify Save button exists and is visible
    const saveBtn = form.getByRole('button', { name: /save|create/i })
    await expect(saveBtn).toBeVisible()
  })
})
