# Redmine 7 migration: redmine_paste_as_wiki_tables

Start a Claude Code (or Codex) session on this repository, branch `redmine70-migration`, with:

> Read CLAUDE.md and docs/REDMINE7-MIGRATION.md, then carry out the Redmine 7 migration of this
> plugin as described there, on branch redmine70-migration. Report to me in Dutch at the end.

This file is the plan and the memory of that work. Update it as you go: verdicts, results,
what is left. Written 2026-10-06 from a measured analysis (report at the bottom).

## Status

| | |
|---|---|
| Plugin id | `redmine_paste_as_wiki_tables` |
| GEOxyz runs today | `master` |
| Upstream | knt419/redmine_paste_as_wiki_tables master @ 88ed96688329d569279744338a67ae7dde36142c (2018-04-29) |
| Runs on Redmine 7 as is | DEELS |
| Upstream sync | UPSTREAM DOOD: nothing; fork contains all upstream commits + 13 own |
| After sync | n.v.t. |
| Complexity (1 trivial .. 5 rewrite) | 1 |
| Measured on | Redmine 7.0.1 (7.0-stable-GEOxyz + latest 7.0-stable), Rails 8.1.3.1, Ruby 3.3.6, PostgreSQL 16 and MariaDB 10.11 |
| Branch head when this file was written | `ee171d9` |

## Already on this branch

- `ee171d9` Skip pastes that Redmine 7 already turned into a table

## Work list for the migration session

In this order: things that break, security, the GEOxyz changes, the open items, then the checks.

**Priority items**

1. Decide: drop the plugin (core 7.0 pastes tables) unless image paste while editing a note is used.

**Open items from the analysis** (Dutch; where they repeat a priority item, the priority item wins)

2. After upgrade switch enable_table_paste off (core covers it) or keep with fix ee171d9; drop the plugin entirely if image paste on note edit is not used
3. Real clipboard test with Excel/LibreOffice in GEOxyz's browsers (here a synthetic ClipboardEvent in Chromium)
4. Pre-existing: default settings are booleans but JS tests for '1', so the plugin is inactive until settings are saved once

**Checks**

5. Run the plugin's whole test suite on Redmine 7.0-stable-GEOxyz with PostgreSQL AND MariaDB, and once on 5.1-stable if the branch is meant to stay 5.1-compatible.
6. Check Redmine 7 webhooks against this plugin (see "Rules"), and note the result here even if nothing is needed.
7. Verify every feature of the plugin by hand on a running Redmine 7 (screenshots).

## GEOxyz changes to review or re-apply

These GEOxyz commits are on the branch GEOxyz runs today and therefore on this branch. Review each one against the code it now sits on (upstream merges and Redmine 7 core): drop it if upstream or core now does the same, rewrite it if it is not up to the quality rules below (tests, I18n, security, portability), keep it otherwise. Record the verdict per commit in this file.

| commit | date | subject |
|---|---|---|
| `7e4a161` | 2023-08-23 | Add preview on note edit |
| `c185261` | 2023-08-12 | Add LICENSE |
| `483d6d7` | 2023-08-10 | typo |
| `04ac00a` | 2023-08-09 | ## 0.1.0 * Optimize code structure (hooks) * Refactoring of the javascript |
| `a28572d` | 2023-08-09 | Update README.md |
| `6b74a43` | 2023-08-03 | #146694 * Better handling when accidentally submitting the issue, when the note was not yet saved. |
| `8c4be6c` | 2023-08-02 | #146694 * Correction of the default settings (string => boolean) |
| `9ed11a8` | 2023-08-02 | #146694 * Cleanup |
| `de96efa` | 2023-08-02 | #146694 * Cleanup |
| `e48ad95` | 2023-08-02 | #146694 * Correction on line endings not working |
| `90630f2` | 2023-08-02 | #146694 * Paste clipboard images on note edit * Make table and clipboard option configurable in the plugin settings * Translations: en, fr, de, nl, ro, es * Some code optimizations |
| `3a03d56` | 2023-08-01 | Paste clipboard images on note edit |

## After the upgrade (production)

Actions the person doing the upgrade must take, or know about, for this plugin:

- If dropped: uninstall on 5.1 before the upgrade (`rake redmine:plugins:migrate NAME=redmine_paste_as_wiki_tables VERSION=0`, then remove). If kept: switch enable_table_paste off.

## How to test

```sh
./.codex/redmine_clone.sh 7.0-stable-GEOxyz      # or 5.1-stable / 6.1-stable / 7.0-stable
./.codex/test_setup.sh                                 # RMP_DB=mariadb for MariaDB, RMP_PROVISION_DB=0 if a server runs
./.codex/test_plugin.sh                                # minitest + rspec of this plugin
```
On GitHub the same runs by hand only: Actions > "Redmine tests (manual)" > Run workflow.

The coordinator's harness (`plugin-check.sh` in the migration kit, kept outside this repo) adds a
browser smoke test of every page the plugin adds and runs all GEOxyz plugins together; the
results quoted in the analysis come from it.

## How the migration session works (same for every plugin)

1. **Start**: `git fetch && git checkout redmine70-migration && git pull`. Read this whole file,
   including the analysis report at the bottom. Do not reopen decisions recorded here.
2. **Baseline**: set up Redmine 7.0-stable-GEOxyz and run the plugin's tests on PostgreSQL and
   on MariaDB (see "How to test"). Write the numbers here before you change anything.
3. **GEOxyz changes**: go through the table above, one item at a time. Each kept or re-made change
   is its own commit with a test that proves it. Record the verdict in the table.
4. **Work list**: then the numbered list, in order. One concern per commit.
5. **Portability**: everything must run on Redmine's supported databases (PostgreSQL,
   MySQL/MariaDB; SQLite where the plugin already supports it). Migrations must be reversible and
   are run down and up on PostgreSQL and MariaDB.
6. **Browser**: start a Redmine 7 with this plugin, exercise every feature as admin and as a
   normal user with and without the plugin's permissions, and save screenshots (before on 5.1 or
   the old branch, after on 7.0) where behaviour or layout matters.
7. **Together**: run with the other GEOxyz plugins installed (the migration kit's harness, or
   `RMP_EXTRA_PLUGINS`). A failure that only appears in combination is a finding to record here.
8. **After the upgrade**: anything the production upgrade must do for this plugin (data fixes,
   settings, cron, files, removed features) goes into the section "After the upgrade".
9. **Finish**: update "Status" and the work list in this file, push `redmine70-migration`, and
   report: what changed, test numbers on both databases, what is left, what needs Jan.

### Stop and ask Jan when
- a GEOxyz change would be lost or behave differently for users;
- a new gem, a new setting with user impact, or a schema change not required by Redmine 7 seems needed;
- the change would send data to an external service;
- upstream and GEOxyz disagree on behaviour and both are defensible.

## Rules

- **Target**: Redmine 7.0-stable-GEOxyz (https://github.com/jcatrysse/redmine), Rails 8.1, Ruby 3.3+.
  Core sources for comparison: branches `5.1-stable`, `6.1-stable`, `7.0-stable`, `7.0-stable-GEOxyz`.
- **Evidence**: never report a test, lint or browser check as passed without having seen it.
  Quote the summary lines. "Should work" is not a result.
- **Tests**: never skip, delete or weaken a test. A test that encodes Redmine 5 markup or
  behaviour is updated to Redmine 7, with the reason in the commit. Every fix gets a test that
  fails without it.
- **Minimal diffs** in the plugin's own style. No reformatting, no unrelated refactoring.
  Something wrong elsewhere: write it down here, do not fix it in passing.
- **Security**: authorization on every action and entry point; `safe_attributes`, never
  `to_unsafe_hash` into `update`; no SQL built from params; no secrets in logs; no `html_safe` on
  user input.
- **Webhooks (new in Redmine 7)**: core sends issue payloads (core `issues/show.api.rsb`, rendered
  as the webhook owner) to webhook endpoints, past plugin hooks and controller patches. If the
  plugin hides, adds or changes issue data, make webhooks consistent with that or record why not.
- **Redmine 7 conventions**: SVG icons through `sprite_icon` (the `icon icon-*` CSS is gone),
  Propshaft assets under `assets/` (`/assets/plugin_assets/<id>/...`), the new header and user menu,
  `ContextMenus::*Controller`, Loofah-based text formatting, Chart.js as an ES module.
  The breaker list is in the migration kit's CHECKLIST.md.
- **Locales**: keep the locales the plugin ships in sync; translate a new key by matching the
  closest existing key in the same file, not from scratch; do not add new languages.
- **5.1 compatibility**: prefer fixes that also run on Redmine 5.1 so they can be merged early;
  say so when a fix cannot.
- **Git**: work on `redmine70-migration` only; never push to the default branch; never force-push
  a branch someone else uses. Descriptive commit messages (what and why).
- **GitHub Actions**: manual only (`workflow_dispatch`). Do not add push, pull_request or schedule
  triggers.

## Definition of done

- All items of the work list are done or explicitly deferred with a reason, in this file.
- The plugin's tests are green on Redmine 7.0-stable-GEOxyz with PostgreSQL and MariaDB
  (numbers in this file); boot, production-like eager load, migrations up/down OK.
- Every feature verified by hand on Redmine 7; screenshots listed.
- No new failure when run together with the other GEOxyz plugins.
- "After the upgrade" lists every action production needs; "Status" is current.


## Analysis report (2026-10-06, Dutch)

# redmine_paste_as_wiki_tables
- Gebruikte branch: master @ 7e4a161 (2023-08-23) - plugin id redmine_paste_as_wiki_tables, versie 0.1.1
- Upstream: knt419/redmine_paste_as_wiki_tables - upstream HEAD master @ 88ed966 (2018-04-29)
- Fork t.o.v. upstream: 13 eigen commits (sk-ys Redmine 5.0-support + Jan Catrysse: plakken van afbeeldingen bij het bewerken van een note, instellingen, auto-submit, preview bij note-edit, locales), 0 upstream-commits ontbreken.
- Andere relevante branches: geen.
- Opbouw: één JS-partial via `view_layouts_base_body_bottom` (`app/views/redmine_paste_as_wiki_tables/_script.html.erb`), jQuery-handler `$(document).on('paste', '.wiki-edit', ...)`, instellingen (enable_table_paste / enable_image_paste / enable_auto_submit). Geen Gemfile, migraties of tests.

## 1. Werkt out of the box op Redmine 7?   DEELS
- Harness (`results/1006-085328-s1-redmine_paste_as_wiki_tables_origin_master`): boot OK, eager OK, migraties OK, smoke 60/60.
- **Dubbel plakken** (gemeten in de browser met een gesimuleerde paste van een spreadsheet = text/html-tabel + text/plain-TSV in `#issue_description`, CommonMark): R7-core (Stimulus `table-paste`) zet de tabel en roept `preventDefault()` aan. Daarna voegt de plugin-handler op document dezelfde tabel nog eens toe. Resultaat:
  `| A | B\|x |\n| -- | -- |\n| 1 | 2 |\n\n| A | B|x |\n|---|---|\n| 1 | 2 |\n` (tweede kopie zonder escaping van `|`, dus kapotte tabel). Met `enable_table_paste` uit: alleen de core-tabel.
- Afbeelding plakken tijdens het bewerken van een note werkt op R7 (gemeten: PNG geplakt in `journal_2_notes` -> upload via het issueformulier (token 4.c414…), inline markup in de note, `#update` zichtbaar).

## 2. Upstream sync?   UPSTREAM DOOD
- Upstream is sinds 2018 stil. De fork bevat alles.

## 3. Werkt na sync op Redmine 7?   n.v.t.

## 4. Complexiteit en blokkers   score 1
- Blokkers: dubbel plakken naast core #43950 - gefixt in ee171d9: de handler stopt als het event al afgehandeld is (`e.isDefaultPrevented()`). Na de fix gemeten: spreadsheet-paste -> alleen de core-tabel (`| A | B\|x |…`). Paste van alleen TSV-tekst (zonder HTML, bv. uit een teksteditor; core negeert die) -> de plugin maakt de tabel (`defaultPrevented=true`).
- Vergelijking met core (R7 `app/javascript/controllers/table_paste_controller.js`):

  | | core R7 | plugin |
  |---|---|---|
  | Bron | text/html met precies één `<table>` (Excel, LibreOffice, Google Sheets, webpagina's) | text/plain met tabs, alle regels evenveel cellen |
  | `\|` in een cel | ge-escaped (`\|` / `&#124;`) | niet ge-escaped -> kapotte tabel |
  | Regeleinde in een cel | `<br>` (CommonMark) | niet ondersteund |
  | Ongelijke rijen | aangevuld | geen tabel |
  | Waar | alle wiki-textareas met de Stimulus-attributen (issue, note, note-edit, wiki, nieuws, forum, documenten, custom fields) | alle `.wiki-edit` |
  | Undo/`input`-event | `setRangeText` + `input`-event | `val()` (overschrijft bovendien tekens na de cursor) |
  | Afbeelding plakken bij note-edit | **nee** (notes-editform heeft geen bijlagenveld) | ja |
- Aanbeveling: core dekt het plakken van tabellen beter. Zet `enable_table_paste` uit, of laat het aan met de fix als TSV-tekst plakken nog nodig is. De plugin is alleen nog nodig voor afbeeldingen plakken bij note-edit. Wordt dat niet gebruikt, dan de plugin laten vallen.
- Stille breuken (bestaand): de standaardinstellingen zijn booleans (`true`), terwijl de JS op `'1'` test (`_script.html.erb:185-186`). Zolang de instellingen nooit opgeslagen zijn, doet de plugin niets.
- Overlap met Redmine 7 core: ja, tabellen plakken (#43950), zie tabel.
- Open werk voor ansif:
  1. Na de upgrade `enable_table_paste` uitzetten (of de plugin schrappen als afbeelding-bij-note-edit niet gebruikt wordt).
  2. Echte clipboard-test met Excel/LibreOffice in Firefox/Edge (hier gesimuleerd met een ClipboardEvent in Chromium).

## Branch redmine70-migration
- Basis: origin/master @ 7e4a161
- Commits: ee171d9 Skip pastes that Redmine 7 already turned into a table
- Eindresultaat harness (`results/1006-100031-s1-redmine_paste_as_wiki_tables_redmine70-migration`): boot OK, eager OK, migraties OK, smoke 60/60 (geen tests in de plugin). Double-paste-fix gemeten in de browser (zie 4)
- Rollback migraties: n.v.t. (geen migraties)

