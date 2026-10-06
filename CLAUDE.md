# CLAUDE.md: redmine_paste_as_wiki_tables

Redmine plugin `redmine_paste_as_wiki_tables`, run by GEOxyz. Upstream: knt419/redmine_paste_as_wiki_tables master @ 88ed96688329d569279744338a67ae7dde36142c (2018-04-29). GEOxyz production branch: `master`.

**Current work: the migration to Redmine 7.** Read
[docs/REDMINE7-MIGRATION.md](docs/REDMINE7-MIGRATION.md) before anything else; it holds the plan,
the measured state, the work list and the rules. Work on branch `redmine70-migration`.

## Always

- Run commands yourself (tests, linters, `rails runner`, a real Redmine, a browser) and quote the
  results. Never call something green you did not see green.
- A green test suite is not proof a feature works: exercise every function end to end on a real
  running Redmine in a browser (`.codex/start_server.sh`, `.codex/e2e.sh`), with and without the
  plugin's permissions and on its failure paths, and look at every screenshot you commit.
- When `OPENAI_API_KEY` is set, run `.codex/openai_review.sh` after your own review and resolve
  every finding in `docs/reviews/`. Without the key, say the review was skipped.
- Never skip, delete or weaken a test. Every fix gets a test that fails without it.
- Minimal diffs in this plugin's style; no reformatting, no drive-by refactoring.
- Authorization on every action, `safe_attributes` instead of mass assignment, no SQL from
  params, no secrets in logs, no `html_safe` on user input.
- PostgreSQL and MySQL/MariaDB both supported; migrations reversible.
- I18n for every user-visible string; keep the shipped locales in sync, translated by matching
  existing keys in the same file; no new languages.
- Compare with Redmine core before patching it: https://github.com/jcatrysse/redmine
  (`5.1-stable`, `6.1-stable`, `7.0-stable`, `7.0-stable-GEOxyz`).
- GitHub Actions are manual only (`workflow_dispatch`); never add automatic triggers.
- Never push to the default branch, never force-push a shared branch.

## Testing

```sh
./.codex/redmine_clone.sh 7.0-stable-GEOxyz      # or 5.1-stable / 6.1-stable / 7.0-stable
./.codex/test_setup.sh                                 # RMP_DB=mariadb for MariaDB, RMP_PROVISION_DB=0 if a server runs
./.codex/test_plugin.sh                                # minitest + rspec of this plugin
```

```sh
./.codex/start_server.sh       # real Redmine (production mode) with this plugin, seeded users and projects
./.codex/e2e.sh                # browser: smoke over the plugin's pages, core issue flows, test/e2e/*.mjs
./.codex/openai_review.sh      # independent OpenAI review of the diff, only when OPENAI_API_KEY is set
```
Write one scenario per function in `test/e2e/<function>.mjs` (example at the top of
`.codex/e2e/lib.mjs`); screenshots and a table per scenario land in `docs/e2e/`. Users:
`admin`, `manager` (every permission), `reporter` (no plugin permissions), `outsider` (no
membership); password `Redmine7Test!`. Needs Node with Playwright and Chromium
(`npm install -g playwright && npx playwright install --with-deps chromium`).

On GitHub the same runs by hand only: Actions > "Redmine tests (manual)" > Run workflow (tick
"e2e" for the browser run; screenshots come back as an artifact).

## For a new task after the migration

Use the four-role approach (implement, independent review, QA, UX/consistency) and the gates in
docs/REDMINE7-MIGRATION.md ("Rules" and "Definition of done") for any change in this repo,
including the end-to-end run on a real Redmine and the OpenAI review when the key is present.
