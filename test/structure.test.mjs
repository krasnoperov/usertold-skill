import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import test from 'node:test';

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function quotedYamlScalar(source, key) {
  const match = source.match(new RegExp(`^\\s*${key}:\\s*"([^"]*)"\\s*$`, 'm'));
  assert.ok(match, `expected quoted YAML scalar: ${key}`);
  return match[1];
}

test('shares one plugin identity and one MCP endpoint across registries', async () => {
  const codex = await json('plugins/usertold/.codex-plugin/plugin.json');
  const claude = await json('plugins/usertold/.claude-plugin/plugin.json');
  const mcp = await json('plugins/usertold/.mcp.json');
  const codexMarketplace = await json('.agents/plugins/marketplace.json');
  const claudeMarketplace = await json('.claude-plugin/marketplace.json');

  assert.equal(codex.name, 'usertold');
  assert.equal(claude.name, codex.name);
  assert.equal(claude.version, codex.version);
  assert.equal(codex.version, (await json('package.json')).version);
  assert.equal(claude.repository, codex.repository);
  assert.equal(mcp.mcpServers.usertold.url, 'https://mcp.usertold.ai/mcp');
  assert.equal(codexMarketplace.name, 'usertold');
  assert.equal(codexMarketplace.plugins[0].source.path, './plugins/usertold');
  assert.equal(claudeMarketplace.name, 'usertold');
  assert.equal(claudeMarketplace.plugins[0].source, './plugins/usertold');
  assert.equal(claudeMarketplace.plugins[0].version, codex.version);
});

test('skill metadata is portable and contains no scaffold placeholders', async () => {
  const skill = await readFile('plugins/usertold/skills/usertold/SKILL.md', 'utf8');
  const repoFiles = await Promise.all([
    readFile('README.md', 'utf8'),
    readFile('plugins/usertold/skills/usertold/references/access.md', 'utf8'),
    readFile('plugins/usertold/skills/usertold/references/handoff.md', 'utf8'),
  ]);

  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter);
  const keys = frontmatter[1].split('\n').filter((line) => /^[a-zA-Z]/.test(line)).map((line) => line.split(':')[0]);
  assert.deepEqual(keys, ['name', 'description']);
  assert.match(skill, /Prefer the configured UserTold MCP server/);
  assert.match(skill, /capture interviews with real users/i);
  assert.match(skill, /Screen capture is not available on every browser or mobile device/);
  assert.match(skill, /portable research handoff/);
  assert.doesNotMatch([skill, ...repoFiles].join('\n'), /\[TODO:/);
});

test('license is scoped to the public skill distribution', async () => {
  const license = await readFile('LICENSE', 'utf8');
  const npmPackage = await json('package.json');
  const codex = await json('plugins/usertold/.codex-plugin/plugin.json');
  const claude = await json('plugins/usertold/.claude-plugin/plugin.json');

  assert.equal(npmPackage.license, 'MIT-0');
  assert.equal(codex.license, 'MIT-0');
  assert.equal(claude.license, 'MIT-0');
  assert.match(license, /applies only to the files published from this repository/);
  assert.match(license, /does not apply[\s\S]*UserTold CLI implementation/);
});

test('OpenAI directory metadata meets the final publication limits', async () => {
  const codex = await json('plugins/usertold/.codex-plugin/plugin.json');
  const codexMarketplace = await json('.agents/plugins/marketplace.json');
  const claudeMarketplace = await json('.claude-plugin/marketplace.json');
  const openaiAgent = await readFile('plugins/usertold/skills/usertold/agents/openai.yaml', 'utf8');
  const npmPackage = await json('package.json');

  assert.equal(npmPackage.version, '0.2.0');
  assert.equal(codex.version, npmPackage.version);

  const { interface: pluginInterface } = codex;
  const displayName = quotedYamlScalar(openaiAgent, 'display_name');
  const shortDescription = quotedYamlScalar(openaiAgent, 'short_description');

  assert.equal(displayName, pluginInterface.displayName);
  assert.equal(shortDescription, pluginInterface.shortDescription);
  assert.ok(pluginInterface.displayName.length <= 30);
  assert.ok(pluginInterface.shortDescription.length <= 30);
  assert.ok(displayName.length <= 30);
  assert.ok(shortDescription.length <= 30);

  const expectedPrompts = [
    'Review my latest captured interviews and cite the source evidence.',
    'Turn selected UserTold evidence into a portable research handoff.',
    'Draft a study for this product and show it before activation.',
  ];
  assert.deepEqual(pluginInterface.defaultPrompt, expectedPrompts);
  assert.ok(pluginInterface.defaultPrompt.length <= 3);
  assert.equal(
    new Set(pluginInterface.defaultPrompt.map((prompt) => prompt.trim().toLocaleLowerCase())).size,
    pluginInterface.defaultPrompt.length,
  );
  for (const prompt of pluginInterface.defaultPrompt) {
    assert.equal(prompt, prompt.trim());
    assert.ok(prompt.length <= 128);
    assert.doesNotMatch(prompt, /[\r\n]/);
    assert.doesNotMatch(prompt, /@/);
  }

  for (const key of ['websiteURL', 'privacyPolicyURL', 'termsOfServiceURL', 'supportURL']) {
    assert.equal(new URL(pluginInterface[key]).protocol, 'https:');
  }

  assert.equal(pluginInterface.category, 'Data & Analytics');
  assert.equal(codexMarketplace.plugins[0].category, pluginInterface.category);
  assert.equal(claudeMarketplace.plugins[0].category, pluginInterface.category);

  const capabilities = [
    'Set up interview capture',
    'Review source-linked evidence',
    'Prepare verified product work',
  ];
  assert.deepEqual(pluginInterface.capabilities, capabilities);
  for (const capability of pluginInterface.capabilities) {
    assert.match(capability, /\s/);
    assert.doesNotMatch(capability, /^(interactive|read|write)$/i);
  }
});

test('OpenAI directory branding uses a valid square UserTold asset', async () => {
  const codex = await json('plugins/usertold/.codex-plugin/plugin.json');
  const pluginRoot = resolve('plugins/usertold');
  const { composerIcon, logo } = codex.interface;

  assert.equal(composerIcon, './assets/usertold-mark.svg');
  assert.equal(logo, composerIcon);

  for (const assetPath of new Set([composerIcon, logo])) {
    assert.ok(assetPath.startsWith('./assets/'));
    assert.ok(['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(extname(assetPath).toLowerCase()));

    const absolutePath = resolve(pluginRoot, assetPath);
    assert.ok(absolutePath.startsWith(`${pluginRoot}${sep}`));

    const assetStat = await stat(absolutePath);
    assert.ok(assetStat.isFile());
    assert.ok(assetStat.size > 0);
    assert.ok(assetStat.size <= 5 * 1024 * 1024);

    const source = await readFile(absolutePath, 'utf8');
    const svgRoot = source.match(/^\s*<svg\b([^>]*)>/);
    assert.ok(svgRoot);

    const viewBox = svgRoot[1].match(/\bviewBox="([^"]+)"/);
    assert.ok(viewBox);
    const dimensions = viewBox[1].trim().split(/\s+/).map(Number);
    assert.equal(dimensions.length, 4);
    assert.ok(dimensions.every(Number.isFinite));

    const [, , width, height] = dimensions;
    assert.equal(width, height);
    assert.ok(width >= 48);
    assert.ok(width <= 4096);
  }
});
