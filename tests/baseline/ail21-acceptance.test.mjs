/**
 * AIL-21 / AIL-4 monorepo 工程基线验收自动化（Node 内置 test runner）。
 * 运行：在仓库根目录执行 `pnpm test:baseline`
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

/**
 * 读取仓库内 UTF-8 文本文件。
 *
 * @param {...string} segments 相对仓库根的路径段
 * @returns {string} 文件内容
 */
function read(...segments) {
  return readFileSync(path.join(root, ...segments), 'utf8');
}

/**
 * 判断相对仓库根的路径是否存在。
 *
 * @param {...string} segments 路径段
 * @returns {boolean} 是否存在
 */
function has(...segments) {
  return existsSync(path.join(root, ...segments));
}

/**
 * 粗略检测疑似真实密钥形态（非占位）。
 *
 * @param {string} content 环境样例全文
 * @returns {string[]} 命中描述列表
 */
function findSuspiciousSecrets(content) {
  const hits = [];
  const patterns = [
    { name: 'GitHub PAT', re: /\bghp_[A-Za-z0-9]{20,}\b/ },
    { name: 'AWS Access Key', re: /\bAKIA[0-9A-Z]{16}\b/ },
    { name: 'OpenAI-like key', re: /\bsk-[A-Za-z0-9]{20,}\b/ },
    { name: 'JWT-like', re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  ];
  for (const { name, re } of patterns) {
    if (re.test(content)) hits.push(name);
  }
  return hits;
}

describe('AIL-21 monorepo 基线验收（对照 AIL-4）', () => {
  it('TC-ROOT-01: workspace 与 apps 目录 / 根脚本约定', () => {
    assert.ok(has('pnpm-workspace.yaml'), '缺少 pnpm-workspace.yaml');
    const workspace = read('pnpm-workspace.yaml');
    assert.match(workspace, /apps\/\*/, 'workspace 应覆盖 apps/*');

    assert.ok(has('apps', 'web'), '缺少 apps/web');
    assert.ok(has('apps', 'api'), '缺少 apps/api');

    const pkg = JSON.parse(read('package.json'));
    assert.equal(typeof pkg.packageManager, 'string');
    assert.match(pkg.packageManager, /^pnpm@/, '应固定 pnpm packageManager');
    assert.equal(typeof pkg.scripts?.['dev:web'], 'string');
    assert.equal(typeof pkg.scripts?.['dev:api'], 'string');
    assert.equal(typeof pkg.scripts?.['lint:web'], 'string');
    assert.equal(typeof pkg.scripts?.['lint:api'], 'string');
  });

  it('TC-ROOT-02: 根 README 说明安装与分别启动', () => {
    assert.ok(has('README.md'));
    const readme = read('README.md');
    assert.match(readme, /pnpm install/);
    assert.match(readme, /pnpm dev:web/);
    assert.match(readme, /pnpm dev:api/);
  });

  it('TC-ROOT-03: README 简述结构与 Stage 边界', () => {
    const readme = read('README.md');
    assert.match(readme, /apps\/web/);
    assert.match(readme, /apps\/api/);
    // 允许显式 Issue 编号，或等价“布局壳 / 后续 Issue / 不重复”表述
    const hasBoundary =
      /AIL-5|AIL-6|布局壳|后续.*(Issue|子 Issue)|不提前实现|本 README 仅描述/i.test(readme) ||
      has('apps', 'web', 'README.md') &&
        /布局壳|AIL-6|后续 Issue/i.test(read('apps', 'web', 'README.md'));
    assert.ok(hasBoundary, 'README 应简述相对布局壳/基础设施的边界');
  });

  it('TC-ROOT-04: .env.example 无真实密钥且 .env 被忽略', () => {
    assert.ok(has('apps', 'web', '.env.example'));
    assert.ok(has('apps', 'api', '.env.example'));
    const gitignore = read('.gitignore');
    assert.match(gitignore, /^\.env$/m);
    assert.match(gitignore, /!\.env\.example/);

    const webEnv = read('apps', 'web', '.env.example');
    const apiEnv = read('apps', 'api', '.env.example');
    assert.deepEqual(findSuspiciousSecrets(webEnv), []);
    assert.deepEqual(findSuspiciousSecrets(apiEnv), []);
    assert.match(webEnv, /^VITE_API_TOKEN=\s*$/m);
  });

  it('TC-WEB-01-script / TC-WEB-02-config / TC-WEB-04: 前端脚本与规范配置就绪', () => {
    const webPkg = JSON.parse(read('apps', 'web', 'package.json'));
    assert.equal(webPkg.name, '@admin-template/web');
    assert.match(String(webPkg.scripts?.dev ?? ''), /vite/);
    assert.match(String(webPkg.scripts?.lint ?? ''), /lint/);
    assert.match(String(webPkg.scripts?.['type-check'] ?? ''), /vue-tsc/);
    assert.ok(has('apps', 'web', 'eslint.config.ts') || has('apps', 'web', 'eslint.config.mjs') || has('apps', 'web', 'eslint.config.js'));
    assert.ok(has('apps', 'web', '.prettierrc.json') || has('apps', 'web', '.prettierrc'));
    assert.ok(has('apps', 'web', 'tsconfig.json'));
  });

  it('TC-WEB-05: 前端 .env.example 变量齐全', () => {
    const env = read('apps', 'web', '.env.example');
    for (const key of ['VITE_APP_TITLE', 'VITE_API_BASE_URL', 'VITE_API_TIMEOUT_MS', 'VITE_API_TOKEN']) {
      assert.match(env, new RegExp(`^${key}=`, 'm'), `缺少 ${key}`);
    }
  });

  it('TC-API-03: Nest 模块骨架文件存在', () => {
    for (const rel of [
      ['apps', 'api', 'src', 'main.ts'],
      ['apps', 'api', 'src', 'app.module.ts'],
      ['apps', 'api', 'src', 'app.controller.ts'],
      ['apps', 'api', 'src', 'app.service.ts'],
      ['apps', 'api', 'nest-cli.json'],
      ['apps', 'api', 'tsconfig.json'],
    ]) {
      assert.ok(has(...rel), `缺少 ${rel.join('/')}`);
    }
  });

  it('TC-API-04: 后端 .env.example 含端口 / DB / Redis 占位', () => {
    const env = read('apps', 'api', '.env.example');
    for (const key of ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'REDIS_HOST', 'REDIS_PORT']) {
      assert.match(env, new RegExp(`^${key}=`, 'm'), `缺少 ${key}`);
    }
  });

  it('TC-API-01 / TC-API-02 / TC-API-05: api package.json 非占位且与 Nest 源码一致', () => {
    const apiPkg = JSON.parse(read('apps', 'api', 'package.json'));
    const mainTs = read('apps', 'api', 'src', 'main.ts');
    assert.match(mainTs, /@nestjs\/core/);

    const deps = { ...(apiPkg.dependencies ?? {}), ...(apiPkg.devDependencies ?? {}) };
    assert.ok(deps['@nestjs/core'], '存在 Nest 源码时 package.json 应声明 @nestjs/core（AIL-20 合入缺口）');
    assert.ok(deps['typescript'] || deps['typescript-eslint'], '应具备 TypeScript 基线依赖');

    const devScript = String(apiPkg.scripts?.dev ?? '');
    const lintScript = String(apiPkg.scripts?.lint ?? '');
    assert.doesNotMatch(devScript, /process\.exit\(1\)/, 'dev 脚本仍为占位 exit(1)，无法按 README 启动');
    assert.doesNotMatch(lintScript, /process\.exit\(1\)/, 'lint 脚本仍为占位 exit(1)，规范不可执行');
    assert.match(devScript, /nest/i, 'dev 脚本应调用 nest start');
  });

  it('TC-API-02-config: api ESLint / Prettier 配置文件存在', () => {
    assert.ok(
      has('apps', 'api', 'eslint.config.mjs') ||
        has('apps', 'api', 'eslint.config.js') ||
        has('apps', 'api', 'eslint.config.cjs'),
    );
    assert.ok(has('apps', 'api', '.prettierrc') || has('apps', 'api', '.prettierrc.json'));
  });
});
