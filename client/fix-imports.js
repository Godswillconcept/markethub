/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findFiles(dir, extensions) {
  const files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const lines = content.split('\n');
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Match import statements
    const importMatch = line.match(/^(\s*)import\s+.*?\s+from\s+['"](.+?)['"]/);
    if (importMatch) {
      const indent = importMatch[1];
      const importPath = importMatch[2];

      // Skip external packages and absolute paths
      if (!importPath.startsWith('.') || importPath.includes('http') || importPath.includes('https')) {
        fixedLines.push(line);
        continue;
      }

      // Check if it's a relative import without extension
      const pathParts = importPath.split('/');
      const lastPart = pathParts[pathParts.length - 1];

      // If it doesn't have an extension and isn't a directory import
      if (!lastPart.includes('.') && !lastPart.startsWith('.')) {
        // Check if the file exists with .jsx extension
        const fileDir = path.dirname(filePath);
        const resolvedPath = path.resolve(fileDir, importPath);

        // Try different extensions
        const extensions = ['.jsx', '.js', '.ts', '.tsx'];
        let foundExtension = null;

        for (const ext of extensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            foundExtension = ext;
            break;
          }
        }

        if (foundExtension) {
          const newImportPath = importPath + foundExtension;
          line = line.replace(`'${importPath}'`, `'${newImportPath}'`);
          line = line.replace(`"${importPath}"`, `"${newImportPath}"`);
          modified = true;
          console.log(`Fixed: ${path.relative(process.cwd(), filePath)}:${i + 1} - ${importPath} -> ${newImportPath}`);
        }
      }
    }

    // Also fix dynamic imports
    const dynamicMatch = line.match(/(\s*)import\s*\(\s*['"](.+?)['"]\s*\)/);
    if (dynamicMatch) {
      const indent = dynamicMatch[1];
      const importPath = dynamicMatch[2];

      // Skip external packages and absolute paths
      if (!importPath.startsWith('.') || importPath.includes('http') || importPath.includes('https')) {
        fixedLines.push(line);
        continue;
      }

      // Check if it's a relative import without extension
      const pathParts = importPath.split('/');
      const lastPart = pathParts[pathParts.length - 1];

      // If it doesn't have an extension and isn't a directory import
      if (!lastPart.includes('.') && !lastPart.startsWith('.')) {
        // Check if the file exists with .jsx extension
        const fileDir = path.dirname(filePath);
        const resolvedPath = path.resolve(fileDir, importPath);

        // Try different extensions
        const extensions = ['.jsx', '.js', '.ts', '.tsx'];
        let foundExtension = null;

        for (const ext of extensions) {
          if (fs.existsSync(resolvedPath + ext)) {
            foundExtension = ext;
            break;
          }
        }

        if (foundExtension) {
          const newImportPath = importPath + foundExtension;
          line = line.replace(`'${importPath}'`, `'${newImportPath}'`);
          line = line.replace(`"${importPath}"`, `"${newImportPath}"`);
          modified = true;
          console.log(`Fixed dynamic: ${path.relative(process.cwd(), filePath)}:${i + 1} - ${importPath} -> ${newImportPath}`);
        }
      }
    }

    fixedLines.push(line);
  }

  if (modified) {
    fs.writeFileSync(filePath, fixedLines.join('\n'));
    return true;
  }

  return false;
}

function fixAllImports() {
  const srcDir = path.join(__dirname, 'src');
  const files = findFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx']);

  console.log(`Found ${files.length} source files to check for import fixes\n`);

  let fixedCount = 0;
  let totalImportsFixed = 0;

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const wasFixed = fixImportsInFile(file);

    if (wasFixed) {
      fixedCount++;
    }
  }

  console.log(`\n✅ Import fixing complete!`);
  console.log(`Files modified: ${fixedCount}`);
}

// Run the fix
fixAllImports();
