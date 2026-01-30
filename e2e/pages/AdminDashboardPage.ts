import { Page, Locator, expect } from '@playwright/test'

/**
 * Admin Dashboard Page Object Model
 * 
 * Provides methods for interacting with the admin dashboard
 */
export class AdminDashboardPage {
  readonly page: Page
  
  // Locators
  readonly heading: Locator
  readonly statsSection: Locator
  readonly clientCount: Locator
  readonly challengeCount: Locator
  readonly assignmentCount: Locator
  readonly recentActivity: Locator
  
  // Navigation
  readonly navClients: Locator
  readonly navChallenges: Locator
  readonly navAssignments: Locator
  readonly navAnalytics: Locator
  readonly navSettings: Locator
  
  constructor(page: Page) {
    this.page = page
    
    // Main content
    this.heading = page.getByRole('heading', { level: 1 })
    this.statsSection = page.locator('[class*="stat"], [class*="metric"], [class*="card"]').first()
    this.clientCount = page.getByText(/client/i).locator('..').locator('[class*="count"], [class*="number"]')
    this.challengeCount = page.getByText(/challenge/i).locator('..').locator('[class*="count"], [class*="number"]')
    this.assignmentCount = page.getByText(/assignment/i).locator('..').locator('[class*="count"], [class*="number"]')
    this.recentActivity = page.locator('[class*="activity"], [class*="recent"]')
    
    // Navigation links
    this.navClients = page.getByRole('link', { name: /clients/i })
    this.navChallenges = page.getByRole('link', { name: /challenges/i })
    this.navAssignments = page.getByRole('link', { name: /assignments/i })
    this.navAnalytics = page.getByRole('link', { name: /analytics/i })
    this.navSettings = page.getByRole('link', { name: /settings/i })
  }
  
  async goto() {
    await this.page.goto('/admin')
    await this.page.waitForLoadState('networkidle')
  }
  
  async expectLoaded() {
    await expect(this.heading).toBeVisible()
  }
  
  async getClientCount(): Promise<number> {
    const text = await this.clientCount.textContent() || '0'
    return parseInt(text.replace(/\D/g, ''), 10)
  }
  
  async getChallengeCount(): Promise<number> {
    const text = await this.challengeCount.textContent() || '0'
    return parseInt(text.replace(/\D/g, ''), 10)
  }
  
  async getAssignmentCount(): Promise<number> {
    const text = await this.assignmentCount.textContent() || '0'
    return parseInt(text.replace(/\D/g, ''), 10)
  }
  
  async navigateToClients() {
    await this.navClients.click()
    await this.page.waitForURL('/admin/clients')
  }
  
  async navigateToChallenges() {
    await this.navChallenges.click()
    await this.page.waitForURL('/admin/challenges')
  }
  
  async navigateToAssignments() {
    await this.navAssignments.click()
    await this.page.waitForURL('/admin/assignments')
  }
  
  async navigateToAnalytics() {
    await this.navAnalytics.click()
    await this.page.waitForURL('/admin/analytics')
  }
  
  async navigateToSettings() {
    await this.navSettings.click()
    await this.page.waitForURL('/admin/settings')
  }
  
  async refresh() {
    const refreshButton = this.page.getByRole('button', { name: /refresh/i })
    if (await refreshButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await refreshButton.click()
      await this.page.waitForLoadState('networkidle')
    }
  }
}
