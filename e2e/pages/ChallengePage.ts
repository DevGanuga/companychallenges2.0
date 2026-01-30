import { Page, Locator, expect } from '@playwright/test'

/**
 * Challenge Page Object Model
 * 
 * Provides methods for interacting with challenge management pages
 */
export class ChallengePage {
  readonly page: Page
  
  // Challenge list page
  readonly createButton: Locator
  readonly challengeList: Locator
  readonly searchInput: Locator
  
  // Challenge detail page
  readonly challengeTitle: Locator
  readonly editChallengeButton: Locator
  readonly previewButton: Locator
  readonly slugDisplay: Locator
  
  // Assignment section
  readonly assignmentSection: Locator
  readonly libraryButton: Locator
  readonly createAssignmentButton: Locator
  readonly assignmentList: Locator
  
  // Sprint section
  readonly sprintSection: Locator
  readonly createSprintButton: Locator
  readonly sprintList: Locator
  
  // Forms
  readonly challengeForm: Locator
  readonly sprintForm: Locator
  readonly assignmentPicker: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // List page elements
    this.createButton = page.getByRole('button', { name: /create|new challenge/i })
    this.challengeList = page.locator('[class*="challenge-list"], [class*="grid"]')
    this.searchInput = page.getByPlaceholder(/search/i)
    
    // Detail page elements
    this.challengeTitle = page.getByRole('heading', { level: 1 })
    this.editChallengeButton = page.getByRole('button', { name: /edit challenge/i })
    this.previewButton = page.getByRole('link', { name: /preview/i })
    this.slugDisplay = page.locator('code').filter({ hasText: '/c/' })
    
    // Assignment section
    this.assignmentSection = page.locator('text=Assignments').locator('..')
    this.libraryButton = page.getByRole('button', { name: /library/i })
    this.createAssignmentButton = page.getByRole('button', { name: /create new/i })
    this.assignmentList = page.locator('[class*="assignment"], [class*="sortable"]')
    
    // Sprint section
    this.sprintSection = page.locator('text=Sprints').locator('..')
    this.createSprintButton = page.getByRole('button', { name: /create sprint/i })
    this.sprintList = page.locator('[class*="sprint-list"]')
    
    // Forms/Dialogs
    this.challengeForm = page.locator('[role="dialog"]').filter({ hasText: /challenge/i })
    this.sprintForm = page.locator('[role="dialog"]').filter({ hasText: /sprint/i })
    this.assignmentPicker = page.locator('[role="dialog"]').filter({ hasText: /library|assignment/i })
  }
  
  async gotoList() {
    await this.page.goto('/admin/challenges')
    await this.page.waitForLoadState('networkidle')
  }
  
  async gotoDetail(challengeId: string) {
    await this.page.goto(`/admin/challenges/${challengeId}`)
    await this.page.waitForLoadState('networkidle')
  }
  
  async expectListLoaded() {
    await expect(this.page.getByRole('heading', { name: /challenges/i })).toBeVisible()
  }
  
  async expectDetailLoaded() {
    await expect(this.challengeTitle).toBeVisible()
  }
  
  // Challenge CRUD
  async openCreateChallengeForm() {
    await this.createButton.click()
    await expect(this.challengeForm).toBeVisible()
  }
  
  async openEditChallengeForm() {
    await this.editChallengeButton.click()
    await expect(this.challengeForm).toBeVisible()
  }
  
  async fillChallengeForm(options: {
    internalName?: string
    publicTitle?: string
    description?: string
    slug?: string
    brandColor?: string
    enableSprints?: boolean
    enableAnnouncements?: boolean
    enableMilestones?: boolean
  }) {
    if (options.internalName) {
      await this.challengeForm.getByLabel(/internal.*name|name/i).first().fill(options.internalName)
    }
    
    if (options.publicTitle) {
      await this.challengeForm.getByLabel(/public.*title/i).first().fill(options.publicTitle)
    }
    
    if (options.slug) {
      await this.challengeForm.getByLabel(/slug|url/i).first().fill(options.slug)
    }
    
    if (options.brandColor) {
      const colorInput = this.challengeForm.locator('input[type="color"]')
      if (await colorInput.isVisible().catch(() => false)) {
        await colorInput.fill(options.brandColor)
      }
    }
    
    if (options.enableSprints) {
      const toggle = this.challengeForm.getByLabel(/sprint/i)
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.check()
      }
    }
    
    if (options.enableAnnouncements) {
      const toggle = this.challengeForm.getByLabel(/announcement/i)
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.check()
      }
    }
    
    if (options.description) {
      const editor = this.challengeForm.locator('.ProseMirror').first()
      if (await editor.isVisible().catch(() => false)) {
        await editor.click()
        await this.page.keyboard.type(options.description)
      }
    }
  }
  
  async submitChallengeForm() {
    await this.challengeForm.getByRole('button', { name: /create|save/i }).click()
    await expect(this.challengeForm).toBeHidden({ timeout: 10000 })
  }
  
  async getSlug(): Promise<string> {
    const text = await this.slugDisplay.textContent() || ''
    return text.replace('/c/', '').trim()
  }
  
  async clickPreview(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.previewButton.click()
    ])
    await newPage.waitForLoadState('networkidle')
    return newPage
  }
  
  // Sprint operations
  async openCreateSprintForm() {
    await this.createSprintButton.click()
    await expect(this.sprintForm).toBeVisible()
  }
  
  async fillSprintForm(options: {
    name?: string
    subtitle?: string
    description?: string
    password?: string
    coverImage?: string
    startDate?: string
    endDate?: string
    introVideoUrl?: string
    recapVideoUrl?: string
  }) {
    if (options.name) {
      await this.sprintForm.getByLabel(/name/i).first().fill(options.name)
    }
    
    if (options.subtitle) {
      await this.sprintForm.getByLabel(/subtitle/i).first().fill(options.subtitle)
    }
    
    if (options.password) {
      await this.sprintForm.getByLabel(/password/i).first().fill(options.password)
    }
    
    if (options.coverImage) {
      const fileInput = this.sprintForm.locator('input[type="file"]').first()
      await fileInput.setInputFiles(options.coverImage)
      // Wait for upload
      await this.page.waitForTimeout(2000)
    }
    
    if (options.startDate) {
      await this.sprintForm.getByLabel(/start.*date/i).first().fill(options.startDate)
    }
    
    if (options.endDate) {
      await this.sprintForm.getByLabel(/end.*date/i).first().fill(options.endDate)
    }
    
    if (options.introVideoUrl) {
      await this.sprintForm.getByLabel(/intro.*video/i).first().fill(options.introVideoUrl)
    }
    
    if (options.recapVideoUrl) {
      await this.sprintForm.getByLabel(/recap.*video/i).first().fill(options.recapVideoUrl)
    }
    
    if (options.description) {
      const editor = this.sprintForm.locator('.ProseMirror').first()
      if (await editor.isVisible().catch(() => false)) {
        await editor.click()
        await this.page.keyboard.type(options.description)
      }
    }
  }
  
  async submitSprintForm() {
    await this.sprintForm.getByRole('button', { name: /create|save/i }).click()
    await expect(this.sprintForm).toBeHidden({ timeout: 10000 })
  }
  
  async getSprintCount(): Promise<number> {
    const sprints = this.page.locator('[class*="sprint"]')
    return await sprints.count()
  }
  
  async editSprint(sprintName: string) {
    const sprint = this.page.getByText(sprintName).locator('..')
    await sprint.getByRole('button', { name: /edit/i }).click()
    await expect(this.sprintForm).toBeVisible()
  }
  
  // Assignment operations
  async openAssignmentLibrary() {
    await this.libraryButton.click()
    await expect(this.assignmentPicker).toBeVisible()
  }
  
  async selectAssignmentFromLibrary(assignmentTitle: string) {
    await this.assignmentPicker.getByText(assignmentTitle).click()
    // Handle any version/variant dialog that may appear
    const addButton = this.assignmentPicker.getByRole('button', { name: /add|select/i })
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click()
    }
  }
  
  async openCreateAssignmentForm() {
    await this.createAssignmentButton.click()
  }
  
  async getAssignmentCount(): Promise<number> {
    // Count assignment rows in the list
    const assignments = this.page.locator('[class*="sortable"] > div, [class*="assignment-row"]')
    return await assignments.count()
  }
  
  async clickAssignmentPreview(assignmentTitle: string): Promise<Page> {
    const row = this.page.getByText(assignmentTitle).locator('..').locator('..')
    const previewLink = row.locator('a[target="_blank"]').first()
    
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      previewLink.click()
    ])
    await newPage.waitForLoadState('networkidle')
    return newPage
  }
  
  async copyAssignmentLink(assignmentTitle: string) {
    const row = this.page.getByText(assignmentTitle).locator('..').locator('..')
    const copyButton = row.getByRole('button', { name: /copy/i })
    await copyButton.click()
  }
}
