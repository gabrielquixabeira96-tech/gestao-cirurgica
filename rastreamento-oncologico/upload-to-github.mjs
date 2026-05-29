/**
 * upload-to-github.mjs
 * Uploads project files to GitHub using the REST API (no git CLI needed).
 * Handles binary files by skipping them and only uploads text source files.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GITHUB_OWNER = 'gabrielquixabeira96-tech'
const GITHUB_REPO  = 'antigravity-app'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const BRANCH       = 'main'

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'rastreamento-oncologico-deploy',
}

// Files and dirs to skip
const SKIP_DIRS  = new Set(['.next', 'node_modules', '.git', 'prisma/dev.db', '.vercel'])
const SKIP_FILES = new Set([
  'package-lock.json', 'tsconfig.tsbuildinfo',
  'dns-test.js', 'test-igit.mjs', 'push-to-github.mjs', 'upload-to-github.mjs',
  '.env.local',
])
const SKIP_EXTS  = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2', '.ttf', '.eot', '.db'])

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  if (!res.ok) return null
  return res.json()
}

async function apiPut(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error(`  ❌ PUT ${path}: ${data.message}`)
  }
  return data
}

function collectFiles(dir, base = '') {
  const files = []
  const entries = fs.readdirSync(dir)

  for (const entry of entries) {
    const rel = base ? `${base}/${entry}` : entry
    const abs = path.join(dir, entry)

    const parts = rel.split('/')
    if (parts.some(p => SKIP_DIRS.has(p))) continue
    if (SKIP_FILES.has(entry)) continue

    const stat = fs.statSync(abs)
    if (stat.isDirectory()) {
      files.push(...collectFiles(abs, rel))
    } else {
      const ext = path.extname(entry).toLowerCase()
      if (SKIP_EXTS.has(ext)) continue
      if (stat.size > 900_000) { // skip files > 900KB (GitHub API limit 1MB)
        console.log(`  ⚠️  Skipping large file: ${rel} (${(stat.size/1024).toFixed(0)}KB)`)
        continue
      }
      files.push({ rel, abs })
    }
  }
  return files
}

async function run() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN not set')
    process.exit(1)
  }

  console.log('📁 Collecting files...')
  const files = collectFiles(__dirname)
  console.log(`   Found ${files.length} files to upload`)

  let success = 0, skipped = 0, failed = 0

  for (const { rel, abs } of files) {
    process.stdout.write(`  📤 ${rel} ... `)

    // Check if file already exists (to get its SHA for updates)
    let sha = undefined
    const existing = await apiGet(`/contents/${rel}?ref=${BRANCH}`)
    if (existing && existing.sha) sha = existing.sha

    const content = fs.readFileSync(abs).toString('base64')

    const body = {
      message: `feat: add ${rel}`,
      content,
      branch: BRANCH,
    }
    if (sha) body.sha = sha

    const result = await apiPut(`/contents/${rel}`, body)
    if (result && result.content) {
      console.log('✅')
      success++
    } else {
      console.log('❌')
      failed++
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\n📊 Done: ${success} uploaded, ${failed} failed, ${skipped} skipped`)
  if (failed === 0) {
    console.log(`✅ Repositório populado! Acesse: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`)
  }
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
