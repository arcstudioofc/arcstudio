const VERSION = 'oficial';
const NAME = 'arcstudio-version';

import chalk from 'chalk';
import prompts from 'prompts';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { consola } from 'consola';

const rootPkgPath = join(process.cwd(), 'package.json');

async function updateVersion() {
  // 1. Prompt para descrição da versão
  const { description } = await prompts({
    type: 'text',
    name: 'description',
    message: 'Descrição da versão:',
    initial: 'Correção de bugs'
  });

  // 2. Prompt para tipo de release
  const { releaseType } = await prompts({
    type: 'select',
    name: 'releaseType',
    message: 'Tipo de release:',
    choices: [
      { title: 'Definir como a versão mais recente', value: 'releases' },
      { title: 'Definir como pré-lançamento', value: 'pre-releases' }
    ],
    initial: 0
  });

  // 3. Geração de versão automática
  const pkgRaw = await readFile(rootPkgPath, 'utf-8');
  const pkg = JSON.parse(pkgRaw);
  const versionLast = pkg.version || 'none';

  const now = new Date();
  const datePart = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  const buildHash = randomBytes(4).toString('hex'); // 8 caracteres hex
  const versionNew = `${datePart}-${buildHash}`;

  // 4. Atualiza package.json
  pkg.version = versionNew;
  await writeFile(rootPkgPath, JSON.stringify(pkg, null, 2));

  // 5. Pergunta se quer criar changelog
  const { createChangelog } = await prompts({
    type: 'confirm',
    name: 'createChangelog',
    message: 'Deseja criar o arquivo de changelog padrão?',
    initial: false
  });

  if (createChangelog) {
    const changelogDir = join(process.cwd(), 'docs', 'changelog', releaseType);
    await mkdir(changelogDir, { recursive: true });

    const timestamp = now.toLocaleString('pt-BR', { hour12: true });
    const changelogContent = `## CHANGELOG (${now.toDateString()} ${timestamp})

### ${versionLast} → ${versionNew} (${releaseType}) — ${description || 'Sem descrição'}
`;

    const changelogPath = join(changelogDir, `${versionNew}.md`);
    await writeFile(changelogPath, changelogContent);

    consola.info(chalk.gray(`Changelog criado em: ${changelogPath}`));
  } else {
    consola.info(chalk.gray('Changelog não criado.'));
  }

  // 6. Log bonito no console
  console.log(); // linha em branco
  consola.success(chalk.green('Versão atualizada com sucesso!'));
  consola.info(chalk.gray(`📦 ${NAME}@${VERSION}`));
  console.log(); // linha em branco
  consola.info(chalk.white('Versão de build atualizada:'), 
               chalk.yellow(versionLast), 
               chalk.white('→'), 
               chalk.green(versionNew));
}

updateVersion().catch(err => {
  consola.error('Erro ao atualizar versão:', err);
  process.exit(1);
});

export { NAME, VERSION };