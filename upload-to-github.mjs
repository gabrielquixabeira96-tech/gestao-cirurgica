import fs from 'node:fs/promises';
import path from 'node:path';

// Configurações
const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '[ghp_XXXXXXXXXXXXXXXX]').trim();
const GITHUB_OWNER = (process.env.GITHUB_OWNER || '[SEU_USUARIO_GITHUB]').trim();
const GITHUB_REPO = (process.env.GITHUB_REPO || '[NOME_DO_REPOSITORIO]').trim();

// Lista de exclusões
const EXCLUDED_DIRS = ['.next', 'node_modules', '.git', 'dist'];
const EXCLUDED_FILES = ['.env.local', 'package-lock.json'];
const EXCLUDED_EXTENSIONS = ['.tsbuildinfo', '.ico', '.png', '.jpg', '.jpeg', '.woff', '.woff2', '.ttf', '.db', '.zip'];
const MAX_FILE_SIZE = 900 * 1024; // 900KB

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getFiles(dir, fileList = []) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      if (EXCLUDED_DIRS.includes(file)) continue;
      await getFiles(filePath, fileList);
    } else {
      if (EXCLUDED_FILES.includes(file)) continue;
      if (EXCLUDED_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext))) continue;
      if (stat.size > MAX_FILE_SIZE) continue;

      fileList.push(filePath);
    }
  }

  return fileList;
}

async function uploadFile(filePath, repoPath) {
  const content = await fs.readFile(filePath);
  const base64Content = content.toString('base64');
  
  // O GitHub exige que o caminho não tenha barras iniciais e use '/'
  const normalizedRepoPath = repoPath.replace(/\\/g, '/');
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${normalizedRepoPath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'NodeJS-Uploader'
    },
    body: JSON.stringify({
      message: `feat: upload ${normalizedRepoPath}`,
      content: base64Content
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status} - ${errorData.message || response.statusText}`);
  }
}

async function main() {
  if (GITHUB_TOKEN.includes('XXXXX') || GITHUB_OWNER.includes('SEU_USUARIO')) {
    console.error('❌ ERRO: Por favor, defina GITHUB_TOKEN, GITHUB_OWNER e GITHUB_REPO no script ou via variáveis de ambiente.');
    process.exit(1);
  }

  console.log(`🔍 Escaneando arquivos no diretório atual...`);
  const rootDir = process.cwd();
  const allFiles = await getFiles(rootDir);
  
  console.log(`📦 Foram encontrados ${allFiles.length} arquivos elegíveis para upload.\n`);

  let uploaded = 0;
  let failed = 0;

  for (const filePath of allFiles) {
    const repoPath = path.relative(rootDir, filePath);
    process.stdout.write(`📤 ${repoPath} ... `);

    try {
      await uploadFile(filePath, repoPath);
      console.log('✅');
      uploaded++;
    } catch (err) {
      console.log(`❌ Falhou (${err.message})`);
      failed++;
    }

    // Delay de 150ms para evitar Rate Limit da API do GitHub
    await delay(150);
  }

  console.log(`\n📊 Done: ${uploaded} uploaded, ${failed} failed.`);
  console.log(`🔗 URL do Repositório: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`);
}

main().catch(console.error);
