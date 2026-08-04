# UserTold access reference

Use live discovery as the source of truth. The names below describe stable workflow families, not a frozen complete catalog.

## MCP

Connect to:

```text
https://mcp.usertold.ai/mcp
```

Authentication uses OAuth 2.1 with PKCE. Do not put access tokens in prompts or plugin files.

Start with:

- `tools/list` for actions and schemas;
- `resources/list` and `resources/templates/list` for readable project data;
- `prompts/list` for reusable research workflows;
- `usertold://me` to identify the authenticated workspace;
- `usertold://projects` to discover accessible projects.

Useful workflow families include:

- `projects.*` for workspace context and project setup;
- `studies.*` and `intake.*` for research design and lifecycle;
- `interviews.*` for interview context and processing status;
- `evidence.*` for source-backed findings and curation;
- `work.*` for review packets and deliberate provider handoff;
- `research.*` prompts for study design and interpretation.

Some tools are deferred. If a named tool is missing, read `usertold://mcp/deferred-tools`, then read the returned schema resource before calling it.

## CLI

Install and authenticate only with user approval:

```bash
npm install -g usertold
usertold auth login
usertold auth whoami --json
```

Discover the active command contract:

```bash
usertold --help --json
usertold interview --help --json
usertold evidence --help --json
usertold work --help --json
```

Common read paths:

```bash
usertold project list --json
usertold project get acme/checkout --json
usertold interview list acme/checkout --json
usertold interview get acme/checkout <interview-id> --json
usertold interview transcript acme/checkout <interview-id>
usertold interview events acme/checkout <interview-id> --json
usertold interview enriched-timeline acme/checkout <interview-id> --json
usertold evidence list acme/checkout --interview <interview-id> --json
usertold evidence get acme/checkout <evidence-id> --json
usertold work list acme/checkout --interview <interview-id> --json
usertold work get acme/checkout <work-id> --json
```

Use pagination options shown by live help instead of assuming a complete result set.

## Safety boundaries

- Require explicit approval before study or intake activation.
- Review source Evidence before marking Work ready.
- Require explicit approval before pushing Work to Linear or GitHub.
- Treat delete commands as destructive even when deletion is recoverable.
- Keep organization management, credentials, and connected-service setup in the UserTold dashboard.
- Prefer pseudonyms and source IDs over participant names or email addresses.

## Recovery

- If CLI commands fail after login, run `usertold auth whoami --json` and verify the selected environment.
- If a CLI command needs a project, use a canonical `org/project` reference or select one with `usertold project use`.
- If MCP login fails, reconnect the server and complete browser authorization.
- If a project is missing, reread `usertold://me` and `usertold://projects` rather than guessing identifiers.
- Current public documentation lives at `https://usertold.ai/docs/mcp` and `https://usertold.ai/docs/cli`.
