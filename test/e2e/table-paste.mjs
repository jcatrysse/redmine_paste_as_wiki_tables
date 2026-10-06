// Function: paste tab separated text (a spreadsheet selection copied as plain text) into a
// wiki textarea and get a wiki table.
import { e2e } from '../../.codex/e2e/lib.mjs';
import { paste, setPluginSettings, setTextFormatting } from '../e2e-support/helpers.mjs';

const t = await e2e('table-paste');
const NEW = '/projects/e2e-project/issues/new';
const TSV = 'Name\tValue\nalpha\ta|b\nbeta\t2';
const value = () => t.page.inputValue('#issue_description');
const expect = (name, got, want) => { if (got !== want) t.problems.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };

await setTextFormatting(t, 'common_mark');
await setPluginSettings(t, { enable_table_paste: true, enable_image_paste: true, enable_auto_submit: true });

// manager: every permission
await t.login('manager');
await t.go(NEW);
await t.page.fill('#issue_description', '');
let prevented = await paste(t.page, '#issue_description', { 'text/plain': TSV });
expect('tsv prevented', prevented, true);
expect('tsv markdown', await value(), '| Name | Value |\n|---|---|\n| alpha | a\\|b |\n| beta | 2 |\n');
await t.shot('tsv-markdown', 'Tab separated text becomes a CommonMark table; the pipe in a cell is escaped');

// text after the cursor survives
await t.page.fill('#issue_description', 'before AFTER');
await t.page.evaluate(() => { const e = document.querySelector('#issue_description'); e.setSelectionRange(7, 7); });
await paste(t.page, '#issue_description', { 'text/plain': 'a\tb\nc\td' });
expect('keeps text after cursor', await value(), 'before | a | b |\n|---|---|\n| c | d |\nAFTER');
await t.shot('tsv-cursor', 'Pasting in the middle keeps the text after the cursor');

// the selection is replaced
await t.page.fill('#issue_description', 'xxSELECTEDyy');
await t.page.evaluate(() => { const e = document.querySelector('#issue_description'); e.setSelectionRange(2, 10); });
await paste(t.page, '#issue_description', { 'text/plain': 'a\tb\nc\td' });
expect('replaces selection', await value(), 'xx| a | b |\n|---|---|\n| c | d |\nyy');

// an empty first cell (a copied range that starts with an empty cell) is a leading tab
await t.page.fill('#issue_description', '');
prevented = await paste(t.page, '#issue_description', { 'text/plain': '\tB\tC\n1\t2\t3\n' });
expect('empty first cell prevented', prevented, true);
expect('empty first cell', await value(), '|  | B | C |\n|---|---|---|\n| 1 | 2 | 3 |\n');
await t.shot('empty-first-cell', 'A range that starts with an empty cell is still recognised as a table', { full: false });

// plain text is left alone (default paste, nothing prevented)
await t.page.fill('#issue_description', '');
prevented = await paste(t.page, '#issue_description', { 'text/plain': 'just a sentence' });
expect('plain text not prevented', prevented, false);
prevented = await paste(t.page, '#issue_description', { 'text/plain': 'a\tb\nc' });
expect('uneven rows not prevented', prevented, false);
await t.shot('plain-text', 'Plain text and uneven rows are not touched by the plugin', { full: false });

// a spreadsheet puts HTML and TSV on the clipboard: Redmine 7 builds the table, the plugin must not add a second one
await t.page.fill('#issue_description', '');
const html = '<table><tr><td>A</td><td>B|x</td></tr><tr><td>1</td><td>2</td></tr></table>';
prevented = await paste(t.page, '#issue_description', { 'text/html': html, 'text/plain': 'A\tB|x\n1\t2' });
expect('html table prevented', prevented, true);
const tables = ((await value()).match(/^\| A /gm) || []).length;
expect('html table inserted once', tables, 1);
await t.shot('html-table-once', 'A spreadsheet paste (HTML plus text) gives one table, not two');

// the pasted table renders as a table in the preview
await t.page.fill('#issue_description', '');
await paste(t.page, '#issue_description', { 'text/plain': TSV });
await t.page.click('#issue_description >> xpath=ancestor::div[contains(@class,"jstBlock")]//a[contains(@class,"tab-preview")]');
await t.settle();
await t.page.waitForSelector('#preview_issue_description table');
await t.shot('preview', 'The preview renders the pasted text as a table');

// textile
await setTextFormatting(t, 'textile');
await t.login('manager');
await t.go(NEW);
await t.page.fill('#issue_description', '');
await paste(t.page, '#issue_description', { 'text/plain': TSV });
expect('tsv textile', await value(), '| _.Name | _.Value |\n| alpha | a&#124;b |\n| beta | 2 |\n');
await t.shot('tsv-textile', 'With textile formatting the header cells use _. and the pipe becomes &#124;');
await setTextFormatting(t, 'common_mark');

// the table paste can be switched off
await setPluginSettings(t, { enable_table_paste: false, enable_image_paste: true, enable_auto_submit: true });
await t.login('manager');
await t.go(NEW);
await t.page.fill('#issue_description', '');
prevented = await paste(t.page, '#issue_description', { 'text/plain': TSV });
expect('setting off: not prevented', prevented, false);
expect('setting off: nothing inserted by the plugin', await value(), '');
await t.shot('setting-off', 'With "Enable Table Paste" off the plugin leaves the paste alone', { full: false });
await setPluginSettings(t, { enable_table_paste: true, enable_image_paste: true, enable_auto_submit: true });

// reporter (a member without any plugin permission, there are none): works the same
await t.login('reporter');
await t.go(NEW);
await t.page.fill('#issue_description', '');
await paste(t.page, '#issue_description', { 'text/plain': TSV });
expect('reporter', (await value()).startsWith('| Name | Value |'), true);
await t.shot('reporter', 'A reporter gets the same table paste');

// outsider: the public project works, the private one is refused
await t.login('outsider');
await t.go('/projects/e2e-private/issues/new', { status: 403 });
await t.shot('outsider-private', 'An outsider is refused on the private project: no form, no script');
const privateScript = await t.page.locator('textarea.wiki-edit').count();
expect('no wiki textarea on the refusal', privateScript, 0);

await t.done();
