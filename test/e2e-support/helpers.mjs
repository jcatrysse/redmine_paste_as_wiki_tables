// Shared by the scenarios in test/e2e (not a scenario itself, so it lives outside that folder).

// Saves the plugin's settings as admin, in a fresh login. Pass the flags that must be checked.
export async function setPluginSettings(t, on) {
  await t.login('admin');
  await t.go('/settings/plugin/redmine_paste_as_wiki_tables');
  await t.sudo();
  if (!(await t.page.locator('#settings_enable_table_paste').count())) await t.go('/settings/plugin/redmine_paste_as_wiki_tables');
  for (const key of ['enable_table_paste', 'enable_image_paste', 'enable_auto_submit']) {
    await t.page.locator(`#settings_${key}`).setChecked(!!on[key]);
  }
  await t.page.click('input[type=submit]');
  await t.settle();
  t.check('save plugin settings');
}

// Sets the text formatting as admin (common_mark, markdown or textile).
export async function setTextFormatting(t, formatting) {
  await t.login('admin');
  await t.go('/settings?tab=general');
  await t.sudo();
  await t.page.selectOption('#settings_text_formatting', formatting);
  await t.page.click('#tab-content-general input[type=submit]');
  await t.settle();
  t.check('save text formatting');
}

// Dispatches a paste event with the given clipboard types on a textarea, like a browser would.
// Returns whether something (Redmine's own table paste, or the plugin) called preventDefault().
export async function paste(page, selector, data) {
  return page.evaluate(({ selector, data }) => {
    const el = document.querySelector(selector);
    el.focus();
    const dt = new DataTransfer();
    for (const [type, value] of Object.entries(data)) {
      if (type.startsWith('image/')) {
        const bytes = Uint8Array.from(atob(value), c => c.charCodeAt(0));
        dt.items.add(new File([bytes], `image.${type.split('/')[1]}`, { type }));
      } else {
        dt.setData(type, value);
      }
    }
    const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    return ev.defaultPrevented;
  }, { selector, data });
}

// 1x1 transparent PNG
export const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
