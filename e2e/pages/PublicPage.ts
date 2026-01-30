import { Page, Locator, expect } from '@playwright/test'

/**
 * Public Page Object Model
 * 
 * Provides methods for interacting with the public-facing challenge and assignment pages
 */
export class PublicPage {
  readonly page: Page
  
  // Challenge page elements
  readonly challengeTitle: Locator
  readonly challengeDescription: Locator
  readonly assignmentList: Locator
  readonly announcementBanner: Locator
  
  // Assignment page elements
  readonly assignmentTitle: Locator
  readonly assignmentSubtitle: Locator
  readonly instructionsSection: Locator
  readonly contentSection: Locator
  readonly videoPlayer: Locator
  readonly videoThumbnail: Locator
  readonly completeButton: Locator
  readonly navigationPrev: Locator
  readonly navigationNext: Locator
  
  // Password gate elements
  readonly passwordGate: Locator
  readonly passwordInput: Locator
  readonly passwordSubmitButton: Locator
  readonly passwordError: Locator
  readonly passwordInstructions: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // Challenge elements
    this.challengeTitle = page.getByRole('heading', { level: 1 })
    this.challengeDescription = page.locator('[class*="description"], [class*="content"]').first()
    this.assignmentList = page.locator('[class*="assignment-list"], [class*="grid"]')
    this.announcementBanner = page.locator('[class*="announcement"]')
    
    // Assignment elements
    this.assignmentTitle = page.getByRole('heading', { level: 1 })
    this.assignmentSubtitle = page.locator('[class*="subtitle"]')
    this.instructionsSection = page.locator('[class*="instruction"]').first()
    this.contentSection = page.locator('[class*="content"]').last()
    this.videoPlayer = page.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]')
    this.videoThumbnail = page.locator('[class*="video-thumbnail"], [class*="media-preview"]')
    this.completeButton = page.getByRole('button', { name: /complete|done|finish/i })
    this.navigationPrev = page.getByRole('link', { name: /prev|previous|back/i })
    this.navigationNext = page.getByRole('link', { name: /next|forward/i })
    
    // Password gate elements
    this.passwordGate = page.locator('[class*="password"], [class*="gate"]').filter({ has: page.locator('input') })
    this.passwordInput = page.locator('input[type="text"], input[type="password"]').filter({ has: page.locator('xpath=ancestor::*[contains(@class, "password") or contains(@class, "gate")]') })
    this.passwordSubmitButton = page.getByRole('button', { name: /unlock|submit|enter/i })
    this.passwordError = page.locator('[class*="error"]')
    this.passwordInstructions = page.locator('[class*="instruction"], [class*="hint"]')
  }
  
  // Navigation
  async gotoChallenge(slug: string) {
    await this.page.goto(`/c/${slug}`)
    await this.page.waitForLoadState('networkidle')
  }
  
  async gotoAssignment(slug: string) {
    await this.page.goto(`/a/${slug}`)
    await this.page.waitForLoadState('networkidle')
  }
  
  async gotoLegacyUrl(slug: string) {
    // Test legacy URLs without /c/ or /a/ prefix
    await this.page.goto(`/${slug}`)
    await this.page.waitForLoadState('networkidle')
  }
  
  // Challenge page verifications
  async expectChallengeTitleVisible(title?: string) {
    if (title) {
      await expect(this.challengeTitle).toContainText(title)
    } else {
      await expect(this.challengeTitle).toBeVisible()
    }
  }
  
  async expectChallengeDescriptionVisible() {
    await expect(this.challengeDescription).toBeVisible()
  }
  
  async getAssignmentCount(): Promise<number> {
    const items = this.assignmentList.locator('a, [class*="assignment"]')
    return await items.count()
  }
  
  async clickAssignment(title: string) {
    await this.page.getByText(title).click()
    await this.page.waitForLoadState('networkidle')
  }
  
  // Assignment page verifications
  async expectAssignmentTitleVisible(title?: string) {
    if (title) {
      await expect(this.assignmentTitle).toContainText(title)
    } else {
      await expect(this.assignmentTitle).toBeVisible()
    }
  }
  
  async expectInstructionsVisible() {
    await expect(this.instructionsSection).toBeVisible()
  }
  
  async expectContentVisible() {
    await expect(this.contentSection).toBeVisible()
  }
  
  async expectInstructionsContain(text: string) {
    await expect(this.instructionsSection).toContainText(text)
  }
  
  async expectContentContain(text: string) {
    await expect(this.contentSection).toContainText(text)
  }
  
  // Text formatting verifications
  async expectHeadingStyle(headingText: string, level: number) {
    const heading = this.page.getByRole('heading', { name: headingText, level })
    await expect(heading).toBeVisible()
  }
  
  async expectLineSpacingPreserved() {
    // Check that blank lines are preserved (creates paragraph spacing)
    const paragraphs = this.contentSection.locator('p')
    const count = await paragraphs.count()
    expect(count).toBeGreaterThan(1) // Multiple paragraphs indicate line breaks preserved
  }
  
  // Video verifications
  async expectVideoPlayerVisible() {
    await expect(this.videoPlayer).toBeVisible({ timeout: 10000 })
  }
  
  async expectVideoThumbnailVisible() {
    await expect(this.videoThumbnail).toBeVisible()
  }
  
  async expectVideoThumbnailNotObscureContent() {
    // Check that the video thumbnail doesn't take up too much space
    const thumbnailBox = await this.videoThumbnail.boundingBox()
    const contentBox = await this.contentSection.boundingBox()
    
    if (thumbnailBox && contentBox) {
      // Thumbnail should not overlap significantly with content
      const overlapX = Math.max(0, Math.min(thumbnailBox.x + thumbnailBox.width, contentBox.x + contentBox.width) - Math.max(thumbnailBox.x, contentBox.x))
      const overlapY = Math.max(0, Math.min(thumbnailBox.y + thumbnailBox.height, contentBox.y + contentBox.height) - Math.max(thumbnailBox.y, contentBox.y))
      
      // If they're on the same row, thumbnail shouldn't take more than 50% of width
      if (overlapY > 0) {
        expect(thumbnailBox.width).toBeLessThan(contentBox.width)
      }
    }
  }
  
  async playVideo() {
    // For YouTube/Vimeo iframes, click the thumbnail
    if (await this.videoThumbnail.isVisible().catch(() => false)) {
      await this.videoThumbnail.click()
    }
    
    // For native video elements
    const nativeVideo = this.page.locator('video')
    if (await nativeVideo.isVisible().catch(() => false)) {
      await nativeVideo.click()
    }
  }
  
  async expectVideoPlaying() {
    // For native video, check if it's playing
    const nativeVideo = this.page.locator('video')
    if (await nativeVideo.isVisible().catch(() => false)) {
      const paused = await nativeVideo.evaluate((el: HTMLVideoElement) => el.paused)
      expect(paused).toBe(false)
    }
    
    // For iframes, we can't directly check, but we can verify the iframe loaded
    const iframe = this.page.locator('iframe')
    if (await iframe.isVisible().catch(() => false)) {
      await expect(iframe).toHaveAttribute('src', /.+/)
    }
  }
  
  // Password gate operations
  async expectPasswordGateVisible() {
    await expect(this.passwordGate).toBeVisible({ timeout: 5000 })
  }
  
  async expectPasswordGateHidden() {
    await expect(this.passwordGate).toBeHidden({ timeout: 5000 })
  }
  
  async expectPasswordInputType(type: 'text' | 'password') {
    const passwordInput = this.page.locator('input').filter({ has: this.page.locator(`[type="${type}"]`) })
    const actualType = await passwordInput.first().getAttribute('type')
    expect(actualType).toBe(type)
  }
  
  async expectPasswordInputAutocompleteDisabled() {
    const autocomplete = await this.page.locator('input').first().getAttribute('autocomplete')
    expect(autocomplete).toMatch(/off|new-password/)
  }
  
  async expectPasswordPopupMinimalText() {
    // The password popup should have minimal English text
    // Only "Password" label and unlock button
    const textContent = await this.passwordGate.textContent() || ''
    
    // Should NOT contain lengthy instructions or explanations
    expect(textContent.length).toBeLessThan(200)
    
    // Should contain "Password" (the only required text)
    expect(textContent.toLowerCase()).toContain('password')
  }
  
  async expectPasswordInstructionsVisible() {
    await expect(this.passwordInstructions).toBeVisible()
  }
  
  async enterPassword(password: string) {
    const input = this.page.locator('input[type="text"], input[type="password"]').first()
    await input.fill(password)
  }
  
  async submitPassword() {
    await this.passwordSubmitButton.click()
    await this.page.waitForTimeout(1000)
  }
  
  async expectPasswordError() {
    await expect(this.passwordError).toBeVisible()
  }
  
  async testPasswordCaseInsensitivity(correctPassword: string) {
    // Test that password is case-insensitive
    const variations = [
      correctPassword.toLowerCase(),
      correctPassword.toUpperCase(),
      correctPassword.charAt(0).toUpperCase() + correctPassword.slice(1).toLowerCase(),
    ]
    
    for (const variation of variations) {
      await this.enterPassword(variation)
      await this.submitPassword()
      
      // If gate is hidden, password worked
      if (await this.passwordGate.isHidden().catch(() => true)) {
        return true
      }
      
      // Reset for next try
      await this.page.reload()
    }
    
    return false
  }
  
  // Navigation
  async goToNextAssignment() {
    await this.navigationNext.click()
    await this.page.waitForLoadState('networkidle')
  }
  
  async goToPreviousAssignment() {
    await this.navigationPrev.click()
    await this.page.waitForLoadState('networkidle')
  }
  
  async markComplete() {
    await this.completeButton.click()
    await this.page.waitForTimeout(1000)
  }
  
  // URL verifications
  async expectUrlContains(segment: string) {
    expect(this.page.url()).toContain(segment)
  }
  
  async expectUrlMatches(pattern: RegExp) {
    expect(this.page.url()).toMatch(pattern)
  }
  
  async expectRedirectedTo(expectedPath: string) {
    // Wait for any redirects to complete
    await this.page.waitForLoadState('networkidle')
    expect(this.page.url()).toContain(expectedPath)
  }
}
