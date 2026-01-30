import { Page, Locator, expect } from '@playwright/test'

/**
 * Sprint Page Object Model
 * 
 * Provides methods for interacting with sprint management
 */
export class SprintPage {
  readonly page: Page
  
  // Sprint form (dialog)
  readonly sprintForm: Locator
  readonly nameInput: Locator
  readonly subtitleInput: Locator
  readonly descriptionEditor: Locator
  readonly simpleDescriptionInput: Locator
  readonly coverImageUpload: Locator
  readonly coverImagePreview: Locator
  readonly removeCoverButton: Locator
  readonly passwordInput: Locator
  readonly introVideoUrlInput: Locator
  readonly recapVideoUrlInput: Locator
  readonly startDateInput: Locator
  readonly endDateInput: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  
  // Sprint list elements
  readonly sprintList: Locator
  readonly infoButton: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // Form elements
    this.sprintForm = page.locator('[role="dialog"]').filter({ hasText: /sprint/i })
    this.nameInput = page.getByLabel(/sprint.*name|name/i).first()
    this.subtitleInput = page.getByLabel(/subtitle/i).first()
    this.descriptionEditor = page.locator('.ProseMirror').first()
    this.simpleDescriptionInput = page.getByLabel(/simple.*description/i)
    this.coverImageUpload = page.locator('input[type="file"][accept*="image"]').first()
    this.coverImagePreview = page.locator('img[alt="Cover"]')
    this.removeCoverButton = page.getByRole('button', { name: /remove/i })
    this.passwordInput = page.getByLabel(/password/i).first()
    this.introVideoUrlInput = page.getByLabel(/intro.*video/i)
    this.recapVideoUrlInput = page.getByLabel(/recap.*video/i)
    this.startDateInput = page.getByLabel(/start.*date/i)
    this.endDateInput = page.getByLabel(/end.*date/i)
    this.saveButton = page.getByRole('button', { name: /save/i })
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    
    // List elements
    this.sprintList = page.locator('[class*="sprint-list"]')
    this.infoButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' })
  }
  
  async expectFormVisible() {
    await expect(this.sprintForm).toBeVisible({ timeout: 5000 })
    await expect(this.nameInput).toBeVisible()
  }
  
  async expectFormHidden() {
    await expect(this.sprintForm).toBeHidden({ timeout: 5000 })
  }
  
  // Form operations
  async fillForm(options: {
    name?: string
    subtitle?: string
    description?: string
    simpleDescription?: string
    coverImage?: string
    password?: string
    introVideoUrl?: string
    recapVideoUrl?: string
    startDate?: string
    endDate?: string
  }) {
    if (options.name) {
      await this.nameInput.fill(options.name)
    }
    
    if (options.subtitle) {
      await this.subtitleInput.fill(options.subtitle)
    }
    
    if (options.description) {
      await this.descriptionEditor.click()
      await this.page.keyboard.press('ControlOrMeta+a')
      await this.page.keyboard.type(options.description)
    }
    
    if (options.simpleDescription) {
      await this.simpleDescriptionInput.fill(options.simpleDescription)
    }
    
    if (options.coverImage) {
      await this.coverImageUpload.setInputFiles(options.coverImage)
      // Wait for upload to complete
      await this.page.waitForTimeout(3000)
      // Verify image preview appears
      await expect(this.coverImagePreview).toBeVisible({ timeout: 5000 })
    }
    
    if (options.password) {
      await this.passwordInput.fill(options.password)
    }
    
    if (options.introVideoUrl) {
      await this.introVideoUrlInput.fill(options.introVideoUrl)
    }
    
    if (options.recapVideoUrl) {
      await this.recapVideoUrlInput.fill(options.recapVideoUrl)
    }
    
    if (options.startDate) {
      await this.startDateInput.fill(options.startDate)
    }
    
    if (options.endDate) {
      await this.endDateInput.fill(options.endDate)
    }
  }
  
  async submit() {
    await this.saveButton.click()
    await this.expectFormHidden()
  }
  
  async cancel() {
    await this.cancelButton.click()
    await this.expectFormHidden()
  }
  
  // Verification methods
  async expectPasswordFieldVisible() {
    await expect(this.passwordInput).toBeVisible()
  }
  
  async expectPasswordFieldType(type: 'text' | 'password') {
    const inputType = await this.passwordInput.getAttribute('type')
    expect(inputType).toBe(type)
  }
  
  async expectPasswordValue(value: string) {
    // For text type inputs, we can check the value
    const inputValue = await this.passwordInput.inputValue()
    expect(inputValue).toBe(value)
  }
  
  async expectPasswordPlaceholder(placeholder: string) {
    const actualPlaceholder = await this.passwordInput.getAttribute('placeholder')
    expect(actualPlaceholder).toContain(placeholder)
  }
  
  async expectCoverImageVisible() {
    await expect(this.coverImagePreview).toBeVisible()
  }
  
  async expectCoverImageSrc(expectedSrc: string) {
    const src = await this.coverImagePreview.getAttribute('src')
    expect(src).toContain(expectedSrc)
  }
  
  async expectStartDateValue(value: string) {
    const inputValue = await this.startDateInput.inputValue()
    expect(inputValue).toBe(value)
  }
  
  async expectEndDateValue(value: string) {
    const inputValue = await this.endDateInput.inputValue()
    expect(inputValue).toBe(value)
  }
  
  async expectStartDateEditable() {
    const disabled = await this.startDateInput.isDisabled()
    expect(disabled).toBe(false)
  }
  
  async expectEndDateEditable() {
    const disabled = await this.endDateInput.isDisabled()
    expect(disabled).toBe(false)
  }
  
  // Sprint list operations
  async getSprintByName(name: string): Promise<Locator> {
    return this.page.getByText(name).locator('..').locator('..')
  }
  
  async editSprint(name: string) {
    const sprint = await this.getSprintByName(name)
    await sprint.getByRole('button', { name: /edit/i }).click()
    await this.expectFormVisible()
  }
  
  async deleteSprint(name: string) {
    const sprint = await this.getSprintByName(name)
    await sprint.getByRole('button', { name: /delete/i }).click()
    
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm|yes|delete/i })
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click()
    }
  }
  
  async clickInfoButton() {
    // Find the (i) info button - typically an info icon or button with "i"
    const infoButton = this.page.locator('button svg[class*="info"], button:has(svg) >> nth=0')
    await infoButton.click()
  }
  
  async expectInfoPopoverContent(expectedContent: string) {
    // The info popover should show support info, not password instructions
    const popover = this.page.locator('[role="tooltip"], [class*="popover"]')
    await expect(popover).toContainText(expectedContent)
  }
  
  async expectInfoPopoverNotContain(unexpectedContent: string) {
    const popover = this.page.locator('[role="tooltip"], [class*="popover"]')
    await expect(popover).not.toContainText(unexpectedContent)
  }
}
