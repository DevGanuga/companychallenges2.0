import { test as base, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Data fixture for E2E tests
 * 
 * Provides test data files and utilities for testing
 * file uploads, imports, etc.
 */

export interface DataFixture {
  /** Get path to a test image file */
  testImagePath: string
  
  /** Get path to a test video file */
  testVideoPath: string
  
  /** Generate a unique test name */
  uniqueName: (prefix: string) => string
  
  /** Generate random content for rich text */
  richTextContent: () => string
  
  /** Wait for toast notification */
  waitForToast: (message?: string) => Promise<void>
  
  /** Dismiss any visible dialogs */
  dismissDialogs: () => Promise<void>
}

// Create test assets directory and placeholder files if needed
const TEST_ASSETS_DIR = path.join(process.cwd(), 'e2e', 'assets')

function ensureTestAssets() {
  if (!fs.existsSync(TEST_ASSETS_DIR)) {
    fs.mkdirSync(TEST_ASSETS_DIR, { recursive: true })
  }
  
  // Create a 1x1 pixel PNG for testing image uploads
  const testImagePath = path.join(TEST_ASSETS_DIR, 'test-image.png')
  if (!fs.existsSync(testImagePath)) {
    // Minimal valid PNG file (1x1 transparent pixel)
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // IEND chunk
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ])
    fs.writeFileSync(testImagePath, png)
  }
  
  // Create a placeholder for video (actual video testing may need a real file)
  const testVideoPath = path.join(TEST_ASSETS_DIR, 'test-video.mp4')
  if (!fs.existsSync(testVideoPath)) {
    // Create an empty placeholder - real video tests may need actual video files
    fs.writeFileSync(testVideoPath, '')
  }
  
  return {
    testImagePath,
    testVideoPath,
  }
}

export const test = base.extend<DataFixture>({
  testImagePath: async ({}, use) => {
    const assets = ensureTestAssets()
    await use(assets.testImagePath)
  },
  
  testVideoPath: async ({}, use) => {
    const assets = ensureTestAssets()
    await use(assets.testVideoPath)
  },
  
  uniqueName: async ({}, use) => {
    const nameFn = (prefix: string): string => {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }
    await use(nameFn)
  },
  
  richTextContent: async ({}, use) => {
    const contentFn = (): string => {
      const paragraphs = [
        'This is a test paragraph with some content.',
        'Here is another paragraph to test formatting.',
        '',
        'This paragraph comes after a blank line to test line spacing.',
        '## Heading Test',
        'Content after a heading to verify heading styles.',
      ]
      return paragraphs.join('\n')
    }
    await use(contentFn)
  },
  
  waitForToast: async ({ page }, use) => {
    const waitFn = async (message?: string): Promise<void> => {
      const toastSelector = '[data-sonner-toast], [role="status"], .toast'
      
      if (message) {
        await page.getByText(message).waitFor({ timeout: 5000 })
      } else {
        await page.locator(toastSelector).first().waitFor({ timeout: 5000 })
      }
    }
    await use(waitFn)
  },
  
  dismissDialogs: async ({ page }, use) => {
    const dismissFn = async (): Promise<void> => {
      // Try to close any open dialogs
      const closeButtons = page.locator('[role="dialog"] button[aria-label="Close"], [role="dialog"] button:has-text("Cancel")')
      
      const count = await closeButtons.count()
      for (let i = 0; i < count; i++) {
        try {
          await closeButtons.nth(i).click({ timeout: 1000 })
        } catch {
          // Ignore if already closed
        }
      }
      
      // Press Escape as fallback
      await page.keyboard.press('Escape')
    }
    await use(dismissFn)
  },
})

export { expect }
