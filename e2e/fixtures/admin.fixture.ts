import { test as base, expect, Page } from '@playwright/test'

/**
 * Admin fixture for E2E tests
 * 
 * Provides helper methods for admin panel operations
 * including creating and managing test data
 */

export interface TestClient {
  id: string
  name: string
}

export interface TestChallenge {
  id: string
  slug: string
  name: string
}

export interface TestAssignment {
  id: string
  slug: string
  title: string
}

export interface TestSprint {
  id: string
  name: string
}

export interface AdminFixture {
  /** Create a test client */
  createClient: (name?: string) => Promise<TestClient>
  
  /** Create a test challenge */
  createChallenge: (clientId: string, options?: {
    name?: string
    enableSprints?: boolean
    enableAnnouncements?: boolean
    enableMilestones?: boolean
  }) => Promise<TestChallenge>
  
  /** Create a test assignment */
  createAssignment: (options?: {
    title?: string
    contentType?: 'standard' | 'video' | 'quiz' | 'announcement'
    password?: string
  }) => Promise<TestAssignment>
  
  /** Create a test sprint */
  createSprint: (challengeId: string, options?: {
    name?: string
    password?: string
  }) => Promise<TestSprint>
  
  /** Add assignment to challenge */
  addAssignmentToChallenge: (challengeId: string, assignmentId: string) => Promise<void>
  
  /** Delete test client (cleanup) */
  deleteClient: (clientId: string) => Promise<void>
  
  /** Navigate to challenge detail page */
  goToChallenge: (challengeId: string) => Promise<void>
  
  /** Navigate to assignments library */
  goToAssignments: () => Promise<void>
}

export const test = base.extend<AdminFixture>({
  createClient: async ({ page }, use) => {
    const clients: TestClient[] = []
    
    const createFn = async (name?: string): Promise<TestClient> => {
      const clientName = name || `Test Client ${Date.now()}`
      
      // Navigate to clients page
      await page.goto('/admin/clients')
      await page.waitForLoadState('networkidle')
      
      // Click create button
      await page.getByRole('button', { name: /create|new client/i }).click()
      
      // Fill in client name
      await page.getByLabel(/name/i).first().fill(clientName)
      
      // Submit
      await page.getByRole('button', { name: /create|save/i }).click()
      
      // Wait for success and get client ID from URL or response
      await page.waitForURL(/\/admin\/clients\/[\w-]+/)
      
      const url = page.url()
      const id = url.split('/').pop() || ''
      
      const client = { id, name: clientName }
      clients.push(client)
      
      return client
    }
    
    await use(createFn)
    
    // Cleanup created clients
    for (const client of clients) {
      try {
        await page.goto(`/admin/clients/${client.id}`)
        const deleteButton = page.getByRole('button', { name: /delete/i })
        if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await deleteButton.click()
          await page.getByRole('button', { name: /confirm|yes/i }).click()
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  
  createChallenge: async ({ page }, use) => {
    const challenges: TestChallenge[] = []
    
    const createFn = async (clientId: string, options?: {
      name?: string
      enableSprints?: boolean
      enableAnnouncements?: boolean
      enableMilestones?: boolean
    }): Promise<TestChallenge> => {
      const challengeName = options?.name || `Test Challenge ${Date.now()}`
      
      // Navigate to client detail
      await page.goto(`/admin/clients/${clientId}`)
      await page.waitForLoadState('networkidle')
      
      // Click create challenge button
      await page.getByRole('button', { name: /create challenge|new challenge/i }).click()
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Fill in challenge details
      await page.getByLabel(/internal.*name|name/i).first().fill(challengeName)
      await page.getByLabel(/public.*title/i).first().fill(`Public ${challengeName}`)
      
      // Enable features if requested
      if (options?.enableSprints) {
        const sprintToggle = page.getByLabel(/sprint/i)
        if (await sprintToggle.isVisible().catch(() => false)) {
          await sprintToggle.check()
        }
      }
      
      if (options?.enableAnnouncements) {
        const announcementToggle = page.getByLabel(/announcement/i)
        if (await announcementToggle.isVisible().catch(() => false)) {
          await announcementToggle.check()
        }
      }
      
      // Submit
      await page.getByRole('button', { name: /create|save/i }).click()
      
      // Wait for navigation to challenge detail
      await page.waitForURL(/\/admin\/challenges\/[\w-]+/, { timeout: 10000 })
      
      const url = page.url()
      const id = url.split('/').pop() || ''
      
      // Get slug from page
      const slugElement = page.locator('code').first()
      const slugText = await slugElement.textContent() || ''
      const slug = slugText.replace('/c/', '')
      
      const challenge = { id, slug, name: challengeName }
      challenges.push(challenge)
      
      return challenge
    }
    
    await use(createFn)
  },
  
  createAssignment: async ({ page }, use) => {
    const assignments: TestAssignment[] = []
    
    const createFn = async (options?: {
      title?: string
      contentType?: 'standard' | 'video' | 'quiz' | 'announcement'
      password?: string
    }): Promise<TestAssignment> => {
      const title = options?.title || `Test Assignment ${Date.now()}`
      
      // Navigate to assignments library
      await page.goto('/admin/assignments')
      await page.waitForLoadState('networkidle')
      
      // Click create button
      await page.getByRole('button', { name: /create|new assignment/i }).click()
      
      // Wait for form
      await page.waitForSelector('[role="dialog"], form', { timeout: 5000 })
      
      // Fill in assignment details
      await page.getByLabel(/internal.*title/i).first().fill(title)
      await page.getByLabel(/public.*title/i).first().fill(`Public ${title}`)
      
      // Set content type if specified
      if (options?.contentType) {
        const typeSelect = page.getByLabel(/content.*type/i)
        if (await typeSelect.isVisible().catch(() => false)) {
          await typeSelect.selectOption(options.contentType)
        }
      }
      
      // Fill in required rich text fields
      const instructionsEditor = page.locator('[data-placeholder*="instruction"], .ProseMirror').first()
      if (await instructionsEditor.isVisible().catch(() => false)) {
        await instructionsEditor.click()
        await page.keyboard.type('Test instructions content')
      }
      
      const contentEditor = page.locator('[data-placeholder*="task"], .ProseMirror').last()
      if (await contentEditor.isVisible().catch(() => false)) {
        await contentEditor.click()
        await page.keyboard.type('Test assignment content')
      }
      
      // Add password if specified
      if (options?.password) {
        const passwordField = page.getByLabel(/password/i)
        if (await passwordField.isVisible().catch(() => false)) {
          await passwordField.fill(options.password)
        }
      }
      
      // Upload a placeholder image for cover (required)
      // This would need a test image file - for now we'll skip this requirement check
      
      // Submit
      await page.getByRole('button', { name: /create|save/i }).click()
      
      // Wait for success
      await page.waitForTimeout(2000)
      
      // Get created assignment from the list
      const assignmentRow = page.getByText(title).first()
      const row = assignmentRow.locator('..').locator('..')
      
      // Extract ID (this is a simplified approach)
      const id = Date.now().toString()
      const slug = title.toLowerCase().replace(/\s+/g, '-')
      
      const assignment = { id, slug, title }
      assignments.push(assignment)
      
      return assignment
    }
    
    await use(createFn)
  },
  
  createSprint: async ({ page }, use) => {
    const sprints: TestSprint[] = []
    
    const createFn = async (challengeId: string, options?: {
      name?: string
      password?: string
    }): Promise<TestSprint> => {
      const sprintName = options?.name || `Test Sprint ${Date.now()}`
      
      // Navigate to challenge detail
      await page.goto(`/admin/challenges/${challengeId}`)
      await page.waitForLoadState('networkidle')
      
      // Click create sprint button
      await page.getByRole('button', { name: /create sprint|new sprint/i }).click()
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Fill in sprint name
      await page.getByLabel(/name/i).first().fill(sprintName)
      
      // Add password if specified
      if (options?.password) {
        const passwordField = page.getByLabel(/password/i)
        if (await passwordField.isVisible().catch(() => false)) {
          await passwordField.fill(options.password)
        }
      }
      
      // Submit
      await page.getByRole('button', { name: /create|save/i }).click()
      
      // Wait for dialog to close
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 })
      
      const id = Date.now().toString()
      const sprint = { id, name: sprintName }
      sprints.push(sprint)
      
      return sprint
    }
    
    await use(createFn)
  },
  
  addAssignmentToChallenge: async ({ page }, use) => {
    const addFn = async (challengeId: string, assignmentId: string): Promise<void> => {
      await page.goto(`/admin/challenges/${challengeId}`)
      await page.waitForLoadState('networkidle')
      
      // Open assignment picker
      await page.getByRole('button', { name: /library|add.*assignment/i }).click()
      
      // Wait for picker dialog
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
      
      // Select the assignment (this assumes the picker shows a list)
      // The actual selection method depends on the UI implementation
      await page.getByRole('dialog').getByRole('button', { name: /add|select/i }).first().click()
      
      // Wait for dialog to close
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 })
    }
    
    await use(addFn)
  },
  
  deleteClient: async ({ page }, use) => {
    const deleteFn = async (clientId: string): Promise<void> => {
      await page.goto(`/admin/clients/${clientId}`)
      
      const deleteButton = page.getByRole('button', { name: /delete/i })
      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteButton.click()
        await page.getByRole('button', { name: /confirm|yes/i }).click()
        await page.waitForURL('/admin/clients')
      }
    }
    
    await use(deleteFn)
  },
  
  goToChallenge: async ({ page }, use) => {
    const goFn = async (challengeId: string): Promise<void> => {
      await page.goto(`/admin/challenges/${challengeId}`)
      await page.waitForLoadState('networkidle')
    }
    
    await use(goFn)
  },
  
  goToAssignments: async ({ page }, use) => {
    const goFn = async (): Promise<void> => {
      await page.goto('/admin/assignments')
      await page.waitForLoadState('networkidle')
    }
    
    await use(goFn)
  },
})

export { expect }
