import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the demo placeholder and deployment controls', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '3D Cloud Deployment Visualizer' }),
    ).toBeVisible()
    expect(screen.getByTestId('visualization-root')).toBeVisible()
    expect(
      screen.getByRole('group', { name: 'Deployment stages' }),
    ).toBeVisible()
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })
})
