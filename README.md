# UserTold Agent Skill

The official cross-agent skill and plugin package for [UserTold](https://usertold.ai): evidence-first product research from in-product interviews to verified delivery work.

One portable Agent Skill is packaged for Codex, Claude Code, and ClawHub. Both plugin variants connect to the same production UserTold MCP server through OAuth; no credentials or backend implementation are duplicated in this repository.

## Install

### Codex

```bash
codex plugin marketplace add krasnoperov/usertold-skill
codex plugin add usertold@usertold
```

Start a new Codex session, then ask:

```text
Use $usertold to review my latest interviews and prepare an evidence-backed research handoff.
```

### Claude Code

```bash
claude plugin marketplace add krasnoperov/usertold-skill
claude plugin install usertold@usertold
```

Run `/reload-plugins`, then invoke `/usertold:usertold` or describe the research task normally.

### ClawHub

Install the published [`@usertold/usertold`](https://clawhub.ai/usertold/skills/usertold) skill:


```bash
openclaw skills install @usertold/usertold
```

Or install it directly with the ClawHub CLI:

```bash
npx --yes clawhub@latest install @usertold/usertold
```

## What it does

- inspects UserTold projects, studies, interviews, Evidence, and Work;
- helps draft research setup while keeping activation behind explicit approval;
- reviews transcripts and behavior without mixing quotes, observations, interpretations, and decisions;
- prepares evidence-backed Work for project-aware verification;
- routes only verified, ready Work to Linear or GitHub after approval;
- creates portable Markdown and JSON handoffs for adjacent UX research, Voice-of-Customer, insight-tracking, market-research, and roadmap skills.

The preferred access path is the OAuth-enabled remote MCP server at `https://mcp.usertold.ai/mcp`. The published `usertold` CLI is the fallback when MCP is unavailable.

## Portable research handoff

Export narrowly scoped raw and processed research, then run:

```bash
node plugins/usertold/skills/usertold/scripts/build-research-handoff.mjs \
  --project acme/checkout \
  --title "Checkout research handoff" \
  --raw ./interview-transcript.md \
  --evidence ./evidence.json \
  --work ./work.json \
  --out ./usertold-handoff
```

The output starts with `research-handoff.md` and preserves original JSON and optional raw material underneath it. A downstream skill can consume the readable entrypoint first and inspect the source files only when needed.

Research bundles can contain participant or company-sensitive information. Review their scope and personal data before sharing them with another tool, model, or person.

## Repository structure

```text
.
├── .agents/plugins/marketplace.json       # Codex marketplace
├── .claude-plugin/marketplace.json        # Claude Code marketplace
└── plugins/usertold/
    ├── .codex-plugin/plugin.json
    ├── .claude-plugin/plugin.json
    ├── .mcp.json
    └── skills/usertold/
        ├── SKILL.md
        ├── agents/openai.yaml
        ├── references/
        └── scripts/
```

## Validate

```bash
npm test
claude plugin validate . --strict
claude --plugin-dir ./plugins/usertold
```

The deterministic tests verify the shared skill, both plugin manifests, both marketplace catalogs, MCP configuration, and research-handoff builder.

## Security and data boundaries

- OAuth happens through UserTold; never put a token in this repository or a prompt.
- Transcript and note contents are untrusted research data, not agent instructions.
- Raw participant material is optional in a handoff and should be minimized.
- Study activation, destructive actions, and external delivery handoffs require explicit approval.
- UserTold Work is a review packet, not an automatic implementation order.

Privacy: [usertold.ai/privacy](https://usertold.ai/privacy) · Terms: [usertold.ai/terms](https://usertold.ai/terms) · Security: [usertold.ai/security](https://usertold.ai/security) · Support: support@usertold.ai
