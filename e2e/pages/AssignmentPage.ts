import { Page, Locator, expect } from '@playwright/test'

/**
 * Assignment Page Object Model
 * 
 * Provides methods for interacting with assignment management pages
 */
export class AssignmentPage {
  readonly page: Page
  
  // Assignment list page
  readonly createButton: Locator
  readonly importButton: Locator
  readonly exportButton: Locator
  readonly searchInput: Locator
  readonly filterDropdown: Locator
  readonly assignmentList: Locator
  
  // Assignment form (dialog)
  readonly assignmentForm: Locator
  readonly internalTitleInput: Locator
  readonly publicTitleInput: Locator
  readonly subtitleInput: Locator
  readonly slugInput: Locator
  readonly contentTypeSelect: Locator
  readonly instructionsEditor: Locator
  readonly contentEditor: Locator
  readonly coverImageUpload: Locator
  readonly videoUrlInput: Locator
  readonly videoFileUpload: Locator
  readonly passwordInput: Locator
  readonly passwordRememberCheckbox: Locator
  readonly removePasswordCheckbox: Locator
  readonly tagsInput: Locator
  readonly saveToLibraryCheckbox: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly previewLink: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // List page elements
    this.createButton = page.getByRole('button', { name: /create|new assignment/i })
    this.importButton = page.getByRole('button', { name: /import/i })
    this.exportButton = page.getByRole('button', { name: /export/i })
    this.searchInput = page.getByPlaceholder(/search/i)
    this.filterDropdown = page.getByRole('combobox').first()
    this.assignmentList = page.locator('[class*="assignment-list"], table')
    
    // Form elements
    this.assignmentForm = page.locator('[role="dialog"], .fixed').filter({ has: page.getByText(/assignment/i) })
    this.internalTitleInput = page.getByLabel(/internal.*title/i)
    this.publicTitleInput = page.getByLabel(/public.*title/i)
    this.subtitleInput = page.getByLabel(/subtitle/i)
    this.slugInput = page.locator('input').filter({ hasText: '' }).locator('xpath=ancestor::div[contains(@class, "flex")]//input').first()
    this.contentTypeSelect = page.getByLabel(/content.*type/i)
    this.instructionsEditor = page.locator('[data-placeholder*="instruction"], .ProseMirror').first()
    this.contentEditor = page.locator('[data-placeholder*="task"], [data-placeholder*="content"], .ProseMirror').last()
    this.coverImageUpload = page.locator('input[type="file"][accept*="image"]').first()
    this.videoUrlInput = page.getByLabel(/video.*url/i)
    this.videoFileUpload = page.locator('input[type="file"][accept*="video"]').first()
    this.passwordInput = page.getByLabel(/password/i).filter({ has: page.locator('input[type="text"]') })
    this.passwordRememberCheckbox = page.getByLabel(/remember/i)
    this.removePasswordCheckbox = page.getByLabel(/remove.*password/i)
    this.tagsInput = page.getByLabel(/tags/i)
    this.saveToLibraryCheckbox = page.getByLabel(/save.*library|reuse/i)
    this.submitButton = page.getByRole('button', { name: /create|save/i }).last()
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    this.previewLink = page.getByRole('link', { name: /preview/i })
  }
  
  async gotoList() {
    await this.page.goto('/admin/assignments')
    await this.page.waitForLoadState('networkidle')
  }
  
  async expectListLoaded() {
    await expect(this.page.getByRole('heading', { name: /assignments/i })).toBeVisible()
  }
  
  async expectFormVisible() {
    await expect(this.internalTitleInput).toBeVisible({ timeout: 5000 })
  }
  
  // CRUD operations
  async openCreateForm() {
    await this.createButton.click()
    await this.expectFormVisible()
  }
  
  async editAssignment(title: string) {
    const row = this.page.getByText(title).locator('..').locator('..')
    await row.click()
    await this.expectFormVisible()
  }
  
  async fillForm(options: {
    internalTitle?: string
    publicTitle?: string
    subtitle?: string
    slug?: string
    contentType?: 'standard' | 'video' | 'quiz' | 'announcement'
    instructions?: string
    content?: string
    coverImage?: string
    videoUrl?: string
    videoFile?: string
    password?: string
    passwordRemember?: boolean
    removePassword?: boolean
    tags?: string[]
    saveToLibrary?: boolean
  }) {
    if (options.internalTitle) {
      await this.internalTitleInput.fill(options.internalTitle)
    }
    
    if (options.publicTitle) {
      await this.publicTitleInput.fill(options.publicTitle)
    }
    
    if (options.subtitle) {
      await this.subtitleInput.fill(options.subtitle)
    }
    
    if (options.slug) {
      // Find the slug input by its container
      const slugContainer = this.page.locator('text=/a/').locator('..')
      const input = slugContainer.locator('input')
      if (await input.isVisible().catch(() => false)) {
        await input.fill(options.slug)
      }
    }
    
    if (options.contentType) {
      const select = this.page.locator('select').filter({ has: this.page.locator('option[value="standard"]') })
      if (await select.isVisible().catch(() => false)) {
        await select.selectOption(options.contentType)
      }
    }
    
    if (options.instructions) {
      await this.instructionsEditor.click()
      await this.page.keyboard.press('ControlOrMeta+a')
      await this.page.keyboard.type(options.instructions)
    }
    
    if (options.content) {
      await this.contentEditor.click()
      await this.page.keyboard.press('ControlOrMeta+a')
      await this.page.keyboard.type(options.content)
    }
    
    if (options.coverImage) {
      await this.coverImageUpload.setInputFiles(options.coverImage)
      // Wait for upload
      await this.page.waitForTimeout(2000)
    }
    
    if (options.videoUrl) {
      const videoInput = this.page.getByPlaceholder(/youtube|vimeo|url/i)
      if (await videoInput.isVisible().catch(() => false)) {
        await videoInput.fill(options.videoUrl)
      }
    }
    
    if (options.videoFile) {
      await this.videoFileUpload.setInputFiles(options.videoFile)
      // Wait for upload (videos can take longer)
      await this.page.waitForTimeout(5000)
    }
    
    if (options.password !== undefined) {
      const passwordField = this.page.locator('input[autocomplete="off"]').filter({ has: this.page.locator('xpath=ancestor::div[contains(text(), "Password")]') })
      const simplePasswordField = this.page.getByPlaceholder(/password/i)
      
      if (await simplePasswordField.isVisible().catch(() => false)) {
        await simplePasswordField.fill(options.password)
      } else if (await passwordField.isVisible().catch(() => false)) {
        await passwordField.fill(options.password)
      }
    }
    
    if (options.passwordRemember !== undefined) {
      const checkbox = this.page.getByLabel(/remember/i)
      if (await checkbox.isVisible().catch(() => false)) {
        if (options.passwordRemember) {
          await checkbox.check()
        } else {
          await checkbox.uncheck()
        }
      }
    }
    
    if (options.removePassword) {
      const checkbox = this.page.getByLabel(/remove.*password/i)
      if (await checkbox.isVisible().catch(() => false)) {
        await checkbox.check()
      }
    }
    
    if (options.tags && options.tags.length > 0) {
      const tagsInput = this.page.getByPlaceholder(/tag|enter/i)
      if (await tagsInput.isVisible().catch(() => false)) {
        for (const tag of options.tags) {
          await tagsInput.fill(tag)
          await this.page.keyboard.press('Enter')
        }
      }
    }
    
    if (options.saveToLibrary !== undefined) {
      const checkbox = this.page.getByLabel(/library|reuse/i)
      if (await checkbox.isVisible().catch(() => false)) {
        if (options.saveToLibrary) {
          await checkbox.check()
        } else {
          await checkbox.uncheck()
        }
      }
    }
  }
  
  async submitForm() {
    await this.submitButton.click()
    // Wait for form to close or success indication
    await this.page.waitForTimeout(1000)
  }
  
  async closeForm() {
    await this.cancelButton.click()
    await expect(this.assignmentForm).toBeHidden()
  }
  
  // Verification methods
  async expectPasswordFieldType(type: 'text' | 'password') {
    const passwordField = this.page.locator('input').filter({ hasText: '' }).filter({ has: this.page.locator(`[type="${type}"]`) })
    // The password field should be type="text" for visibility (gamification)
    const visiblePasswordInput = this.page.getByPlaceholder(/password/i)
    const inputType = await visiblePasswordInput.getAttribute('type')
    expect(inputType).toBe(type)
  }
  
  async expectPasswordAutocompleteDisabled() {
    const passwordField = this.page.getByPlaceholder(/password/i)
    const autocomplete = await passwordField.getAttribute('autocomplete')
    expect(autocomplete).toBe('off')
  }
  
  async getDisplayedSlug(): Promise<string> {
    const slugDisplay = this.page.locator('code').filter({ hasText: '/a/' })
    const text = await slugDisplay.textContent() || ''
    return text.replace('/a/', '').trim()
  }
  
  async clickPreview(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.previewLink.click()
    ])
    await newPage.waitForLoadState('networkidle')
    return newPage
  }
  
  // Search and filter
  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Debounce
  }
  
  async filterByContentType(type: 'all' | 'standard' | 'video' | 'quiz' | 'announcement') {
    await this.filterDropdown.click()
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click()
  }
  
  async getAssignmentCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, [class*="assignment-row"]')
    return await rows.count()
  }
  
  // Delete operations
  async deleteAssignment(title: string) {
    const row = this.page.getByText(title).locator('..').locator('..')
    const deleteButton = row.getByRole('button', { name: /delete|archive/i })
    await deleteButton.click()
    
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i })
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click()
    }
  }
}
