# Redmine 7 migration: redmine_paste_as_wiki_tables

Start a Claude Code (or Codex) session on this repository, branch `redmine70-migration`, with:

> Read CLAUDE.md and docs/REDMINE7-MIGRATION.md, then carry out the Redmine 7 migration of this
> plugin as described there, on branch redmine70-migration. That includes the plugin's tests on
> PostgreSQL and MariaDB, every function exercised end to end on a real running Redmine in a
> browser (with and without permissions, failure paths included) with screenshots you looked at,
> and an OpenAI review of the diff when OPENAI_API_KEY is set. Report to me in Dutch at the end.

This file is the plan and the memory of that work. Update it as you go: verdicts, results,
what is left. Written 2026-10-06 from a measured analysis (report at the bottom).

## Status

| | |
|---|---|
| Plugin id | `redmine_paste_as_wiki_tables` |
| GEOxyz runs today | `master` |
| Upstream | knt419/redmine_paste_as_wiki_tables master @ 88ed96688329d569279744338a67ae7dde36142c (2018-04-29) |
| Runs on Redmine 7 as is | DEELS (now: yes, after the fixes below) |
| Upstream sync | UPSTREAM DOOD: nothing; fork contains all upstream commits + 13 own |
| After sync | n.v.t. |
| Complexity (1 trivial .. 5 rewrite) | 1 |
| Measured on | Redmine 7.0.1 (7.0-stable-GEOxyz + latest 7.0-stable), Rails 8.1.3.1, Ruby 3.3.6, PostgreSQL 16 and MariaDB 10.11 |
| Branch head when this file was written | `6092a54` |

## Already on this branch

- `ee171d9` Skip pastes that Redmine 7 already turned into a table

## Work list for the migration session

In this order: things that break, security, the GEOxyz changes, the open items, then the checks.

**Priority items**

1. Decide: drop the plugin (core 7.0 pastes tables) unless image paste while editing a note is used.

**Open items from the analysis** (Dutch; where they conflict with a decision or a priority item above, those win)

2. After upgrade switch enable_table_paste off (core covers it) or keep with fix ee171d9; drop the plugin entirely if image paste on note edit is not used
3. Real clipboard test with Excel/LibreOffice in GEOxyz's browsers (here a synthetic ClipboardEvent in Chromium)
4. Pre-existing: default settings are booleans but JS tests for '1', so the plugin is inactive until settings are saved once

**Checks**

5. Run the plugin's whole test suite on Redmine 7.0-stable-GEOxyz with PostgreSQL AND MariaDB, and once on 5.1-stable if the branch is meant to stay 5.1-compatible.
6. Check Redmine 7 webhooks against this plugin (see "Rules"), and note the result here even if nothing is needed.
7. Verify every feature of the plugin by hand on a running Redmine 7 (screenshots).

## Result of the migration session (2026-10-06)

**Baseline** (before any change, Redmine 7.0-stable-GEOxyz, PostgreSQL 16): the plugin had no tests;
smoke 11 screenshots / 0 problems, core flows 6 / 0.

**After** (commits `ee171d9`, `4f1b121`, and the e2e commit):

| | PostgreSQL 16 | MariaDB 10.11 |
|---|---|---|
| plugin tests (minitest) | 8 runs, 68 assertions, 0 failures | 8 runs, 68 assertions, 0 failures |
| e2e (production mode) | smoke 11/0, core 6/0, image-paste 8/0, settings 5/0, table-paste 9/0 (screenshot count / problems) | same: 39 screenshots, 0 problems (`docs/e2e/mariadb`) |

There are no migrations. Not run: Redmine 5.1 (not required, the fixes use nothing 6/7 specific; unverified there).
OpenAI review (gpt-5): `docs/reviews/openai-2026-10-06-ce975b0.md`, no findings. Own adversarial review: see "Found, not fixed".

### Work list verdicts

1. Drop the plugin? **Kept** (see Open questions): dropping loses image paste on note edit and the TSV paste.
2. `enable_table_paste`: Jan decided to switch it off on Redmine 7 (see Decided by Jan). Until then: With `ee171d9` the plugin no longer double-pastes next to core; it only acts on tab separated plain text, which core ignores. Switch it off in the settings if that is not wanted.
3. Real clipboard test with Excel/LibreOffice: **not possible here**, synthetic `ClipboardEvent` only (list for Jan).
4. Default settings booleans vs `'1'`: **fixed** (`4f1b121`, test `ScriptTest`).
5. Tests PostgreSQL and MariaDB: done (numbers above). 6. Webhooks: nothing to do, the plugin does not change issue data or any API output. 7. Hand check on a running Redmine 7: done (e2e below).

### Fixes in `4f1b121`
- Flags `enable_*` computed server side for both booleans (defaults) and `'1'/'0'` (saved); before, a fresh install did nothing.
- Settings form posts `0` for unchecked boxes (hidden fields) and shows defaults correctly.
- Messages and text formatting emitted with `json_escape(...to_json)` instead of `html_safe` inside JS strings.
- Table paste: `|` in cells escaped (`\|` markdown, `&#124;` textile), text after the selection no longer overwritten, an `input` event fires, selection is replaced.
- Paste with `text/plain` that is not a table now falls through to image paste.

### GEOxyz commits: verdicts
All kept; their function is in the inventory with a scenario. `8c4be6c` (settings default fix) was incomplete and is completed by `4f1b121`. `7e4a161` (preview on note edit, `handlePreview`) works: covered by the image-paste scenario (tokens copied into the note form). LICENSE, README, typo, version commits: nothing to review.

### Inventory of functions

| function | how a user reaches it | scenario | screenshots (`docs/e2e/`) |
|---|---|---|---|
| Paste TSV text as table (markdown/CommonMark) | paste in any `.wiki-edit` textarea | `table-paste.mjs` | `table-paste-tsv-markdown`, `-tsv-cursor`, `-preview`, `-plain-text` |
| Paste TSV as table (textile) | same, text formatting textile | `table-paste.mjs` | `table-paste-tsv-textile` |
| No double table next to core's HTML table paste | paste HTML+TSV from a spreadsheet | `table-paste.mjs` | `table-paste-html-table-once` |
| Table paste off | setting | `table-paste.mjs` | `table-paste-setting-off` |
| Table paste as reporter / outsider | roles | `table-paste.mjs` | `table-paste-reporter`, `-outsider-private` |
| Paste image while editing a note, upload, markup, preview tokens | edit note, paste | `image-paste.mjs` | `image-paste-pasted`, `-saved` |
| Auto submit of the issue form | save note after paste | `image-paste.mjs` | `image-paste-saved` |
| Auto submit off: reminder alert | setting | `image-paste.mjs` | `image-paste-auto-submit-off` |
| Image paste off | setting | `image-paste.mjs` | `image-paste-image-paste-off` |
| Image with non-table text | paste | `image-paste.mjs` | `image-paste-image-with-text` |
| No editor for reporter / outsider / anonymous | roles | `image-paste.mjs` | `image-paste-reporter`, `-outsider-private`, `-anonymous` |
| Settings page | Administration > Plugins > Configure | `settings.mjs` | `settings-all-on`, `-all-off`, `-image-only`, `-manager-refused`, `-anonymous` |

No permissions, routes, macros, mail, API, rake tasks or cron in this plugin. Locales en, de, es, fr, nl, ro: same keys (`test/unit/locales_test.rb`).
MariaDB set of the same scenarios: `docs/e2e/mariadb/`.

### Found, not fixed (outside the minimal scope)
- With auto submit off, the note is saved with a reference to an attachment that is only saved when the issue is saved (broken image until then; the alert says so).
- `.codex/test_setup.sh` breaks as root (`$SUDO -u postgres` with empty `$SUDO`); I created the role by hand.
- Text pasted into a `.wiki-edit` that has no Stimulus table-paste (never the case in core 7) is handled by the plugin only.

### Decided by Jan (2026-10-06, after the session)
1. The plugin stays (image paste on note edit is needed).
2. On Redmine 7 `enable_table_paste` is switched off (Administration > Plugins > Configure, uncheck "Enable Table Paste", Apply). The setting is stored, so changing the default in `init.rb` would not reach an installation that saved it; it is an admin action.
3. The leading tab fix is done: `trimLineBreaks` instead of `$.trim` (e2e `table-paste-empty-first-cell`). PostgreSQL and MariaDB: 8 runs / 0 failures, e2e 40 screenshots / 0 problems each.

Core table paste versus the plugin's: core is better for everything a spreadsheet produces (HTML table on the clipboard: escapes `|`, turns line breaks in a cell into `<br>`, pads uneven rows, undo works). The plugin only adds plain tab separated text without HTML (editors, terminals), which core ignores. Excel, LibreOffice and Google Sheets always put HTML on the clipboard, so with the plugin's table paste off nothing is lost for them.

### Still to do by a person
- Real clipboard test with Excel/LibreOffice in the GEOxyz browsers.

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

- Kept (see Open questions): nothing is required, no migrations. Open Administration > Plugins > Configure once to check the options. If you decide to drop it: uninstall on 5.1 before the upgrade (`rake redmine:plugins:migrate NAME=redmine_paste_as_wiki_tables VERSION=0`, then remove).

## How to test

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

The coordinator's harness (`plugin-check.sh` in the migration kit, kept outside this repo) adds a
browser smoke test of every page the plugin adds and runs all GEOxyz plugins together; the
results quoted in the analysis come from it.

## How the migration session works (same for every plugin)

1. **Start**: `git fetch && git checkout redmine70-migration && git pull`. Read this whole file,
   including the analysis report at the bottom. Do not reopen decisions recorded here.
2. **Baseline, before you change anything**:
   - the plugin's tests on Redmine 7.0-stable-GEOxyz with PostgreSQL and with MariaDB;
   - a real running Redmine with this plugin (`./.codex/start_server.sh`) and the browser run
     (`./.codex/e2e.sh`: smoke over every page the plugin adds, plus the core issue flows).
   Write the numbers here. Something already broken now is a finding, not your regression.
3. **Inventory of functions**: list every function of the plugin in this file, in a table
   "function | how a user reaches it | scenario | screenshot". Take them from the README,
   `init.rb` (permissions, menus, settings, project modules), routes, hooks and view
   overrides, macros, mail handling, API endpoints, rake tasks and cron jobs. This table is the
   coverage list for step 8; a function that is not in it will not be tested.
4. **GEOxyz changes**: go through the table above, one item at a time. Each kept or re-made change
   is its own commit with a test that proves it. Record the verdict in the table.
5. **Work list**: then the numbered list, in order. One concern per commit.
6. **Portability**: everything must run on Redmine's supported databases (PostgreSQL,
   MySQL/MariaDB; SQLite where the plugin already supports it). Migrations must be reversible and
   are run down and up on PostgreSQL and MariaDB.
7. **Together**: run with the other GEOxyz plugins installed (the migration kit's harness, or
   `RMP_EXTRA_PLUGINS`). A failure that only appears in combination is a finding to record here.
8. **End to end, visually, every function**: on the real Redmine from `start_server.sh`
   (production mode, the way GEOxyz runs it), write one scenario per function in
   `test/e2e/<function>.mjs` with `.codex/e2e/lib.mjs` and run them with `./.codex/e2e.sh`.
   - Each function as the users that matter: `admin`, `manager` (every permission, the
     plugin's included), `reporter` (member without the plugin's permissions), `outsider`
     (no membership, private project must stay invisible).
   - The failure paths too: setting off, permission absent, empty state, invalid input, the
     value that used to raise. A refusal that is shown is evidence as much as a success.
   - One screenshot per function and per path, with a caption saying what it proves. Open
     every screenshot and look at it: a picture nobody looked at proves nothing. Commit them
     in `docs/e2e/` and list them in the inventory table.
   - Functions without a page (mail in and out, REST API, rake tasks, cron, webhooks): exercise
     them against the same running instance (mails land in `redmine/tmp/mails`, `t.mails()`
     reads them; API through `t.page.request`) and record command and result.
   - Before pictures where behaviour or layout changes: the branch GEOxyz runs today, on
     Redmine 5.1, same scenarios, `RMP_E2E_OUT=docs/e2e/before`.
   - Run the whole e2e set once on MariaDB as well (`RMP_DB=mariadb`, then `start_server.sh --reset`).
9. **Independent review**: first your own, adversarial: re-read the whole diff as if someone
   else wrote it and you are paid to reject it. Then, **when `OPENAI_API_KEY` is set in the
   session**, `./.codex/openai_review.sh`: it sends the diff of this branch to an OpenAI model
   and writes `docs/reviews/openai-<date>-<sha>.md`. Every finding gets a `Resolution:` line
   there (fixed in <commit>, with a test, or why not). Fix, re-run the tests and the e2e set,
   and run the review again until it has nothing new that you accept. Without the key: write
   "OpenAI review: skipped, no OPENAI_API_KEY" in the report; never send code anywhere else.
10. **After the upgrade**: anything the production upgrade must do for this plugin (data fixes,
    settings, cron, files, removed features) goes into the section "After the upgrade".
11. **Finish**: update "Status", the inventory and the work list in this file, push
    `redmine70-migration`, and report: what changed, test numbers on both databases, e2e
    numbers (scenarios, screenshots, problems), the review result, what is left, what needs Jan.

### Stop and ask Jan when
- a GEOxyz change would be lost or behave differently for users;
- a new gem, a new setting with user impact, or a schema change not required by Redmine 7 seems needed;
- the change would send data to an external service (the OpenAI review of the code diff is the
  one exception Jan approved, and only when the key is present);
- upstream and GEOxyz disagree on behaviour and both are defensible.

## Rules

- **Target**: Redmine 7.0-stable-GEOxyz (https://github.com/jcatrysse/redmine), Rails 8.1, Ruby 3.3+.
  Core sources for comparison: branches `5.1-stable`, `6.1-stable`, `7.0-stable`, `7.0-stable-GEOxyz`.
- **Evidence**: never report a test, lint, browser check or review as passed without having seen
  it. Quote the summary lines; list the screenshots. "Should work" is not a result, and a green
  test suite is not proof that a feature works in the browser.
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
  `ContextMenus::*Controller`, Loofah-based text formatting, Chart.js as an ES module, sudo mode
  (on by default: `t.sudo()` in a scenario). The breaker list is in the migration kit's CHECKLIST.md.
- **Locales**: keep the locales the plugin ships in sync; translate a new key by matching the
  closest existing key in the same file, not from scratch; do not add new languages.
- **5.1 compatibility**: prefer fixes that also run on Redmine 5.1 so they can be merged early;
  say so when a fix cannot.
- **Git**: work on `redmine70-migration` only; never push to the default branch; never force-push
  a branch someone else uses. Descriptive commit messages (what and why). Push after every
  commit, together with the updated status in this file: a cloud session can stop at a usage
  limit, and work that is not pushed is lost with its container.
- **GitHub Actions**: manual only (`workflow_dispatch`). Do not add push, pull_request or schedule
  triggers.

## Definition of done

- All items of the work list are done or explicitly deferred with a reason, in this file.
- The plugin's tests are green on Redmine 7.0-stable-GEOxyz with PostgreSQL and MariaDB
  (numbers in this file); boot, production-like eager load, migrations up/down OK.
- Every function in the inventory exercised end to end on a real running Redmine, with and
  without permissions and on its failure paths; `./.codex/e2e.sh` green; screenshots looked at,
  committed in `docs/e2e/` and listed.
- Review done: your own, and the OpenAI review when the key is present, every finding resolved
  in `docs/reviews/`.
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

