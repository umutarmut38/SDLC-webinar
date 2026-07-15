#!/usr/bin/env bash

set -uo pipefail

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }

check_command() {
  local command_name="$1"
  if command -v "$command_name" >/dev/null 2>&1; then
    pass "$command_name is installed"
  else
    fail "$command_name is not installed"
  fi
}

printf 'Demo environment check (read-only)\n\n'

check_command node
check_command npm
check_command git
check_command gh
check_command aws
check_command codex

if command -v node >/dev/null 2>&1; then
  printf 'INFO  node %s\n' "$(node --version)"
fi

if command -v npm >/dev/null 2>&1; then
  printf 'INFO  npm %s\n' "$(npm --version)"
fi

if command -v gh >/dev/null 2>&1; then
  if gh api user --hostname github.com --jq .login >/dev/null 2>&1; then
    pass 'GitHub CLI can authenticate to github.com'
  else
    warn 'GitHub CLI could not authenticate to github.com'
  fi
fi

if command -v aws >/dev/null 2>&1; then
  if [[ -n "${AWS_PROFILE:-}" ]]; then
    region="$(aws configure get region --profile "$AWS_PROFILE" 2>/dev/null || true)"
    if [[ -n "$region" ]]; then
      printf 'INFO  selected AWS profile has region %s\n' "$region"
    else
      warn 'The selected AWS profile has no configured region'
    fi

    if aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
      pass 'AWS caller identity is available for the explicitly selected profile'
    else
      warn 'AWS caller identity is unavailable for the explicitly selected profile'
    fi
  else
    pass 'No AWS_PROFILE selected; caller identity check skipped safely'
  fi
fi

if [[ -x node_modules/.bin/playwright ]]; then
  browser_path="$(node -e "const { chromium } = require('playwright'); process.stdout.write(chromium.executablePath())" 2>/dev/null || true)"
  if [[ -x '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' ]]; then
    pass 'System Chrome is available for local Playwright tests'
  elif [[ -n "$browser_path" && -x "$browser_path" ]]; then
    pass 'Playwright Chromium browser is installed'
  else
    warn 'No local test browser detected; use Playwright MCP or let CI provision Chromium'
  fi
else
  fail 'Playwright package is not installed; run npm ci'
fi

required_variables=(
  AWS_ROLE_TO_ASSUME
  AWS_REGION
  DEMO_S3_BUCKET
  DEMO_BASE_URL
)
optional_variables=(DEMO_CLOUDFRONT_DISTRIBUTION_ID)

if [[ -f docs/demo-setup.md ]]; then
  for variable_name in "${required_variables[@]}" "${optional_variables[@]}"; do
    if grep -q "$variable_name" docs/demo-setup.md; then
      pass "$variable_name is documented"
    else
      fail "$variable_name is not documented in docs/demo-setup.md"
    fi
  done
else
  fail 'docs/demo-setup.md is missing'
fi

if git remote get-url origin >/dev/null 2>&1 && command -v gh >/dev/null 2>&1; then
  configured_variable_names="$(gh variable list --json name --jq '.[].name' 2>/dev/null || true)"
  for variable_name in "${required_variables[@]}"; do
    if grep -qx "$variable_name" <<<"$configured_variable_names"; then
      pass "$variable_name is configured as a GitHub repository variable"
    else
      warn "$variable_name is not visible as a GitHub repository variable"
    fi
  done
else
  warn 'No origin remote; GitHub repository variable checks skipped'
fi

if command -v codex >/dev/null 2>&1; then
  mcp_list="$(codex mcp list 2>/dev/null || true)"
  for server_name in context7 playwright aws-knowledge; do
    if grep -Eqi "^${server_name}.*enabled" <<<"$mcp_list"; then
      pass "Codex MCP enabled: $server_name"
    elif grep -Eqi "^${server_name}[[:space:]]" <<<"$mcp_list"; then
      warn "Codex MCP configured but not enabled: $server_name"
    else
      warn "Codex MCP entry not detected: $server_name"
    fi
  done

  if grep -Eqi '^graphify.*enabled' <<<"$mcp_list"; then
    pass 'Codex MCP enabled: graphify'
  elif grep -Eqi '^graphify[[:space:]]' <<<"$mcp_list"; then
    warn 'Codex MCP configured but disabled: graphify (generate graphify-out/graph.json first)'
  else
    warn 'Codex MCP entry not detected: graphify'
  fi
fi

if command -v graphify >/dev/null 2>&1; then
  pass 'graphify CLI is installed'
else
  warn 'graphify CLI is unavailable; use the documented architecture fallback'
fi

[[ -f .github/workflows/ci.yml ]] && pass 'CI workflow exists' || fail 'CI workflow is missing'
[[ -f .github/workflows/deploy-on-comment.yml ]] && pass '/deploy workflow exists' || fail '/deploy workflow is missing'

printf '\nResult: %d failure(s), %d warning(s)\n' "$failures" "$warnings"

if (( failures > 0 )); then
  exit 1
fi
