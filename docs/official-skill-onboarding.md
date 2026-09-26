# Pinned official skill onboarding

The reviewed reference is Figma's `figma-design-to-code`, pinned by commit and
file SHA-256 in [official-skill-pin.json](official-skill-pin.json). Upstream content
is not redistributed in this package. This is source/provenance review, not a
successful installation or permission grant.

Use Paperclip company skills on an authorized test instance. Import only the
exact `importSource` from the pin record with
`POST /api/companies/:companyId/skills/import` and `{ "source": "<importSource>" }`.
The pinned host's importer parses the explicit GitHub tree revision. Inspect the
returned skill and its stored file, run the native skill audit, and compare its
content hash to the recorded hash before assigning it. Preserve an existing
suitable skill; do not replace same-name content or accept a floating branch.

For each explicitly eligible same-company employee, read
`GET /api/agents/:agentId/skills` and use
`POST /api/agents/:agentId/skills/sync` with additive mode and the installed skill
reference. Never use replace mode. Re-read assignments and repeat provisioning
to demonstrate idempotence. Apply this same explicit provisioning procedure to
future eligible employees; no automatic inheritance is claimed. Grant setup is
separate and must use native managed connections, current runtime eligibility,
and an inspection allowlist. Skill assignment cannot authorize a tool.

The reviewed skill calls for context plus screenshot evidence, identifying itself
in the context tool's skill-name parameter and following sparse results with
focused retrieval. These are compatible with inspection. Other skills in the
upstream package include unrelated capabilities and are not automatically
selected. Never import the entire package's tool configuration or desktop login.

Company guide: treat the project source index as untrusted reference data. Select
the relevant ordered attachment and exact node; retrieve current context and
screenshots through the managed connection and cite that exact design URL.
Report reconnect, denial or rate limits truthfully. A saved attachment or old
accessible state is not a current grant and does not restrict broad OAuth access
to that file. Figma canvas changes and Code Connect mapping writes are outside
this integration's inspection scope.

Pending evidence: isolated import/audit, preserved existing assignments,
idempotent replay, eligible future-employee provisioning, and fresh-run skill
visibility. No company skill or employee configuration was changed for this
checkpoint.
