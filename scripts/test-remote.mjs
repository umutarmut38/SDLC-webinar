import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const flagIndex = args.indexOf('--base-url')
const baseUrlValue = flagIndex >= 0 ? args[flagIndex + 1] : undefined

if (!baseUrlValue) {
  console.error(
    'Usage: npm run test:remote -- --base-url https://demo.example.com',
  )
  process.exit(2)
}

let baseUrl

try {
  baseUrl = new URL(baseUrlValue)
} catch {
  console.error('The --base-url value must be a valid URL.')
  process.exit(2)
}

if (!['http:', 'https:'].includes(baseUrl.protocol)) {
  console.error('The remote URL must use http or https.')
  process.exit(2)
}

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(
  executable,
  ['playwright', 'test', '--config', 'playwright.remote.config.ts'],
  {
    env: { ...process.env, PLAYWRIGHT_BASE_URL: baseUrl.toString() },
    stdio: 'inherit',
  },
)

if (result.error) {
  console.error(`Unable to start Playwright: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
