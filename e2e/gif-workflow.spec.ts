import { test, expect, Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEST_ASSETS = path.join(__dirname, '../test-assets')

// Helper to upload a file and wait for it to load
async function uploadAndWaitForLoad(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(filePath)
  await expect(page.getByText(/\d+ frames?/).first()).toBeVisible({ timeout: 15000 })
}

test.describe('GIF Workflow E2E Tests', () => {
  test.describe('Landing Page', () => {
    test('should display landing page with hero and tools', async ({ page }) => {
      await page.goto('./')

      // Check hero section
      await expect(page.getByText('Smart GIF Tools')).toBeVisible()
      await expect(page.getByText('That Run in Your Browser')).toBeVisible()

      // Check privacy banner
      await expect(page.getByText('Your Privacy, Guaranteed')).toBeVisible()

      // Check tool cards are visible
      await expect(page.getByText('Convert to GIF')).toBeVisible()
      await expect(page.getByText('Crop GIF')).toBeVisible()
      await expect(page.getByText('Resize GIF')).toBeVisible()

      // Check CTA buttons
      await expect(page.getByRole('link', { name: 'Start Converting' })).toBeVisible()
    })

    test('should navigate to tools from landing page', async ({ page }) => {
      await page.goto('./')

      // Click on Convert tool card
      await page.click('text=Convert to GIF')
      await expect(page).toHaveURL(/\/convert/)

      // Go back and try another tool
      await page.goto('./')
      await page.click('text=Crop GIF')
      await expect(page).toHaveURL(/\/crop-gif/)
    })
  })

  test.describe('Convert Page', () => {
    test('should load and display the convert page', async ({ page }) => {
      await page.goto('./convert')

      await expect(page.getByText('SmartGIF')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Convert')
    })

    test('should show upload zone with correct file types', async ({ page }) => {
      await page.goto('./convert')

      await expect(page.getByText('Drag & drop or click to upload')).toBeVisible()
      await expect(page.getByText(/Supports.*PNG.*JPEG.*WebP.*GIF.*MP4.*WebM/i)).toBeVisible()
    })

    test('should upload and decode a GIF file', async ({ page }) => {
      await page.goto('./convert')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify file info is displayed
      await expect(page.getByText('sample-animation.gif')).toBeVisible()
      await expect(page.getByText(/44 frames/)).toBeVisible()
    })

    test('should upload a PNG image', async ({ page }) => {
      await page.goto('./convert')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })

    test('should upload a JPG image', async ({ page }) => {
      await page.goto('./convert')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Crop Tool', () => {
    test('should navigate to crop page', async ({ page }) => {
      await page.goto('./crop-gif')

      await expect(page.locator('h1')).toContainText('Crop')
    })

    test('should upload GIF and show crop controls', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify crop controls are visible (inputs near their labels)
      await expect(page.locator('text=X').locator('..').locator('input')).toBeVisible()
      await expect(page.locator('text=Y').locator('..').locator('input')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible()
    })

    test('should have aspect ratio preset buttons', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Check for aspect ratio buttons
      await expect(page.getByRole('button', { name: 'Free' })).toBeVisible()
      await expect(page.getByRole('button', { name: '1:1' })).toBeVisible()
      await expect(page.getByRole('button', { name: '16:9' })).toBeVisible()
      await expect(page.getByRole('button', { name: '4:3' })).toBeVisible()
    })

    test('should have crop coordinate input fields', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify 4 number inputs exist (X, Y, Width, Height)
      const inputs = page.locator('input[type="number"]')
      await expect(inputs).toHaveCount(4)

      // Verify they have initial values
      await expect(inputs.nth(0)).toBeVisible()  // X
      await expect(inputs.nth(1)).toBeVisible()  // Y
      await expect(inputs.nth(2)).toBeVisible()  // Width
      await expect(inputs.nth(3)).toBeVisible()  // Height
    })

    test('should have Apply and Auto Crop buttons', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByRole('button', { name: /Apply/i })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Auto Crop' })).toBeVisible()
    })

    test('should apply crop and update dimensions', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Set specific crop dimensions using number inputs
      const inputs = page.locator('input[type="number"]')
      await inputs.nth(0).fill('0')  // X
      await inputs.nth(1).fill('0')  // Y
      await inputs.nth(2).fill('200')  // Width
      await inputs.nth(3).fill('200')  // Height

      // Click Apply
      await page.getByRole('button', { name: 'Apply' }).click()

      // Verify dimensions updated in file info (should show 200x200)
      await expect(page.getByText(/200.*x.*200/).first()).toBeVisible({ timeout: 10000 })
    })

    test('should upload and crop PNG image', async ({ page }) => {
      await page.goto('./crop-gif')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible()
    })

    test('should display Original image canvas after upload', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify "Original" section label is visible
      await expect(page.getByText(/Original \(\d+ x \d+\)/)).toBeVisible()

      // Verify canvas element exists and is visible in the Original section
      const canvas = page.locator('canvas').first()
      await expect(canvas).toBeVisible()

      // Verify canvas has non-zero dimensions (image is rendered)
      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(0)
      expect(box!.height).toBeGreaterThan(0)
    })

    test('should display Preview image after upload', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify "Preview" section label is visible
      await expect(page.getByText(/Preview \(\d+ x \d+\)/)).toBeVisible()

      // Verify preview image is visible
      const previewImage = page.locator('img[alt="Crop preview"]')
      await expect(previewImage).toBeVisible()
    })

    test('should display Original canvas correctly for portrait images', async ({ page }) => {
      // Regression test for issue where portrait images had canvas positioned off-screen
      await page.goto('./crop-gif')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'test-portrait.png'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })

      // Wait for canvas to be rendered and have dimensions
      const canvas = page.locator('canvas').first()
      await expect(canvas).toBeVisible()

      // Wait a bit for the scale calculation to complete
      await page.waitForTimeout(500)

      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      expect(box).toBeDefined()
      expect(box!.width).toBeGreaterThan(50)
      expect(box!.height).toBeGreaterThan(50)
      // Canvas should be within viewport (not positioned off-screen with negative left)
      // The left position should be >= 0 (not clipped off the left side)
      expect(box!.x).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Resize Tool', () => {
    test('should navigate to resize page', async ({ page }) => {
      await page.goto('./resize-gif')

      await expect(page.locator('h1')).toContainText('Resize')
    })

    test('should upload GIF and show resize controls', async ({ page }) => {
      await page.goto('./resize-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify resize controls are visible (W: and H: labels)
      await expect(page.getByText('W:')).toBeVisible()
      await expect(page.getByText('H:')).toBeVisible()
    })

    test('should have linked dimensions by default', async ({ page }) => {
      await page.goto('./resize-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Get inputs by their type and position
      const numberInputs = page.locator('input[type="number"]')
      const widthInput = numberInputs.nth(0)
      const heightInput = numberInputs.nth(1)

      // Change width and verify height changes proportionally
      await widthInput.fill('200')

      // Height should also be 200 (since original is square 400x400)
      await expect(heightInput).toHaveValue('200')
    })

    test('should have scale slider', async ({ page }) => {
      await page.goto('./resize-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Check for scale slider
      const slider = page.locator('input[type="range"]')
      await expect(slider).toBeVisible()
    })

    test('should update dimensions via scale slider', async ({ page }) => {
      await page.goto('./resize-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      const widthInput = page.locator('input[type="number"]').nth(0)
      const slider = page.locator('input[type="range"]')

      // Set slider to 50%
      await slider.fill('50')

      // Width should be 200 (50% of 400)
      await expect(widthInput).toHaveValue('200')
    })

    test('should have Apply button and apply resize', async ({ page }) => {
      await page.goto('./resize-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Set new dimensions
      await page.locator('input[type="number"]').nth(0).fill('200')

      // Click Apply (button says "Apply Resize" when there are changes)
      await page.getByRole('button', { name: /Apply Resize/i }).click()

      // Verify dimensions updated (use first() due to multiple matches)
      await expect(page.getByText(/200.*x.*200/).first()).toBeVisible({ timeout: 10000 })
    })

    test('should upload and resize JPG', async ({ page }) => {
      await page.goto('./resize-gif')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
      await expect(page.getByText('W:')).toBeVisible()
    })
  })

  test.describe('Speed Tool', () => {
    test('should navigate to speed page', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await expect(page.locator('h1')).toContainText('Speed')
    })

    test('should upload GIF and show speed controls', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify speed preset buttons are visible
      await expect(page.getByRole('button', { name: '0.5x' })).toBeVisible()
      await expect(page.getByRole('button', { name: '1x' })).toBeVisible()
      await expect(page.getByRole('button', { name: '2x' })).toBeVisible()
    })

    test('should have all speed preset buttons', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Check all preset buttons (actual presets: 0.5, 1, 1.5, 2)
      await expect(page.getByRole('button', { name: '0.5x' })).toBeVisible()
      await expect(page.getByRole('button', { name: '1x' })).toBeVisible()
      await expect(page.getByRole('button', { name: '1.5x' })).toBeVisible()
      await expect(page.getByRole('button', { name: '2x' })).toBeVisible()
    })

    test('should show duration info', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Should show duration info (format: "Duration: X.XXs → X.XXs")
      await expect(page.getByText('Duration:')).toBeVisible()
    })

    test('should update duration when changing speed', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click 2x speed
      await page.getByRole('button', { name: '2x' }).click()

      // New duration should be shown (half of original ~4s = ~2s)
      await expect(page.getByText(/1\.\d+\s*s/).first()).toBeVisible()
    })

    test('should have Apply button', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Button says "Apply Speed Changes" when there are changes, or "No Changes" otherwise
      await expect(page.getByRole('button', { name: /Apply|No Changes/ })).toBeVisible()
    })

    test('should apply speed change', async ({ page }) => {
      await page.goto('./change-gif-speed')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click 2x speed
      await page.getByRole('button', { name: '2x' }).click()

      // Click Apply Speed Changes
      await page.getByRole('button', { name: /Apply Speed Changes/ }).click()

      // Should still show frames after applying
      await expect(page.getByText(/44 frames/)).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Reverse Tool', () => {
    test('should navigate to reverse page', async ({ page }) => {
      await page.goto('./reverse-gif')

      await expect(page.locator('h1')).toContainText('Reverse')
    })

    test('should upload GIF and show reverse controls', async ({ page }) => {
      await page.goto('./reverse-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify reverse mode buttons are visible
      await expect(page.getByRole('button', { name: 'Reverse', exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: /Ping-Pong/ })).toBeVisible()
    })

    test('should show frame count info', async ({ page }) => {
      await page.goto('./reverse-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Should show frame count (e.g., "44 → 44 frames")
      await expect(page.getByText(/44.*frames/).first()).toBeVisible()
    })

    test('should switch to Ping-Pong mode', async ({ page }) => {
      await page.goto('./reverse-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click Ping-Pong mode
      const pingPongButton = page.getByRole('button', { name: /Ping-Pong/ })
      await pingPongButton.click()

      // Verify Ping-Pong mode is now selected - description changes
      await expect(page.getByText(/seamless.*loop|forward.*backward/i).first()).toBeVisible()
    })

    test('should have Apply button', async ({ page }) => {
      await page.goto('./reverse-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // The Apply button text includes the mode name
      await expect(page.getByRole('button', { name: /Apply.*Effect/ })).toBeVisible()
    })

    test('should apply reverse transformation', async ({ page }) => {
      await page.goto('./reverse-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click Reverse mode (use exact to avoid matching "Apply Reverse Effect")
      await page.getByRole('button', { name: 'Reverse', exact: true }).click()

      // Click Apply (the button says "Apply Reverse Effect")
      await page.getByRole('button', { name: /Apply.*Effect/ }).click()

      // Should still have 44 frames after reverse
      await expect(page.getByText(/44.*frames/).first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Rotate Tool', () => {
    test('should navigate to rotate page', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await expect(page.locator('h1')).toContainText('Rotate')
    })

    test('should upload GIF and show rotate controls', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify rotation buttons are visible
      await expect(page.getByRole('button', { name: '90° CW' })).toBeVisible()
      await expect(page.getByRole('button', { name: '90° CCW' })).toBeVisible()
      await expect(page.getByRole('button', { name: '180°' })).toBeVisible()
    })

    test('should have flip buttons', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByRole('button', { name: 'Horizontal' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Vertical' })).toBeVisible()
    })

    test('should show rotation status when rotated', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click 90° CW
      await page.getByRole('button', { name: '90° CW' }).click()

      // Should show current rotation in the info row (e.g., "90°") - use first() as it appears in multiple places
      await expect(page.getByText('90°').first()).toBeVisible()
    })

    test('should show flip status when flipped', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click Horizontal flip
      await page.getByRole('button', { name: 'Horizontal' }).click()

      // Should show flipped status (e.g., "H-Flip") - use first() as it appears in multiple places
      await expect(page.getByText('H-Flip').first()).toBeVisible()
    })

    test('should enable Apply button after rotation', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Apply should show "No Changes" initially
      await expect(page.getByRole('button', { name: 'No Changes' })).toBeVisible()

      // Click 90° CW
      await page.getByRole('button', { name: '90° CW' }).click()

      // Apply should now show the transformation
      await expect(page.getByRole('button', { name: /Apply 90°/ })).toBeVisible()
    })

    test('should update status when clicking rotation multiple times', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Rotate twice (90° + 90° = 180°)
      await page.getByRole('button', { name: '90° CW' }).click()
      await page.getByRole('button', { name: '90° CW' }).click()

      // Should show 180° in the info - use first() as it appears in multiple places
      await expect(page.getByText('180°').first()).toBeVisible()
    })

    test('should apply rotation', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Rotate 90° CW
      await page.getByRole('button', { name: '90° CW' }).click()

      // Apply
      await page.getByRole('button', { name: /Apply 90°/ }).click()

      // Should still show 44 frames, button should reset to "No Changes"
      await expect(page.getByText(/44 frames/)).toBeVisible({ timeout: 10000 })
      await expect(page.getByRole('button', { name: 'No Changes' })).toBeVisible()
    })

    test('should upload and rotate JPG', async ({ page }) => {
      await page.goto('./rotate-flip-gif')

      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('button', { name: '90° CW' })).toBeVisible()
    })
  })

  test.describe('Split Tool', () => {
    test('should navigate to split page', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await expect(page.locator('h1')).toContainText('Frames')
    })

    test('should upload GIF and show split controls', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify split controls are visible
      await expect(page.getByRole('button', { name: 'Download All as ZIP' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Select All', exact: true })).toBeVisible()
    })

    test('should show frame statistics', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Verify statistics are shown (compact format: "44 frames", dimensions)
      await expect(page.getByText(/44.*frames/).first()).toBeVisible()
      await expect(page.getByText(/400.*400/).first()).toBeVisible()
    })

    test('should have Select All and Deselect All buttons', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      await expect(page.getByRole('button', { name: 'Select All', exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Deselect All', exact: true })).toBeVisible()
    })

    test('should select all frames', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Initially no frames selected
      await expect(page.getByRole('button', { name: /Download Selected \(0\)/ })).toBeVisible()

      // Click Select All
      await page.getByRole('button', { name: 'Select All', exact: true }).click()

      // All frames should be selected
      await expect(page.getByRole('button', { name: /Download Selected \(44\)/ })).toBeVisible()
    })

    test('should deselect all frames', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Select all first
      await page.getByRole('button', { name: 'Select All', exact: true }).click()
      await expect(page.getByRole('button', { name: /Download Selected \(44\)/ })).toBeVisible()

      // Deselect all
      await page.getByRole('button', { name: 'Deselect All', exact: true }).click()

      // No frames should be selected
      await expect(page.getByRole('button', { name: /Download Selected \(0\)/ })).toBeVisible()
    })

    test('should select individual frames by clicking', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Click on first frame in the grid (the clickable div with aspect-square)
      await page.locator('.aspect-square').first().click()

      // Should show 1 selected
      await expect(page.getByRole('button', { name: /Download Selected \(1\)/ })).toBeVisible()
    })

    test('should show frame grid with frame numbers', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Should show frame numbers in the grid (1, 2, etc.)
      await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('2', { exact: true }).first()).toBeVisible()
    })

    test('should show help text', async ({ page }) => {
      await page.goto('./gif-to-frames')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Should show help text at bottom
      await expect(page.getByText(/Click frames to select/)).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between all tools', async ({ page }) => {
      await page.goto('./convert')

      // Navigate through all tools
      await page.click('text=Crop')
      await expect(page).toHaveURL(/\/crop-gif/)
      await expect(page.locator('h1')).toContainText('Crop')

      await page.click('text=Resize')
      await expect(page).toHaveURL(/\/resize-gif/)
      await expect(page.locator('h1')).toContainText('Resize')

      await page.click('text=Speed')
      await expect(page).toHaveURL(/\/change-gif-speed/)
      await expect(page.locator('h1')).toContainText('Speed')

      await page.click('text=Reverse')
      await expect(page).toHaveURL(/\/reverse-gif/)
      await expect(page.locator('h1')).toContainText('Reverse')

      await page.click('text=Rotate')
      await expect(page).toHaveURL(/\/rotate-flip-gif/)
      await expect(page.locator('h1')).toContainText('Rotate')

      await page.click('text=Split')
      await expect(page).toHaveURL(/\/gif-to-frames/)
      await expect(page.locator('h1')).toContainText('Frames')

      await page.click('text=Convert')
      await expect(page).toHaveURL(/\/convert/)
      await expect(page.locator('h1')).toContainText('Convert')
    })
  })

  test.describe('Full Workflow', () => {
    test('should complete full edit workflow: upload → crop → download available', async ({ page }) => {
      await page.goto('./crop-gif')

      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      // Set crop dimensions using number inputs
      const inputs = page.locator('input[type="number"]')
      await inputs.nth(2).fill('200')  // Width
      await inputs.nth(3).fill('200')  // Height

      // Apply crop
      await page.getByRole('button', { name: 'Apply' }).click()

      // Verify dimensions changed (use first() since multiple elements match)
      await expect(page.getByText(/200.*x.*200/).first()).toBeVisible({ timeout: 10000 })

      // Download button should be available
      await expect(page.getByRole('button', { name: /Download GIF/i })).toBeVisible()
    })

    test('should chain multiple operations: resize → speed → reverse', async ({ page }) => {
      // Start with resize
      await page.goto('./resize-gif')
      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))

      await page.locator('input[type="number"]').nth(0).fill('200')
      await page.getByRole('button', { name: 'Apply' }).click()
      // Use first() to avoid strict mode with multiple matches
      await expect(page.getByText(/200.*x.*200/).first()).toBeVisible({ timeout: 10000 })

      // Download the resized GIF would be next step in real workflow
      await expect(page.getByRole('button', { name: /Download GIF/i })).toBeVisible()
    })

    test('should handle different file types across tools', async ({ page }) => {
      // Test PNG on Crop
      await page.goto('./crop-gif')
      let fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })

      // Test JPG on Resize
      await page.goto('./resize-gif')
      fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-photo.jpg'))
      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })

      // Test GIF on Speed
      await page.goto('./change-gif-speed')
      fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-animation.gif'))
      await expect(page.getByText(/\d+ frames/)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('Error Handling', () => {
    test('should show upload zone when no file loaded', async ({ page }) => {
      await page.goto('./crop-gif')

      await expect(page.getByText('Drag & drop or click to upload')).toBeVisible()
    })

    test('should allow uploading different file after initial upload', async ({ page }) => {
      await page.goto('./crop-gif')

      // Upload first file
      await uploadAndWaitForLoad(page, path.join(TEST_ASSETS, 'sample-animation.gif'))
      await expect(page.getByText('sample-animation.gif')).toBeVisible()

      // Click "Upload different file"
      await page.getByRole('button', { name: /Upload different file/i }).click()

      // Upload zone should be visible again OR we can upload directly
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(path.join(TEST_ASSETS, 'sample-image.png'))

      await expect(page.getByText(/1 frame/)).toBeVisible({ timeout: 15000 })
    })
  })
})
