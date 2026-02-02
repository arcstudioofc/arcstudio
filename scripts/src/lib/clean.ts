import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { globby } from 'globby';
import ora from 'ora';
import fsExtra from 'fs-extra';

const { remove } = fsExtra;

interface CleanConfig {
  defaultDirs: string[];
  excludeDirs: string[];
}

interface PackageJson {
  cleanConfig?: CleanConfig;
  workspaces?: string[] | { packages: string[] };
}

interface CleanResult {
  path: string;
  status: 'Removido' | 'Não encontrado' | 'Falha';
}

async function getWorkspaces(root: string): Promise<string[]> {
  try {
    const pnpmWorkspacePath = join(root, 'pnpm-workspace.yaml');
    let workspaceGlobs: string[] = [];

    if (existsSync(pnpmWorkspacePath)) {
      const content = await readFile(pnpmWorkspacePath, 'utf-8');
      const match = content.match(/packages:\s*\n((\s*-\s*['"]?.*['"]?\n?)+)/);
      if (match) {
        workspaceGlobs = match[1]
          .split('\n')
          .map(line => line.trim().replace(/^-\s*['"]?/, '').replace(/['"]?$/, ''))
          .filter(line => line.length > 0);
      }
    } else {
      const pkgJsonPath = join(root, 'package.json');
      const pkgJson: PackageJson = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));
      if (Array.isArray(pkgJson.workspaces)) {
        workspaceGlobs = pkgJson.workspaces;
      } else if (pkgJson.workspaces && Array.isArray(pkgJson.workspaces.packages)) {
        workspaceGlobs = pkgJson.workspaces.packages;
      }
    }

    if (workspaceGlobs.length === 0) return [root];

    const workspaces = await globby(workspaceGlobs, {
      cwd: root,
      onlyDirectories: true,
      absolute: true,
      expandDirectories: false,
    });

    return [root, ...workspaces];
  } catch (error) {
    return [root];
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'Removido': return `\x1b[32m[${status}]\x1b[0m`;
    case 'Falha': return `\x1b[31m[${status}]\x1b[0m`;
    case 'Não encontrado': return `\x1b[90m[${status}]\x1b[0m`;
    default: return `[${status}]`;
  }
}

function renderTree(results: CleanResult[]) {
  const tree: any = {};

  // Constrói o objeto da árvore a partir dos caminhos relativos
  results.forEach(res => {
    const parts = res.path.split(sep);
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = { _children: {} };
      }
      if (index === parts.length - 1) {
        current[part]._status = res.status;
      }
      current = current[part]._children;
    });
  });

  // Função recursiva para imprimir a árvore
  function printNode(node: any, prefix: string = '', isLast: boolean = true, name: string = '.') {
    const connector = isLast ? '└── ' : '├── ';
    const status = node._status ? ` ${formatStatus(node._status)}` : '';
    
    if (name !== '.') {
      console.log(`${prefix}${connector}${name}${status}`);
    } else {
      console.log(`.`);
    }

    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    const keys = Object.keys(node._children);
    keys.forEach((key, index) => {
      printNode(node._children[key], name === '.' ? '' : newPrefix, index === keys.length - 1, key);
    });
  }

  printNode(tree['.'] || { _children: tree });
}

async function run() {
  const root = process.cwd();
  const spinner = ora('Lendo configurações...').start();

  try {
    const pkgJsonPath = join(root, 'package.json');
    const pkgJson: PackageJson = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));
    
    const config: CleanConfig = pkgJson.cleanConfig || {
      defaultDirs: ['node_modules', 'dist', '.next', '.turbo'],
      excludeDirs: ['scripts', 'config']
    };

    spinner.text = 'Identificando workspaces...';
    const allWorkspaces = await getWorkspaces(root);
    
    const filteredWorkspaces = allWorkspaces.filter(ws => {
      const relativePath = relative(root, ws);
      if (!relativePath) return true; // root
      return !config.excludeDirs.some(exclude => 
        relativePath === exclude || relativePath.startsWith(`${exclude}${sep}`)
      );
    });

    const results: CleanResult[] = [];
    spinner.text = 'Limpando diretórios...';

    for (const ws of filteredWorkspaces) {
      for (const dir of config.defaultDirs) {
        const target = join(ws, dir);
        const relativeTarget = relative(root, target) || dir;

        if (existsSync(target)) {
          try {
            await remove(target);
            results.push({ path: relativeTarget, status: 'Removido' });
          } catch (err) {
            results.push({ path: relativeTarget, status: 'Falha' });
          }
        } else {
          results.push({ path: relativeTarget, status: 'Não encontrado' });
        }
      }
    }

    spinner.succeed('Limpeza concluída!');
    console.log('');
    renderTree(results);
    console.log('');

  } catch (error) {
    spinner.fail('Erro durante a limpeza');
    console.error(error);
    process.exit(1);
  }
}

run();
