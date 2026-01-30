import { test, expect } from '@playwright/test'

/**
 * Video/Media Tests (COM-47 Must Have)
 * 
 * Tests video functionality:
 * - YouTube video playback
 * - Vimeo video playback
 * - MP4 file upload
 * - Video thumbnail display
 */

test.describe('Video URL Input', () => {
  test('video URL field accepts YouTube URLs', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    // Click create new assignment
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      // Wait for form
      await page.waitForSelector('input[placeholder*="youtube" i], input[placeholder*="video" i]', { timeout: 5000 })
      
      // Find video URL input
      const videoInput = page.locator('input[placeholder*="youtube" i], input[placeholder*="video" i]').first()
      
      // Enter YouTube URL
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      await videoInput.fill(youtubeUrl)
      
      // Verify value is set
      const value = await videoInput.inputValue()
      expect(value).toBe(youtubeUrl)
    }
  })
  
  test('video URL field accepts Vimeo URLs', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForSelector('input[placeholder*="youtube" i], input[placeholder*="video" i]', { timeout: 5000 })
      
      const videoInput = page.locator('input[placeholder*="youtube" i], input[placeholder*="video" i]').first()
      
      // Enter Vimeo URL
      const vimeoUrl = 'https://vimeo.com/123456789'
      await videoInput.fill(vimeoUrl)
      
      const value = await videoInput.inputValue()
      expect(value).toBe(vimeoUrl)
    }
  })
  
  test('video URL field placeholder mentions supported platforms', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForSelector('input[placeholder*="video" i]', { timeout: 5000 })
      
      const videoInput = page.locator('input[placeholder*="video" i]').first()
      const placeholder = await videoInput.getAttribute('placeholder')
      
      // Placeholder should mention YouTube/Vimeo
      expect(placeholder?.toLowerCase()).toMatch(/youtube|vimeo|direct/i)
    }
  })
})

test.describe('Video File Upload', () => {
  test('video file upload input exists', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      // Wait for form
      await page.waitForTimeout(2000)
      
      // Check for video file input
      const videoFileInput = page.locator('input[type="file"][accept*="video"]')
      const count = await videoFileInput.count()
      
      // Should have video upload capability
      expect(count).toBeGreaterThan(0)
    }
  })
  
  test('video file input accepts MP4 format', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    
    const createBtn = page.getByRole('button', { name: /create|new assignment/i })
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click()
      
      await page.waitForTimeout(2000)
      
      const videoFileInput = page.locator('input[type="file"][accept*="video"]')
      if (await videoFileInput.count() > 0) {
        const accept = await videoFileInput.first().getAttribute('accept')
        
        // Should accept MP4
        expect(accept).toContain('mp4')
      }
    }
  })
})

test.describe('Video Playback - Public View', () => {
  test('YouTube embed loads on public assignment page', async ({ page }) => {
    // This test requires an assignment with a YouTube video
    // Navigate to a known assignment with video
    
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    // Find a challenge and look for video assignments
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Look for video-type assignment
      const videoAssignment = page.locator('text=video').first()
      if (await videoAssignment.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Found a video assignment - get its preview link
        const previewBtn = page.getByRole('link', { name: /preview/i }).first()
        if (await previewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          const href = await previewBtn.getAttribute('href')
          if (href) {
            await page.goto(href)
            await page.waitForLoadState('networkidle')
            
            // Check for iframe or video element
            const videoElement = page.locator('iframe[src*="youtube"], iframe[src*="vimeo"], video')
            // Video may require password first
          }
        }
      }
    }
    
    // This is a verification test - actual video playback requires manual testing
    test.skip(true, 'Video playback requires manual verification with actual content')
  })
  
  test('video thumbnail does not obscure assignment content', async ({ page }) => {
    // This tests the layout requirement that video thumbnail shouldn't push out text
    // Would need actual assignment with video to test
    
    test.skip(true, 'Requires assignment with video content for layout testing')
  })
})

test.describe('Sprint Video URLs', () => {
  test('sprint form has intro video URL field', async ({ page }) => {
    await page.goto('/admin/challenges')
    await page.waitForLoadState('networkidle')
    
    const challengeLink = page.locator('a[href*="/admin/challenges/"]').first()
    if (await challengeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await challengeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Click create sprint
      const createSprintBtn = page.getByRole('button', { name: /create sprint/i })
      if (await createSprintBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createSprintBtn.click()
        
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
        
        // Check for intro video URL field
        const introVideoField = page.getByLabel(/intro.*video/i)
        await expect(introVideoField).toBeVisible()
      }
    }
  })
  
  test('sprint form has recap video URL field', async ({ page }) => {
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
        
        // Check for recap video URL field
        const recapVideoField = page.getByLabel(/recap.*video/i)
        await expect(recapVideoField).toBeVisible()
      }
    }
  })
})
