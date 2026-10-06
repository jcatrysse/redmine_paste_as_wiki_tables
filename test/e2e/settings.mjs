// Function: the plugin's settings page (Administration > Plugins > Configure).
import { e2e } from '../../.codex/e2e/lib.mjs';

const t = await e2e('settings');
const URL = '/settings/plugin/redmine_paste_as_wiki_tables';
const KEYS = ['enable_table_paste', 'enable_image_paste', 'enable_auto_submit'];
const expect = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) t.problems.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const states = () => Promise.all(KEYS.map(k => t.page.locator(`#settings_${k}`).isChecked()));

async function open() {
  await t.go(URL);
  await t.sudo();
  await t.page.waitForSelector('#settings_enable_table_paste');
}
async function save() {
  await t.page.click('#content input[type=submit]');
  await t.settle();
  t.check('save');
}

await t.login('admin');
await open();
await t.page.locator('#settings_enable_table_paste').setChecked(true);
await t.page.locator('#settings_enable_image_paste').setChecked(true);
await t.page.locator('#settings_enable_auto_submit').setChecked(true);
await save();
await open();
expect('all on after save', await states(), [true, true, true]);
await t.shot('all-on', 'The three options are checked after saving them checked');

// every box unchecked must be saved (a form with no checked box posts nothing without the hidden fields)
for (const k of KEYS) await t.page.locator(`#settings_${k}`).setChecked(false);
await save();
await open();
expect('all off after save', await states(), [false, false, false]);
await t.shot('all-off', 'Saving with every option unchecked works and keeps them off');

// and the script on a page follows
await t.login('manager');
await t.go('/issues/1', { allow: { requests: ['clipboard-'] } }); // orphan image left by the image paste scenario
const flags = await t.page.evaluate(() => [...document.scripts].map(s => s.text).find(x => x.includes('enableTablePaste')).match(/const enable\w+ = (true|false)/g));
expect('script flags', flags, ['const enableTablePaste = false', 'const enableImagePaste = false', 'const enableAutoSubmit = false']);

// one on, two off
await t.login('admin');
await open();
await t.page.locator('#settings_enable_image_paste').setChecked(true);
await save();
await open();
expect('only image paste', await states(), [false, true, false]);
await t.shot('image-only', 'Only image paste is on');

// back to the defaults
for (const k of KEYS) await t.page.locator(`#settings_${k}`).setChecked(true);
await save();

// not an admin: refused
await t.login('manager');
await t.go(URL, { status: 403 });
await t.shot('manager-refused', 'A non-admin (even with every project permission) is refused');
await t.login('reporter');
await t.go(URL, { status: 403 });
await t.anonymous();
await t.go(URL, { status: 200 }); // redirected to the login page
expect('anonymous sees the login form', await t.page.locator('#login-submit').count(), 1);
await t.shot('anonymous', 'Anonymous users get the login form');

await t.done();
