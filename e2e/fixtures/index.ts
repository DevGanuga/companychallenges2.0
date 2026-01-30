/**
 * E2E Test Fixtures
 * 
 * Central export for all test fixtures
 */

import { test as authTest, expect as authExpect, type AuthFixture } from './auth.fixture'
import { test as adminTest, expect as adminExpect, type AdminFixture, type TestClient, type TestChallenge, type TestAssignment, type TestSprint } from './admin.fixture'
import { test as dataTest, expect as dataExpect, type DataFixture } from './data.fixture'
import { mergeTests } from '@playwright/test'

// Merge all fixtures into a single test function
export const test = mergeTests(authTest, adminTest, dataTest)
export const expect = authExpect

// Export types
export type { AuthFixture, AdminFixture, DataFixture, TestClient, TestChallenge, TestAssignment, TestSprint }

// Re-export individual test functions for selective use
export { authTest, adminTest, dataTest }
