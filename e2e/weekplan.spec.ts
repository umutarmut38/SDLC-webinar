import { expect, test } from '@playwright/test'

test.describe('WeekPlan acceptance', () => {
  test('moves and completes sample work, then restores it after reload', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Load example week' }).click()
    const wednesday = page
      .getByRole('heading', { name: 'Wednesday' })
      .locator('xpath=ancestor::article')
    const thursday = page
      .getByRole('heading', { name: 'Thursday' })
      .locator('xpath=ancestor::article')
    await expect(wednesday).toContainText('8h')
    await expect(wednesday).toContainText('Over capacity by 2h')

    await page
      .getByLabel('Move Run stakeholder workshop')
      .selectOption('Thursday')
    await expect(wednesday).toContainText('6h')
    await expect(thursday).toContainText('2h')
    await expect(thursday).toContainText('4h')

    await page
      .getByRole('checkbox', { name: 'Run stakeholder workshop' })
      .check()
    await expect(thursday).toContainText('0m')

    await page.reload()
    await expect(page.getByLabel('Move Run stakeholder workshop')).toHaveValue(
      'Thursday',
    )
    await expect(
      page.getByRole('checkbox', { name: 'Run stakeholder workshop' }),
    ).toBeChecked()
  })

  test('supports task lifecycle, backlog scheduling, and capacity validation', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByLabel(/Task title/).fill('Write release notes')
    await page.getByLabel(/Effort \(minutes\)/).fill('30')
    await page.getByRole('button', { name: 'Add task' }).press('Enter')
    const task = page.locator('.task-item', { hasText: 'Write release notes' })
    await expect(task).toContainText('30m')

    await task.getByRole('button', { name: 'Edit Write release notes' }).click()
    const editor = page.locator('.edit-task-form')
    await editor.getByLabel('Task title').fill('Publish release notes')
    await editor.getByLabel('Effort (minutes)').fill('45')
    await editor.getByRole('button', { name: 'Save changes' }).click()
    const updatedTask = page.locator('.task-item', {
      hasText: 'Publish release notes',
    })
    await expect(updatedTask).toContainText('45m')

    await updatedTask
      .getByLabel('Move Publish release notes')
      .selectOption('Monday')
    await expect(
      page
        .getByRole('heading', { name: 'Monday' })
        .locator('xpath=ancestor::article'),
    ).toContainText('Publish release notes')
    await page.getByLabel('Move Publish release notes').selectOption('')
    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible()

    await page.getByLabel('Monday capacity').fill('1441')
    await expect(page.getByRole('alert')).toContainText(
      'Capacity must be a whole number from 0 to 1440',
    )
    await page.getByLabel('Monday capacity').fill('0')
    await expect(page.getByLabel('Monday capacity')).toHaveValue('0')

    await page
      .getByRole('button', { name: 'Delete Publish release notes' })
      .click()
    await expect(
      page.getByText('Publish release notes', { exact: true }),
    ).toHaveCount(0)
  })

  test('keeps the narrow layout usable by keyboard and reports no console errors', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await page.getByRole('button', { name: 'Load example week' }).focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByText('Prepare project brief', { exact: true }),
    ).toBeVisible()

    await page.getByLabel(/Task title/).focus()
    await page.keyboard.type('Keyboard task')
    await page.getByLabel(/Effort \(minutes\)/).fill('15')
    await page.getByRole('button', { name: 'Add task' }).press('Enter')
    await expect(page.getByText('Keyboard task', { exact: true })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    expect(errors).toEqual([])
  })
})
