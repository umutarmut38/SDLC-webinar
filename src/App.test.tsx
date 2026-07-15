import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the demo placeholder and deployment controls', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '3D Cloud Deployment Visualizer' }),
    ).toBeVisible()
    expect(screen.getByTestId('visualization-root')).toBeVisible()
    const stageControls = screen.getByRole('group', {
      name: 'Deployment stages',
    })

    expect(stageControls).toBeVisible()
    expect(within(stageControls).getAllByRole('button')).toHaveLength(4)
  })

  it('runs the deterministic delivery probe', () => {
    render(<App />)

    expect(screen.getByTestId('delivery-probe-status')).toHaveTextContent(
      'Delivery probe ready.',
    )

    const probeButton = screen.getByRole('button', {
      name: 'Run delivery probe',
    })
    fireEvent.click(probeButton)

    expect(screen.getByTestId('delivery-probe-status')).toHaveTextContent(
      'Delivery probe passed. This build is ready for remote verification.',
    )
    expect(screen.getByRole('button', { name: 'Probe passed' })).toBeDisabled()
  })
})
