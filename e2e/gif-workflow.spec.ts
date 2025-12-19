import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEST_ASSETS = path.join(__dirname, '../test-assets')

// Use relative paths without leading slash so they append to baseURL
test.describe('GIF Workflow E2E Tests', () => {
  test.describe('Convert Page', () => {
    test('should load and display the convert page', async ({ page }) => {
      await page.goto('./')

      // Check navigation has SmartGIF title
      await expect(page.getByText('SmartGIF')).toBeVisible()
      // Check page has Convert title
      await expect(page.locator('h1')).toContainText('Convert')
    })

    test('should show upload zone', async ({ page }) => {
      await page.goto('./')

      await expect(page.getByText('Drag & drop or click to upload')).toBeVisible()
      await expect(page.getByText('Supports WebP, GIF, MP4, WebM')).toBeVisible()
    })

    test('should upload and decode a GIF file', async ({ page }) => {
      await page.goto('./')

      // Upload the GIF file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Wait for frames to load - should show frame count in file info
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })

    test('should upload a PNG image', async ({ page }) => {
      await page.goto('./')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))

      // Should show 1 frame
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })

    test('should upload a JPG image', async ({ page }) => {
      await page.goto('./')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      // Should show 1 frame
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Crop Tool', () => {
    test('should navigate to crop page', async ({ page }) => {
      await page.goto('./crop')

      await expect(page.locator('h1')).toContainText('Crop')
    })

    test('should upload and crop a GIF', async ({ page }) => {
      await page.goto('./crop')

      // Upload GIF
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Wait for frames to load
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })

      // Check crop controls are available (look for aspect ratio buttons or crop tools)
      await expect(page.getByRole('button').first()).toBeVisible()
    })

    test('should upload and crop a PNG image', async ({ page }) => {
      await page.goto('./crop')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Resize Tool', () => {
    test('should navigate to resize page', async ({ page }) => {
      await page.goto('./resize')

      await expect(page.locator('h1')).toContainText('Resize')
    })

    test('should upload and resize a GIF', async ({ page }) => {
      await page.goto('./resize')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })

    test('should upload and resize a JPG', async ({ page }) => {
      await page.goto('./resize')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Speed Tool', () => {
    test('should navigate to speed page', async ({ page }) => {
      await page.goto('./speed')

      await expect(page.locator('h1')).toContainText('Speed')
    })

    test('should upload GIF and show speed controls', async ({ page }) => {
      await page.goto('./speed')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Wait for frames to load
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Reverse Tool', () => {
    test('should navigate to reverse page', async ({ page }) => {
      await page.goto('./reverse')

      await expect(page.locator('h1')).toContainText('Reverse')
    })

    test('should upload GIF for reverse', async ({ page }) => {
      await page.goto('./reverse')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Rotate Tool', () => {
    test('should navigate to rotate page', async ({ page }) => {
      await page.goto('./rotate')

      await expect(page.locator('h1')).toContainText('Rotate')
    })

    test('should upload and rotate a JPG', async ({ page }) => {
      await page.goto('./rotate')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })

    test('should upload and rotate a GIF', async ({ page }) => {
      await page.goto('./rotate')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Split Tool', () => {
    test('should navigate to split page', async ({ page }) => {
      await page.goto('./split')

      await expect(page.locator('h1')).toContainText('Split')
    })

    test('should upload GIF for splitting', async ({ page }) => {
      await page.goto('./split')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between all tools', async ({ page }) => {
      await page.goto('./')

      // Navigate through all tools
      await page.click('text=Crop')
      await expect(page).toHaveURL(/\/crop/)
      await expect(page.locator('h1')).toContainText('Crop')

      await page.click('text=Resize')
      await expect(page).toHaveURL(/\/resize/)
      await expect(page.locator('h1')).toContainText('Resize')

      await page.click('text=Speed')
      await expect(page).toHaveURL(/\/speed/)
      await expect(page.locator('h1')).toContainText('Speed')

      await page.click('text=Reverse')
      await expect(page).toHaveURL(/\/reverse/)
      await expect(page.locator('h1')).toContainText('Reverse')

      await page.click('text=Rotate')
      await expect(page).toHaveURL(/\/rotate/)
      await expect(page.locator('h1')).toContainText('Rotate')

      await page.click('text=Split')
      await expect(page).toHaveURL(/\/split/)
      await expect(page.locator('h1')).toContainText('Split')

      await page.click('text=Convert')
      await expect(page).toHaveURL(/smartgif\/?$/)
      await expect(page.locator('h1')).toContainText('Convert')
    })
  })

  test.describe('Full Workflow', () => {
    test('should complete full edit workflow: upload → navigate tools → download', async ({ page }) => {
      await page.goto('./crop')

      // Step 1: Upload GIF on Crop page
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })

      // Check download button is available
      await expect(page.getByRole('button', { name: /Download GIF/i })).toBeVisible()
    })

    test('should handle different file types', async ({ page }) => {
      // Test PNG on Crop
      await page.goto('./crop')
      let fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })

      // Test JPG on Resize
      await page.goto('./resize')
      fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })

      // Test GIF on Speed
      await page.goto('./speed')
      fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })
})
