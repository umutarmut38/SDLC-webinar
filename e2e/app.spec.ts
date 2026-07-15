import { expect, test } from '@playwright/test'

test.describe('Cloud Deployment Visualizer', () => {
  test('loads the application shell', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Cloud Deployment Visualizer/)
    await expect(
      page.getByRole('heading', { name: '3D Cloud Deployment Visualizer' }),
    ).toBeVisible()
  })

  test('exposes the future visualizer contract', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('visualization-root')).toBeVisible()
    await expect(
      page.getByRole('group', { name: 'Deployment stages' }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Plan' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Deploy' })).toBeVisible()
  })

  test('runs the end-to-end delivery probe', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('delivery-probe-status')).toHaveText(
      'Delivery probe ready.',
    )
    await page.getByRole('button', { name: 'Run delivery probe' }).click()
    await expect(page.getByTestId('delivery-probe-status')).toHaveText(
      'Delivery probe passed. This build is ready for remote verification.',
    )
    await expect(
      page.getByRole('button', { name: 'Probe passed' }),
    ).toBeDisabled()
  })
})
