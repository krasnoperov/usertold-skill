# UserTold access reference

Use live discovery as the source of truth. The names below describe stable workflow families, not a frozen complete catalog.

## What UserTold captures and returns

- With participant consent and microphone permission: interview voice and transcript.
- From the embedded product experience: in-page actions, navigation, and page context.
- On supported desktop browsers, when the participant approves screen sharing: a screen recording linked to the interview timeline.
- After processing: source-linked Evidence, analysis context, and reviewable Findings tied back to interview records.

UserTold does not recruit participants. Mobile and unsupported environments continue without screen video, using audio and in-page events. Permissions, connectivity, navigation, or interruption can create capture gaps; surface those gaps whenever interpreting results.

## MCP

Connect to:

```text
https://mcp.usertold.ai/mcp
```

Authentication uses OAuth 2.1 with PKCE. Do not put access tokens in prompts or plugin files.

Start with:

- `tools/list` for the current actions and schemas;
- `projects.list` to find existing Projects and their canonical `projectRef` values;
- `organizations.list` to find an `organizationRef` only when a new Project is needed;
- `projects.create` to create a private Project and starter Study in an accessible organization.

The public MCP server cannot create or administer organizations. A personal organization is created during account setup; use the dashboard or CLI for additional organization and member management.

Clients that support MCP resources may also read `usertold://organizations` and `usertold://projects`. These are bounded read-only snapshots backed by the same discovery logic as the list tools. They have no pagination input, so use the list tools when a resource reports `truncated: true`. Do not require resource support for an agent workflow.

Useful workflow families include:

- `projects.*` for workspace context and project setup;
- `organizations.list` for accessible organization discovery;
- `studies.*` for research design and lifecycle;
- `interviews.*` for interview context and processing status;
- `evidence.*` for source-backed findings and curation;
- `findings.*` for review packets and deliberate provider handoff.

The catalog can change. Use live discovery instead of assuming that an older tool, resource, prompt, or template is still registered.

## CLI

Install and authenticate only with user approval:

```bash
npm install -g usertold
usertold auth login
usertold auth whoami --json
```

To inspect the current published npm package without installing it globally:

```bash
npx --yes usertold@latest --version
npx --yes usertold@latest --help --json
```

Discover the active command contract:

```bash
usertold --help --json
usertold interview --help --json
usertold evidence --help --json
usertold findings --help --json
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
usertold findings list acme/checkout --interview <interview-id> --json
usertold findings get acme/checkout <finding-id> --json
```

Use pagination options shown by live help instead of assuming a complete result set.

## Safety boundaries

- Require explicit approval before study or intake activation.
- Review source Evidence before marking a Finding ready.
- Require explicit approval before pushing Findings to Linear or GitHub.
- Treat delete commands as destructive even when deletion is recoverable.
- Keep organization management, credentials, and connected-service setup out of the public MCP surface; use the UserTold dashboard or current CLI commands.
- Prefer pseudonyms and source IDs over participant names or email addresses.

## Recovery

- If CLI commands fail after login, run `usertold auth whoami --json` and verify the selected environment.
- If a CLI command needs a project, use a canonical `org/project` reference or select one with `usertold project use`.
- If MCP login fails, reconnect the server and complete browser authorization.
- If a Project is missing, rerun `projects.list`; if creation is intended, run `organizations.list` before `projects.create`. Never guess identifiers.
- Current public documentation lives at `https://usertold.ai/docs/mcp` and `https://usertold.ai/docs/cli`.
