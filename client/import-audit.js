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

function parseImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match import statements
    const importMatch = line.match(/^import\s+.*?\s+from\s+['"](.+?)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      imports.push({
        line: i + 1,
        path: importPath,
        fullLine: line
      });
    }

    // Also check for dynamic imports
    const dynamicImportMatch = line.match(/import\s*\(\s*['"](.+?)['"]\s*\)/);
    if (dynamicImportMatch) {
      const importPath = dynamicImportMatch[1];
      imports.push({
        line: i + 1,
        path: importPath,
        fullLine: line,
        dynamic: true
      });
    }
  }

  return imports;
}

function resolveImportPath(importPath, fileDir) {
  if (importPath.startsWith('.')) {
    // Relative import
    return path.resolve(fileDir, importPath);
  } else if (importPath.startsWith('/')) {
    // Absolute import from project root
    return path.resolve(process.cwd(), importPath.slice(1));
  } else {
    // External package import
    return null;
  }
}

function checkFileExists(resolvedPath) {
  if (!resolvedPath) return { exists: false, caseIssue: false };

  // Check if file exists with exact case
  if (fs.existsSync(resolvedPath)) {
    return { exists: true, caseIssue: false };
  }

  // Check for case sensitivity issues on Windows
  const dir = path.dirname(resolvedPath);
  const fileName = path.basename(resolvedPath);

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const found = files.find(f => f.toLowerCase() === fileName.toLowerCase());

    if (found) {
      return {
        exists: true,
        caseIssue: found !== fileName,
        actualName: found
      };
    }
  }

  return { exists: false, caseIssue: false };
}

function auditImports() {
  const srcDir = path.join(__dirname, 'src');
  const files = findFiles(srcDir, ['.js', '.jsx', '.ts', '.tsx']);

  console.log(`Found ${files.length} source files to audit\n`);

  const issues = {
    caseSensitivity: [],
    missingFiles: [],
    pathIssues: [],
    totalImports: 0
  };

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    const fileDir = path.dirname(file);
    const imports = parseImports(file);

    issues.totalImports += imports.length;

    for (const imp of imports) {
      const resolvedPath = resolveImportPath(imp.path, fileDir);

      if (resolvedPath) {
        // Internal import
        const check = checkFileExists(resolvedPath);

        if (!check.exists) {
          issues.missingFiles.push({
            file: relativePath,
            line: imp.line,
            importPath: imp.path,
            resolvedPath: path.relative(process.cwd(), resolvedPath)
          });
        } else if (check.caseIssue) {
          issues.caseSensitivity.push({
            file: relativePath,
            line: imp.line,
            importPath: imp.path,
            expected: path.basename(resolvedPath),
            actual: check.actualName
          });
        }
      }
    }
  }

  return issues;
}

// Run the audit
const results = auditImports();

console.log('=== IMPORT AUDIT RESULTS ===\n');
console.log(`Total source files audited: ${findFiles(path.join(__dirname, 'src'), ['.js', '.jsx', '.ts', '.tsx']).length}`);
console.log(`Total import statements found: ${results.totalImports}\n`);

if (results.caseSensitivity.length > 0) {
  console.log('🚨 CASE SENSITIVITY ISSUES FOUND:');
  results.caseSensitivity.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line} - "${issue.importPath}"`);
    console.log(`    Expected: ${issue.expected}, Found: ${issue.actual}`);
  });
  console.log();
}

if (results.missingFiles.length > 0) {
  console.log('❌ MISSING FILES:');
  results.missingFiles.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line} - "${issue.importPath}"`);
    console.log(`    Resolved to: ${issue.resolvedPath}`);
  });
  console.log();
}

if (results.caseSensitivity.length === 0 && results.missingFiles.length === 0) {
  console.log('✅ No import issues found!');
} else {
  console.log('📊 Summary:');
  console.log(`  - Case sensitivity issues: ${results.caseSensitivity.length}`);
  console.log(`  - Missing files: ${results.missingFiles.length}`);
}

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: findFiles(path.join(__dirname, 'src'), ['.js', '.jsx', '.ts', '.tsx']).length,
    totalImports: results.totalImports,
    caseSensitivityIssues: results.caseSensitivity.length,
    missingFiles: results.missingFiles.length
  },
  issues: results
};

fs.writeFileSync('import-audit-results.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to import-audit-results.json');
