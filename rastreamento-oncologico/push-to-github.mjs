/**
 * push-to-github.mjs
 * Uses isomorphic-git + node-fetch to push the project to GitHub
 * without requiring git to be installed on the system.
 *
 * Run with: node push-to-github.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---- Config ----
const GITHUB_OWNER = 'gabrielquixabeira96-tech'
const GITHUB_REPO  = 'antigravity-app'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN  // pass via env
const PROJECT_DIR  = __dirname

// ---- Dynamic imports (installed in devDeps or npx) ----
async function run() {
  // Install isomorphic-git and node-fetch temporarily
  const { execSync } = await import('child_process')

  console.log('📦 Installing isomorphic-git + node-fetch temporarily...')
  execSync('npm install --no-save isomorphic-git @isomorphic-git/lightning-fs node-fetch@2', {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
  })

  const git = (await import('isomorphic-git')).default
  const http = (await import('isomorphic-git/http/node')).default

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not set. Run: set GITHUB_TOKEN=ghp_xxx && node push-to-github.mjs')
    process.exit(1)
  }

  console.log('🔧 Initializing git repo...')
  await git.init({ fs, dir: PROJECT_DIR, defaultBranch: 'main' })

  console.log('📋 Staging all files...')
  await git.add({ fs, dir: PROJECT_DIR, filepath: '.' })

  console.log('💾 Creating commit...')
  await git.commit({
    fs,
    dir: PROJECT_DIR,
    message: 'feat: initial production release - Rastreamento Oncologico em Massa',
    author: {
      name: GITHUB_OWNER,
      email: `${GITHUB_OWNER}@users.noreply.github.com`,
    },
  })

  const remote = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git`
  console.log(`🚀 Pushing to ${remote} ...`)

  await git.push({
    fs,
    http,
    dir: PROJECT_DIR,
    remote: 'origin',
    url: remote,
    ref: 'main',
    onAuth: () => ({ username: GITHUB_OWNER, password: GITHUB_TOKEN }),
    force: false,
  })

  console.log('✅ Push concluído com sucesso! Repositório populado.')
  console.log(`👉 Acesse: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`)
}

run().catch((err) => {
  console.error('❌ Erro:', err.message || err)
  process.exit(1)
})
