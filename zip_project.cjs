const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const zip = new AdmZip();
const targetDir = __dirname;
const zipFileName = "cirurgia-notebook-projeto.zip";

// Diretórios/Arquivos a ignorar para manter o zip pequeno
const excludeList = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  ".DS_Store",
  zipFileName
];

function addFolderToZip(dirPath, zipPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (excludeList.includes(file)) continue;

    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addFolderToZip(fullPath, path.join(zipPath, file));
    } else {
      // Add file to zip
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

console.log("Compactando o projeto...");
addFolderToZip(targetDir, "");

// Salva o arquivo na raiz
zip.writeZip(path.join(targetDir, zipFileName));
console.log(`Projeto compactado com sucesso em: ${path.join(targetDir, zipFileName)}`);
