// Function: paste a clipboard image while editing an existing note: it is uploaded as an
// attachment of the issue, the markup lands in the note, and (optionally) the issue form is
// submitted automatically after the note is saved.
import { e2e } from '../../.codex/e2e/lib.mjs';
import { paste, PNG, setPluginSettings } from '../e2e-support/helpers.mjs';

const t = await e2e('image-paste');
const NOTE = '#journal_2_notes';
const expect = (name, got, want) => { if (got !== want) t.problems.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
// the note is saved before the issue form (and its attachment), so its image 404s for a moment
const ORPHAN = { requests: ['clipboard-'] };
const ON = { enable_table_paste: true, enable_image_paste: true, enable_auto_submit: true };

async function openNoteEditor() {
  await t.go('/issues/1', { allow: ORPHAN });
  await t.page.click('#history a[href="/journals/2/edit"]');
  await t.page.waitForSelector(NOTE);
}
const attachmentCount = () => t.page.evaluate(async () => {
  const r = await fetch('/issues/1.json?include=attachments', { headers: { Accept: 'application/json' } });
  return (await r.json()).issue.attachments.length;
});

await setPluginSettings(t, ON);

// put the seeded note back (the first run leaves it, or an earlier run, with pasted images)
async function resetNote() {
  await t.login('manager');
  await openNoteEditor();
  await t.page.fill(NOTE, 'A note from the manager.');
  await t.page.click(`form[id^="journal-2"] input[type=submit]`);
  await t.page.waitForSelector(NOTE, { state: 'detached' });
  await t.settle();
  t.check('reset note', ORPHAN);
}
await resetNote();

// manager: paste an image into the note editor
await t.login('manager');
await openNoteEditor();
const before = await attachmentCount();
const prevented = await paste(t.page, NOTE, { 'image/png': PNG });
await t.page.waitForFunction(sel => /clipboard-\d{12}-[a-z0-9]{5}\.png/.test(document.querySelector(sel).value), NOTE);
const markup = await t.page.inputValue(NOTE);
await t.page.waitForSelector('#issue-form .attachments_fields input.token[value]:not([value=""])', { state: 'attached' });
await t.page.waitForSelector('#update', { state: 'visible' });
await t.shot('pasted', `The pasted image is uploaded and the markup (inserted by Redmine) is in the note: ${JSON.stringify(markup)}; the issue form (#update) is open`);

// saving the note submits the issue form too (auto submit on), so the attachment is stored
await t.page.click(`form#journal-2-form input[type=submit][name=commit], form[id^="journal-2"] input[type=submit]`);
await t.page.waitForURL(/\/issues\/1/);
await t.settle();
expect('attachment stored', await attachmentCount(), before + 1);
t.check('save note', ORPHAN);
await t.go('/issues/1'); // a fresh load: the image is an attachment now, no 404
const shown = await t.page.locator('#journal-2-notes img[src*="clipboard-"]').evaluateAll(i => i.map(x => x.naturalWidth > 0));
expect('the pasted image is displayed', shown.length >= 1 && shown.every(Boolean), true);
await t.shot('saved', 'After saving the note the image is shown inline and is an attachment of the issue');

// auto submit off: saving the note only warns that the issue must be saved
await setPluginSettings(t, { ...ON, enable_auto_submit: false });
await t.login('manager');
await openNoteEditor();
let dialog = '';
t.page.on('dialog', async d => { dialog = d.message(); await d.accept(); });
await paste(t.page, NOTE, { 'image/png': PNG });
await t.page.waitForFunction(sel => /clipboard-/.test(document.querySelector(sel).value), NOTE);
await t.page.waitForSelector('#issue-form .attachments_fields input.token[value]:not([value=""])', { state: 'attached' });
await t.page.click(`form[id^="journal-2"] input[type=submit]`);
await t.settle();
if (!/save your issue/i.test(dialog)) t.problems.push('auto submit off: no reminder shown, got ' + JSON.stringify(dialog));
await t.page.waitForTimeout(1500);
t.check('save note without auto submit', ORPHAN);
await t.shot('auto-submit-off', `With auto submit off the user is reminded to save the issue: ${JSON.stringify(dialog)}`);

// image paste off: nothing is uploaded
await setPluginSettings(t, { ...ON, enable_image_paste: false });
await t.login('manager');
await openNoteEditor();
const noteBefore = await t.page.inputValue(NOTE);
await paste(t.page, NOTE, { 'image/png': PNG });
await t.page.waitForTimeout(1500);
expect('image paste off: note unchanged', await t.page.inputValue(NOTE), noteBefore);
expect('image paste off: no upload token', await t.page.locator('#issue-form .attachments_fields input.token').count(), 0);
await t.shot('image-paste-off', 'With "Enable Image Paste" off a pasted image does nothing', { full: false });

// an image together with non-table text (as some applications copy) still uploads the image
await setPluginSettings(t, ON);
await t.login('manager');
await openNoteEditor();
const noteBefore2 = await t.page.inputValue(NOTE);
await paste(t.page, NOTE, { 'text/plain': 'screenshot.png', 'image/png': PNG });
await t.page.waitForFunction(([sel, old]) => document.querySelector(sel).value.length > old.length, [NOTE, noteBefore2]);
await t.shot('image-with-text', 'An image that comes with plain (non-table) text is still uploaded');

// reporter: cannot edit the manager's note, so there is no editor to paste into
await t.login('reporter');
await t.go('/issues/1', { allow: ORPHAN });
expect('reporter has no edit link', await t.page.locator('#history a[href="/journals/2/edit"]').count(), 0);
await t.shot('reporter', 'A reporter has no edit link on the manager\'s note: no place to paste an image');

// outsider and anonymous: the private project stays invisible
await t.login('outsider');
await t.go('/issues/6', { status: 403 });
await t.shot('outsider-private', 'An outsider cannot open an issue of the private project');
await t.anonymous();
await t.go('/issues/1', { allow: ORPHAN });
expect('anonymous has no edit link', await t.page.locator('#history a[href="/journals/2/edit"]').count(), 0);
await t.shot('anonymous', 'Anonymous users see the issue without an editor');

// leave no note that points to an attachment that was never saved
await resetNote();
await t.go('/issues/1');

await t.done();
