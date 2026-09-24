import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('WeekPlan accessible task workflow', () => {
  test('adds a task, validates blank input, and exposes it in the selected day', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a task title.')

    fireEvent.change(screen.getByLabelText(/Task title/), {
      target: { value: 'Write tests' },
    })
    fireEvent.change(screen.getByLabelText(/Effort \(minutes\)/), {
      target: { value: '45' },
    })
    fireEvent.change(screen.getByLabelText('Schedule'), {
      target: { value: 'Tuesday' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Tuesday' }).closest('article'),
    ).toHaveTextContent('45m')
    expect(screen.getByRole('status')).toHaveTextContent('Task added and saved')
  })

  test('loads the sample, confirms replacement, and keeps overload visible as text', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Load example week' }))
    expect(screen.getByText('Prepare project brief')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Wednesday' }).closest('article'),
    ).toHaveTextContent('8h')
    expect(
      screen.getByText('Over capacity by 2h. Move or shorten a task.'),
    ).toBeInTheDocument()

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Load example week' }))
    expect(window.confirm).toHaveBeenCalledWith(
      'Replace your current plan with the example week?',
    )
  })

  test('moves and completes a task while preserving scheduled totals', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Load example week' }))

    const moveControl = screen.getByLabelText('Move Run stakeholder workshop')
    fireEvent.change(moveControl, { target: { value: 'Thursday' } })
    const thursday = screen
      .getByRole('heading', { name: 'Thursday' })
      .closest('article')
    expect(thursday).toHaveTextContent('2h')
    expect(thursday).toHaveTextContent('4h')

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Run stakeholder workshop' }),
    )
    expect(thursday).toHaveTextContent('2h')
    expect(thursday).toHaveTextContent('0m')
  })

  test('shows storage failures instead of claiming the change was saved', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    render(<App />)

    fireEvent.change(screen.getByLabelText(/Task title/), {
      target: { value: 'Unsaved' },
    })
    fireEvent.change(screen.getByLabelText(/Effort \(minutes\)/), {
      target: { value: '30' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Changes could not be saved',
    )
    expect(screen.getByRole('alert')).not.toHaveTextContent(
      'Task added and saved',
    )
  })
})
